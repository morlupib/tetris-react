import { Dispatch, useReducer } from 'react';
import { Action, boardReducer } from '../reducer/useTetrisBoard';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';

export const BOARD_WIDTH = 12;
export const BOARD_HEIGHT = 24;

export type BoardState = {
	board: BoardShape;
	droppingRow: number;
	droppingColumn: number;
	droppingBlock: Block;
	droppingShape: BlockShape;
};

export function useTetrisBoard(): [BoardState, Dispatch<Action>] {
	const [boardState, dispatchBoardState] = useReducer(
		boardReducer,
		{
			board: [],
			droppingRow: 0,
			droppingColumn: 0,
			droppingBlock: Block.I,
			droppingShape: SHAPES.I.shape
		},
		(emptyState) => {
			const state = { ...emptyState, board: getEmptyBoard() };
			return state;
		}
	);
	return [boardState, dispatchBoardState];
}

export function getEmptyBoard(height = BOARD_HEIGHT) {
	return Array(height)
		.fill(null)
		.map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

export function getRandomBlock() {
	const blockValues = Object.values(Block);
	return blockValues[Math.floor(Math.random() * blockValues.length)] as Block;
}

export function hasCollisions(
	board: BoardShape,
	currentShape: BlockShape,
	row: number,
	column: number
): boolean {
	let hasCollisions = false;

	currentShape
		.filter((shapeRow) => shapeRow.some((isSet) => isSet))
		.forEach((shapeRow, rowIndex) => {
			shapeRow.forEach((isSet, columnIndex) => {
				if (
					isSet &&
					(row + rowIndex >= board.length ||
						column + columnIndex >= board[0].length ||
						board[row + rowIndex][column + columnIndex] !== EmptyCell.Empty)
				) {
					hasCollisions = true;
				}
			});
		});

	return hasCollisions;
}

export function rotateBlock(shape: BlockShape): BlockShape {
	const rows = shape.length;
	const columns = shape[0].length;

	const newShape = Array(rows)
		.fill(null)
		.map(() => Array(columns).fill(false));

	shape.forEach((shapeRow, rowIndex) => {
		shapeRow.forEach((block, columnIndex) => {
			newShape[columnIndex][rows - 1 - rowIndex] = block;
		});
	});

	return newShape;
}
