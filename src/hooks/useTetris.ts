import { useCallback, useEffect, useState } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';
import { useInterval } from './useInterval';
import { BOARD_HEIGHT, getRandomBlock, hasCollisions, useTetrisBoard } from './useTetrisBoard';

enum TickSpeed {
	Normal = 800,
	Sliding = 100,
	Fast = 50
}

export default function useTetris() {
	const [score, setScore] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isCommitting, setIsCommitting] = useState(false);
	const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
	const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);

	const [{ board, droppingRow, droppingColumn, droppingBlock, droppingShape }, dispatchBoardState] =
		useTetrisBoard();

	const startGame = useCallback(() => {
		const startingBlocks = [getRandomBlock(), getRandomBlock(), getRandomBlock()];
		setScore(0);
		setUpcomingBlocks(startingBlocks);
		setIsPlaying(true);
		setTickSpeed(TickSpeed.Normal);
		dispatchBoardState({ type: 'start' });
	}, [dispatchBoardState]);

	const commitPosition = useCallback(() => {
		if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
			setIsCommitting(false);
			setTickSpeed(TickSpeed.Normal);
			return;
		}
		const newBoard = structuredClone(board) as BoardShape;
		addShapeToBoard(newBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);

		let numCleared = 0;
		for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
			if (newBoard[row].every((cell) => cell !== EmptyCell.Empty)) {
				numCleared++;
				newBoard.splice(row, 1);
			}
		}

		const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
		const newBlock = newUpcomingBlocks.pop() as Block;
		newUpcomingBlocks.unshift(getRandomBlock());

		if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
			setIsPlaying(false);
			setTickSpeed(null);
		} else {
			setTickSpeed(TickSpeed.Normal);
		}

		setScore((prev) => prev + getPoints(numCleared));
		setIsCommitting(false);
		setTickSpeed(TickSpeed.Normal);
		setUpcomingBlocks(newUpcomingBlocks);
		dispatchBoardState({ type: 'commit', newBoard, newBlock });
	}, [
		board,
		dispatchBoardState,
		droppingBlock,
		droppingColumn,
		droppingRow,
		droppingShape,
		upcomingBlocks
	]);

	const gameTick = useCallback(() => {
		if (isCommitting) {
			commitPosition();
		} else if (hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
			setTickSpeed(TickSpeed.Sliding);
			setIsCommitting(true);
		} else {
			dispatchBoardState({ type: 'drop' });
		}
	}, [
		board,
		commitPosition,
		dispatchBoardState,
		droppingColumn,
		droppingRow,
		droppingShape,
		isCommitting
	]);

	useInterval(() => {
		if (!isPlaying) {
			return;
		}
		gameTick();
	}, tickSpeed);

	useEffect(() => {
		if (!isPlaying) {
			return;
		}

		let isPressingLeft = false;
		let isPressingRight = false;
		let moveIntervalID: number | undefined;

		const updateMovementInterval = () => {
			clearInterval(moveIntervalID);
			dispatchBoardState({ type: 'move', isPressingLeft, isPressingRight });

			moveIntervalID = setInterval(
				() => dispatchBoardState({ type: 'move', isPressingLeft, isPressingRight }),
				100
			);
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.repeat) {
				return;
			}

			if (e.key === 'ArrowDown') {
				setTickSpeed(TickSpeed.Fast);
			}

			if (e.key === 'ArrowUp') {
				dispatchBoardState({ type: 'move', isRotating: true });
			}

			if (e.key === 'ArrowLeft') {
				isPressingLeft = true;
				updateMovementInterval();
			}

			if (e.key === 'ArrowRight') {
				isPressingRight = true;
				updateMovementInterval();
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'ArrowDown') {
				setTickSpeed(TickSpeed.Normal);
			}

			if (e.key === 'ArrowLeft') {
				isPressingLeft = false;
				updateMovementInterval();
			}

			if (e.key === 'ArrowRight') {
				isPressingRight = false;
				updateMovementInterval();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			clearInterval(moveIntervalID);
			setTickSpeed(TickSpeed.Normal);
		};
	}, [dispatchBoardState, isPlaying]);

	const renderedBoard = structuredClone(board) as BoardShape;

	if (isPlaying) {
		addShapeToBoard(renderedBoard, droppingBlock, droppingShape, droppingRow, droppingColumn);
	}

	return { board: renderedBoard, startGame, isPlaying, score, upcomingBlocks };
}

function addShapeToBoard(
	board: BoardShape,
	droppingBlock: Block,
	droppingShape: BlockShape,
	droppingRow: number,
	droppingColumn: number
) {
	droppingShape
		.filter((row) => row.some((isSet) => isSet))
		.forEach((row: boolean[], rowIndex: number) => {
			row.forEach((isSet: boolean, columIndex: number) => {
				if (isSet) {
					board[droppingRow + rowIndex][droppingColumn + columIndex] = droppingBlock;
				}
			});
		});
}

function getPoints(numClearedRows: number): number {
	switch (numClearedRows) {
		case 0:
			return 0;
		case 1:
			return 100;
		case 2:
			return 300;
		case 3:
			return 500;
		case 4:
			return 800;
		default:
			throw new Error('Unexpected number of rows cleared');
	}
}
