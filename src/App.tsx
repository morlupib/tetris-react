import Board from './components/Board';
import UpcomingBlocks from './components/UpcomingBlocks';
import useTetris from './hooks/useTetris';

function App() {
	const { board, startGame, isPlaying, score, upcomingBlocks } = useTetris();

	return (
		<main>
			<img src="./logo.png" className="logo" alt="Titulo del juego" />
			{isPlaying ? (
				<section className="game">
					<Board currentBoard={board} />
					<section className="controls">
						<div className="board">
							<h2 className="score">Score: {score}</h2>
						</div>
						<UpcomingBlocks upcomingBlocks={upcomingBlocks} />
					</section>
				</section>
			) : (
				<button onClick={startGame}>Start Game</button>
			)}
		</main>
	);
}

export default App;
