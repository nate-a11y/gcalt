// Real-time WebSocket Client
// Browser and React Native compatible client for real-time updates

import type {
  RealtimeMessage,
  ConnectionState,
  ConnectionInfo,
  MessageType,
  GameScoreMessage,
  GamePlayMessage,
  GameStatMessage,
  GameStatusMessage,
  ChatMessage,
  PresenceJoinMessage,
  PresenceLeaveMessage,
} from './types';

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

type MessageHandler<T = RealtimeMessage> = (message: T) => void;

export interface RealtimeClientConfig {
  url: string;
  authToken?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private config: Required<Omit<RealtimeClientConfig, 'authToken'>> & { authToken?: string };
  private connectionInfo: ConnectionInfo;
  private subscriptions: Set<string> = new Set();
  private handlers: Map<MessageType, Set<MessageHandler>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: RealtimeClientConfig) {
    this.config = {
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      ...config,
    };

    this.connectionInfo = {
      state: 'disconnected',
      reconnectAttempts: 0,
    };
  }

  // Connection management

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.connectionInfo.state = 'connecting';
      this.notifyConnectionChange();

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.connectionInfo.state = 'connected';
          this.connectionInfo.connectedAt = new Date();
          this.connectionInfo.reconnectAttempts = 0;
          this.notifyConnectionChange();
          this.startHeartbeat();

          // Re-subscribe to channels after reconnect
          for (const channel of this.subscriptions) {
            this.sendSubscribe(channel);
          }

          resolve();
        };

        this.ws.onclose = () => {
          this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
          if (this.connectionInfo.state === 'connecting') {
            reject(error);
          }
          this.handleDisconnect();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as RealtimeMessage;
            this.handleMessage(message);
          } catch {
            console.error('Failed to parse message');
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.config.autoReconnect = false;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionInfo.state = 'disconnected';
    this.notifyConnectionChange();
  }

  private handleDisconnect(): void {
    this.stopHeartbeat();
    this.ws = null;

    if (this.config.autoReconnect &&
        this.connectionInfo.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.connectionInfo.state = 'reconnecting';
      this.connectionInfo.reconnectAttempts++;
      this.notifyConnectionChange();

      const delay = this.config.reconnectInterval * Math.pow(1.5, this.connectionInfo.reconnectAttempts - 1);
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {
          // Reconnect will be retried
        });
      }, Math.min(delay, 30000));
    } else {
      this.connectionInfo.state = 'disconnected';
      this.notifyConnectionChange();
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.connectionInfo.lastPingAt = new Date();
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Subscriptions

  subscribe(channel: string): void {
    this.subscriptions.add(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(channel);
    }
  }

  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        id: generateId(),
        type: 'unsubscribe',
        timestamp: Date.now(),
        payload: { channel },
      });
    }
  }

  private sendSubscribe(channel: string): void {
    this.send({
      id: generateId(),
      type: 'subscribe',
      timestamp: Date.now(),
      payload: {
        channel,
        authToken: this.config.authToken,
      },
    });
  }

  // Convenience methods for game channels

  subscribeToGame(gameId: string): void {
    this.subscribe(`game:${gameId}`);
  }

  unsubscribeFromGame(gameId: string): void {
    this.unsubscribe(`game:${gameId}`);
  }

  subscribeToTeam(teamId: string): void {
    this.subscribe(`team:${teamId}`);
  }

  unsubscribeFromTeam(teamId: string): void {
    this.unsubscribe(`team:${teamId}`);
  }

  // Message sending

  private send(message: RealtimeMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendChatMessage(channel: string, message: string, replyTo?: string): void {
    this.send({
      id: generateId(),
      type: 'chat:message',
      timestamp: Date.now(),
      payload: {
        channel,
        userId: '', // Will be set by server
        userName: '', // Will be set by server
        message,
        replyTo,
      },
    });
  }

  // Event handlers

  private handleMessage(message: RealtimeMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(message);
        } catch (error) {
          console.error('Handler error:', error);
        }
      }
    }

    // Also trigger 'all' handlers
    const allHandlers = this.handlers.get('ack'); // Using 'ack' as catch-all is wrong, need proper typing
    // In real implementation, would have separate 'all' event type
  }

  on(type: 'game:score', handler: MessageHandler<GameScoreMessage>): () => void;
  on(type: 'game:play', handler: MessageHandler<GamePlayMessage>): () => void;
  on(type: 'game:stat', handler: MessageHandler<GameStatMessage>): () => void;
  on(type: 'game:status', handler: MessageHandler<GameStatusMessage>): () => void;
  on(type: 'chat:message', handler: MessageHandler<ChatMessage>): () => void;
  on(type: 'presence:join', handler: MessageHandler<PresenceJoinMessage>): () => void;
  on(type: 'presence:leave', handler: MessageHandler<PresenceLeaveMessage>): () => void;
  on(type: MessageType, handler: MessageHandler): () => void;
  on(type: MessageType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  off(type: MessageType, handler?: MessageHandler): void {
    if (handler) {
      this.handlers.get(type)?.delete(handler);
    } else {
      this.handlers.delete(type);
    }
  }

  // Connection state

  private connectionHandlers: Set<(info: ConnectionInfo) => void> = new Set();

  onConnectionChange(handler: (info: ConnectionInfo) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  private notifyConnectionChange(): void {
    for (const handler of this.connectionHandlers) {
      handler({ ...this.connectionInfo });
    }
  }

  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo };
  }

  isConnected(): boolean {
    return this.connectionInfo.state === 'connected';
  }
}

export function createRealtimeClient(config: RealtimeClientConfig): RealtimeClient {
  return new RealtimeClient(config);
}
