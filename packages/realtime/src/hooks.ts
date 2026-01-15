// React Hooks for Real-time Updates
// Works with both React (web) and React Native

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import type { RealtimeClient, RealtimeClientConfig } from './client';
import type {
  ConnectionInfo,
  GameScoreMessage,
  GamePlayMessage,
  GameStatusMessage,
  ChatMessage,
} from './types';

// Note: Import createRealtimeClient dynamically to avoid SSR issues
// In actual usage: import { createRealtimeClient } from './client';

// Context for sharing a single client instance
interface RealtimeContextValue {
  client: RealtimeClient | null;
  connectionInfo: ConnectionInfo;
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}

// Hook for connection state
export function useConnectionState(): ConnectionInfo {
  const { client, connectionInfo } = useRealtimeContext();
  const [state, setState] = useState<ConnectionInfo>(connectionInfo);

  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.onConnectionChange(setState);
    return unsubscribe;
  }, [client]);

  return state;
}

// Hook for subscribing to a game
export function useGameSubscription(gameId: string | null): void {
  const { client } = useRealtimeContext();

  useEffect(() => {
    if (!client || !gameId) return;

    client.subscribeToGame(gameId);
    return () => {
      client.unsubscribeFromGame(gameId);
    };
  }, [client, gameId]);
}

// Hook for live game score
export interface LiveScore {
  homeScore: number;
  awayScore: number;
  period?: number;
  time?: string;
  lastUpdate?: Date;
}

export function useLiveScore(gameId: string | null, initialScore?: LiveScore): LiveScore {
  const { client } = useRealtimeContext();
  const [score, setScore] = useState<LiveScore>(
    initialScore ?? { homeScore: 0, awayScore: 0 }
  );

  useEffect(() => {
    if (!client || !gameId) return;

    const unsubscribe = client.on('game:score', (message: GameScoreMessage) => {
      if (message.payload.gameId === gameId) {
        setScore({
          homeScore: message.payload.homeScore,
          awayScore: message.payload.awayScore,
          period: message.payload.period,
          time: message.payload.time,
          lastUpdate: new Date(message.timestamp),
        });
      }
    });

    return unsubscribe;
  }, [client, gameId]);

  return score;
}

// Hook for live game status
export interface LiveGameStatus {
  status: 'scheduled' | 'warmup' | 'in_progress' | 'halftime' | 'final' | 'postponed' | 'cancelled';
  period?: number;
  time?: string;
}

export function useLiveGameStatus(gameId: string | null, initialStatus?: LiveGameStatus): LiveGameStatus {
  const { client } = useRealtimeContext();
  const [status, setStatus] = useState<LiveGameStatus>(
    initialStatus ?? { status: 'scheduled' }
  );

  useEffect(() => {
    if (!client || !gameId) return;

    const unsubscribe = client.on('game:status', (message: GameStatusMessage) => {
      if (message.payload.gameId === gameId) {
        setStatus({
          status: message.payload.status,
          period: message.payload.period,
          time: message.payload.time,
        });
      }
    });

    return unsubscribe;
  }, [client, gameId]);

  return status;
}

// Hook for play-by-play feed
export interface PlayEvent {
  id: string;
  playerId?: string;
  playerName?: string;
  teamId: string;
  description: string;
  playType: string;
  value?: number;
  period?: number;
  time?: string;
  timestamp: Date;
}

export function usePlayByPlay(gameId: string | null, maxEvents = 50): PlayEvent[] {
  const { client } = useRealtimeContext();
  const [plays, setPlays] = useState<PlayEvent[]>([]);

  useEffect(() => {
    if (!client || !gameId) return;

    const unsubscribe = client.on('game:play', (message: GamePlayMessage) => {
      if (message.payload.gameId === gameId) {
        setPlays((prev) => {
          const newPlay: PlayEvent = {
            id: message.id,
            ...message.payload,
            timestamp: new Date(message.timestamp),
          };
          const updated = [newPlay, ...prev];
          return updated.slice(0, maxEvents);
        });
      }
    });

    return unsubscribe;
  }, [client, gameId, maxEvents]);

  // Clear plays when gameId changes
  useEffect(() => {
    setPlays([]);
  }, [gameId]);

  return plays;
}

// Hook for live chat
export interface ChatMessageItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  replyTo?: string;
  timestamp: Date;
}

export function useLiveChat(channel: string | null, maxMessages = 100) {
  const { client } = useRealtimeContext();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);

  useEffect(() => {
    if (!client || !channel) return;

    // Subscribe to channel
    client.subscribe(channel);

    const unsubscribe = client.on('chat:message', (message: ChatMessage) => {
      if (message.payload.channel === channel) {
        setMessages((prev) => {
          const newMessage: ChatMessageItem = {
            id: message.id,
            userId: message.payload.userId,
            userName: message.payload.userName,
            userAvatar: message.payload.userAvatar,
            message: message.payload.message,
            replyTo: message.payload.replyTo,
            timestamp: new Date(message.timestamp),
          };
          const updated = [...prev, newMessage];
          return updated.slice(-maxMessages);
        });
      }
    });

    return () => {
      unsubscribe();
      client.unsubscribe(channel);
    };
  }, [client, channel, maxMessages]);

  const sendMessage = useCallback((text: string, replyTo?: string) => {
    if (client && channel) {
      client.sendChatMessage(channel, text, replyTo);
    }
  }, [client, channel]);

  return { messages, sendMessage };
}

// Hook for presence (who's watching)
export interface PresenceUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: Date;
}

export function usePresence(channel: string | null): PresenceUser[] {
  const { client } = useRealtimeContext();
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!client || !channel) return;

    const handleJoin = client.on('presence:join', (message) => {
      if (message.payload.channel === channel) {
        setUsers((prev) => {
          // Avoid duplicates
          if (prev.some(u => u.userId === message.payload.userId)) {
            return prev;
          }
          return [...prev, {
            userId: message.payload.userId,
            userName: message.payload.userName,
            userAvatar: message.payload.userAvatar,
            joinedAt: new Date(message.timestamp),
          }];
        });
      }
    });

    const handleLeave = client.on('presence:leave', (message) => {
      if (message.payload.channel === channel) {
        setUsers((prev) => prev.filter(u => u.userId !== message.payload.userId));
      }
    });

    return () => {
      handleJoin();
      handleLeave();
    };
  }, [client, channel]);

  // Clear users when channel changes
  useEffect(() => {
    setUsers([]);
  }, [channel]);

  return users;
}

// Combined hook for full live game experience
export function useLiveGame(gameId: string | null, initialData?: {
  score?: LiveScore;
  status?: LiveGameStatus;
}) {
  useGameSubscription(gameId);

  const score = useLiveScore(gameId, initialData?.score);
  const status = useLiveGameStatus(gameId, initialData?.status);
  const plays = usePlayByPlay(gameId);
  const presence = usePresence(gameId ? `game:${gameId}` : null);
  const connection = useConnectionState();

  return {
    score,
    status,
    plays,
    presence,
    connection,
    isLive: status.status === 'in_progress' || status.status === 'warmup' || status.status === 'halftime',
    isConnected: connection.state === 'connected',
  };
}
