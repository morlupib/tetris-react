import {
	BOARD_HEIGHT,
	BoardState,
	getEmptyBoard,
	getRandomBlock,
	hasCollisions,
	rotateBlock
} from '../hooks/useTetrisBoard';
import { Block, BoardShape, SHAPES } from '../types';

export type Action = {
	type: 'start' | 'drop' | 'commit' | 'move';
	newBoard?: BoardShape;
	newBlock?: Block;
	isPressingLeft?: boolean;
	isPressingRight?: boolean;
	isRotating?: boolean;
};

export function boardReducer(state: BoardState, action: Action): BoardState {
	const newState = { ...state };

	switch (action.type) {
		case 'start': {
			const firstBlock = getRandomBlock();
			return {
				board: getEmptyBoard(),
				droppingRow: 0,
				droppingColumn: 3,
				droppingBlock: firstBlock,
				droppingShape: SHAPES[firstBlock].shape
			};
		}
		case 'drop':
			newState.droppingRow++;
			break;
		case 'commit':
			return {
				board: [...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length), ...action.newBoard!],
				droppingRow: 0,
				droppingColumn: 3,
				droppingBlock: action.newBlock!,
				droppingShape: SHAPES[action.newBlock!].shape
			};
		case 'move':
			const rotatedShape = action.isRotating
				? rotateBlock(newState.droppingShape)
				: newState.droppingShape;

			let columnOffset = action.isPressingLeft ? -1 : 0;
			columnOffset = action.isPressingRight ? 1 : columnOffset;

			if (
				!hasCollisions(
					newState.board,
					rotatedShape,
					newState.droppingRow,
					newState.droppingColumn + columnOffset
				)
			) {
				newState.droppingColumn += columnOffset;
				newState.droppingShape = rotatedShape;
			}
			break;
		default: {
			const unhandleType: never = action.type;
			throw new Error(`Unhandled action type : ${unhandleType}`);
		}
	}

	return newState;
}
