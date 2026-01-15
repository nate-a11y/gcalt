import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConnectionInfo } from '@sideline/realtime';
import * as SecureStore from 'expo-secure-store';

// Simplified realtime context for React Native
// In production, this would use the @sideline/realtime client

interface RealtimeContextType {
  isConnected: boolean;
  connectionInfo: ConnectionInfo;
  subscribeToGame: (gameId: string) => void;
  unsubscribeFromGame: (gameId: string) => void;
}

const defaultConnectionInfo: ConnectionInfo = {
  state: 'disconnected',
  reconnectAttempts: 0,
};

const RealtimeContext = createContext<RealtimeContextType | null>(null);

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.sideline.app/ws';

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(defaultConnectionInfo);
  const [subscribedGames, setSubscribedGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize WebSocket connection
    initializeConnection();

    return () => {
      // Cleanup on unmount
    };
  }, []);

  const initializeConnection = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        setConnectionInfo({ state: 'disconnected', reconnectAttempts: 0 });
        return;
      }

      // TODO: Initialize actual WebSocket connection
      // const client = createRealtimeClient({
      //   url: WS_URL,
      //   authToken: token,
      // });
      // await client.connect();

      // Simulate connected state
      setIsConnected(true);
      setConnectionInfo({
        state: 'connected',
        connectedAt: new Date(),
        reconnectAttempts: 0,
      });
    } catch (error) {
      console.error('Failed to initialize realtime connection:', error);
      setConnectionInfo({
        state: 'disconnected',
        reconnectAttempts: 1,
      });
    }
  };

  const subscribeToGame = (gameId: string) => {
    setSubscribedGames(prev => new Set(prev).add(gameId));
    // TODO: client.subscribeToGame(gameId);
  };

  const unsubscribeFromGame = (gameId: string) => {
    setSubscribedGames(prev => {
      const next = new Set(prev);
      next.delete(gameId);
      return next;
    });
    // TODO: client.unsubscribeFromGame(gameId);
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        connectionInfo,
        subscribeToGame,
        unsubscribeFromGame,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

// Hook for subscribing to game updates
export function useGameUpdates(gameId: string | null) {
  const { subscribeToGame, unsubscribeFromGame, isConnected } = useRealtime();
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [plays, setPlays] = useState<any[]>([]);

  useEffect(() => {
    if (!gameId) return;

    subscribeToGame(gameId);

    // TODO: Set up event listeners for game updates
    // client.on('game:score', (msg) => setScore(msg.payload));
    // client.on('game:play', (msg) => setPlays(prev => [msg.payload, ...prev]));

    return () => {
      unsubscribeFromGame(gameId);
    };
  }, [gameId, subscribeToGame, unsubscribeFromGame]);

  return {
    isConnected,
    score,
    plays,
  };
}
