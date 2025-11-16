import { useState, useCallback } from 'react';

export type GameType = 'brain-chase' | 'memory-match' | null;

export default function useGamesWorkSpace() {
    const [selectedGame, setSelectedGame] = useState<GameType>(null);

    const selectGame = useCallback((game: GameType) => {
        setSelectedGame(game);
    }, []);

    const resetGame = useCallback(() => {
        setSelectedGame(null);
    }, []);

    return {
        selectedGame,
        selectGame,
        resetGame,
    };
}

