import React, { useCallback, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import useChessStore from '../store/chessStore';
import { Button } from '@/components/ui/button';

const Chess = () => {
  const { game, status, turn, moveFrom, possibleMoves, onDrop, setMoveFrom, setPossibleMoves, resetGame } = useChessStore();
  const [isThinking, setIsThinking] = useState(false);

  const onSquareClick = useCallback((square) => {
    function getMoveOptions(square) {
      const moves = game.moves({
        square,
        verbose: true,
      });
      return moves.map((move) => move.to);
    }

    if (!moveFrom) {
      const hasMoves = getMoveOptions(square).length > 0;
      if (hasMoves) {
        setMoveFrom(square);
        setPossibleMoves(getMoveOptions(square));
      }
    } else {
      setIsThinking(true);
      const move = await onDrop(moveFrom, square);
      setIsThinking(false);
      if (move) {
        setMoveFrom('');
        setPossibleMoves([]);
      } else {
        const hasMoves = getMoveOptions(square).length > 0;
        if (hasMoves) {
          setMoveFrom(square);
          setPossibleMoves(getMoveOptions(square));
        } else {
          setMoveFrom('');
          setPossibleMoves([]);
        }
      }
    }
  }, [game, moveFrom, onDrop, setMoveFrom, setPossibleMoves]);

  useEffect(() => {
    setPossibleMoves([]);
  }, [turn, setPossibleMoves]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center">Chess Game</h1>
        <div className="w-[400px] h-[400px] mb-4">
          <Chessboard
            position={game.fen()}
            onSquareClick={onSquareClick}
            customSquareStyles={{
              ...Object.fromEntries(
                possibleMoves.map((move) => [move, { backgroundColor: 'rgba(255, 255, 0, 0.4)' }])
              ),
              ...(moveFrom && { [moveFrom]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } }),
            }}
          />
        </div>
        <div className="text-center mb-4">
          <p className="text-xl font-semibold">
            {isThinking ? 'AI is thinking...' : (status || `Current turn: ${turn === 'w' ? 'White' : 'Black'}`)}
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={resetGame}>Reset Game</Button>
        </div>
      </div>
    </div>
  );
};

export default Chess;
