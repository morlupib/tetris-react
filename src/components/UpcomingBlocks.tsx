import { Block, SHAPES } from '../types';

interface Props {
	upcomingBlocks: Block[];
}

export default function UpcomingBlocks({ upcomingBlocks }: Props) {
	return (
		<div className="upcoming board">
			{upcomingBlocks.map((block, index) => {
				const shape = SHAPES[block].shape.filter((row) => row.some((cell) => cell));
				return (
					<div key={index}>
						{shape.map((row, rowIndex) => (
							<div className="row" key={rowIndex}>
								{row.map((isSet, colIndex) => {
									const cellClass = isSet ? block : 'hidden';
									const key = `${rowIndex}-${colIndex}`;
									return <div className={`cell ${cellClass}`} key={key} />;
								})}
							</div>
						))}
					</div>
				);
			})}
		</div>
	);
}
