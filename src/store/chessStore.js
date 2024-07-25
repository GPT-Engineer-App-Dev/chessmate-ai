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

  onDrop: (sourceSquare, targetSquare) => {
    const move = get().makeMove(sourceSquare, targetSquare);
    if (move) {
      setTimeout(makeAIMove, 300);
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

const makeAIMove = () => {
  const { game, makeMove } = useChessStore.getState();
  if (game.isGameOver() || game.turn() !== 'b') return;

  const moves = game.moves();
  const move = moves[Math.floor(Math.random() * moves.length)];
  const [from, to] = move.match(/[a-h][1-8]/g) || [];
  
  if (from && to) {
    makeMove(from, to);
  }
};

export default useChessStore;
