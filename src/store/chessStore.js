import { create } from 'zustand';
import { Chess } from 'chess.js';

const useChessStore = create((set, get) => ({
  game: new Chess(),
  status: '',
  turn: 'w',
  moveFrom: '',
  possibleMoves: [],

  makeMove: (from, to) => {
    const { game } = get();
    try {
      const move = game.move({
        from,
        to,
        promotion: 'q', // always promote to queen for simplicity
      });

      if (move) {
        set({
          game: game,
          status: getGameStatus(game),
          turn: game.turn(),
        });
        return true;
      }
    } catch (error) {
      return false;
    }
  },

  onDrop: async (sourceSquare, targetSquare) => {
    const move = get().makeMove(sourceSquare, targetSquare);
    if (move) {
      await makeAIMove();
      return true;
    }
    return false;
  },

  setMoveFrom: (square) => set({ moveFrom: square }),

  setPossibleMoves: (moves) => set({ possibleMoves: moves }),

  resetGame: () => {
    const newGame = new Chess();
    set({
      game: newGame,
      status: '',
      turn: 'w',
      moveFrom: '',
      possibleMoves: [],
    });
  },
}));

const getGameStatus = (game) => {
  if (game.isCheckmate()) return 'Checkmate!';
  if (game.isDraw()) return 'Draw!';
  if (game.isStalemate()) return 'Stalemate!';
  if (game.isThreefoldRepetition()) return 'Draw by repetition!';
  if (game.isInsufficientMaterial()) return 'Draw by insufficient material!';
  return game.inCheck() ? 'Check!' : '';
};

const makeAIMove = async () => {
  const { game, makeMove } = useChessStore.getState();
  if (game.isGameOver() || game.turn() !== 'b') return;

  try {
    const response = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(game.fen())}`);
    const data = await response.json();

    if (data.pvs && data.pvs.length > 0) {
      const bestMove = data.pvs[0].moves.split(' ')[0];
      const from = bestMove.slice(0, 2);
      const to = bestMove.slice(2, 4);
      makeMove(from, to);
    } else {
      // Fallback to random move if API doesn't return a move
      const moves = game.moves({ verbose: true });
      const move = moves[Math.floor(Math.random() * moves.length)];
      makeMove(move.from, move.to);
    }
  } catch (error) {
    console.error('Error fetching AI move:', error);
    // Fallback to random move on error
    const moves = game.moves({ verbose: true });
    const move = moves[Math.floor(Math.random() * moves.length)];
    makeMove(move.from, move.to);
  }
};

export default useChessStore;
