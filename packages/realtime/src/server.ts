// Real-time WebSocket Server
// This module provides WebSocket server functionality for live game updates

import type { WebSocket, WebSocketServer as WSServer } from 'ws';
import type {
  RealtimeMessage,
  ClientInfo,
  Channel,
  ChannelType,
  GameScoreMessage,
  GamePlayMessage,
  GameStatMessage,
  GameStatusMessage,
  ChatMessage,
} from './types';

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface RealtimeServerConfig {
  heartbeatInterval?: number;
  maxChannelsPerClient?: number;
  authValidator?: (token: string) => Promise<{ userId: string; userName: string } | null>;
}

export class RealtimeServer {
  private wss: WSServer | null = null;
  private clients: Map<string, { ws: WebSocket; info: ClientInfo }> = new Map();
  private channels: Map<string, Channel> = new Map();
  private config: Required<RealtimeServerConfig>;

  constructor(config: RealtimeServerConfig = {}) {
    this.config = {
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      maxChannelsPerClient: config.maxChannelsPerClient ?? 50,
      authValidator: config.authValidator ?? (async () => null),
    };
  }

  // Initialize with an existing WebSocket server
  attach(wss: WSServer): void {
    this.wss = wss;

    wss.on('connection', (ws: WebSocket) => {
      const clientId = generateId();
      const clientInfo: ClientInfo = {
        id: clientId,
        connectedAt: new Date(),
        channels: new Set(),
        isAuthenticated: false,
      };

      this.clients.set(clientId, { ws, info: clientInfo });

      ws.on('message', (data: Buffer | string) => {
        try {
          const message = JSON.parse(data.toString()) as RealtimeMessage;
          this.handleMessage(clientId, message);
        } catch (error) {
          this.sendError(clientId, 'INVALID_MESSAGE', 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', () => {
        this.handleDisconnect(clientId);
      });

      // Send connection acknowledgment
      this.sendToClient(clientId, {
        id: generateId(),
        type: 'ack',
        timestamp: Date.now(),
        payload: {
          originalMessageId: 'connection',
          success: true,
        },
      });
    });

    // Start heartbeat
    setInterval(() => this.heartbeat(), this.config.heartbeatInterval);
  }

  private handleMessage(clientId: string, message: RealtimeMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message.payload.channel, message.payload.authToken);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message.payload.channel);
        break;
      case 'chat:message':
        this.handleChatMessage(clientId, message as ChatMessage);
        break;
      default:
        // Other message types might be handled by specific game logic
        break;
    }
  }

  private async handleSubscribe(clientId: string, channelName: string, authToken?: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Check channel limit
    if (client.info.channels.size >= this.config.maxChannelsPerClient) {
      this.sendError(clientId, 'CHANNEL_LIMIT', 'Maximum channels reached');
      return;
    }

    // Authenticate if token provided
    if (authToken && !client.info.isAuthenticated) {
      const authResult = await this.config.authValidator(authToken);
      if (authResult) {
        client.info.userId = authResult.userId;
        client.info.userName = authResult.userName;
        client.info.isAuthenticated = true;
      }
    }

    // Get or create channel
    let channel = this.channels.get(channelName);
    if (!channel) {
      const [type] = channelName.split(':') as [ChannelType];
      channel = {
        id: channelName,
        type,
        name: channelName,
        subscribers: new Set(),
        presenceEnabled: type === 'game' || type === 'team',
      };
      this.channels.set(channelName, channel);
    }

    // Add client to channel
    channel.subscribers.add(clientId);
    client.info.channels.add(channelName);

    // Send acknowledgment
    this.sendToClient(clientId, {
      id: generateId(),
      type: 'ack',
      timestamp: Date.now(),
      payload: {
        originalMessageId: 'subscribe',
        success: true,
      },
    });

    // Broadcast presence if enabled
    if (channel.presenceEnabled && client.info.isAuthenticated) {
      this.broadcastToChannel(channelName, {
        id: generateId(),
        type: 'presence:join',
        timestamp: Date.now(),
        payload: {
          channel: channelName,
          userId: client.info.userId!,
          userName: client.info.userName!,
        },
      }, clientId);
    }
  }

  private handleUnsubscribe(clientId: string, channelName: string): void {
    const client = this.clients.get(clientId);
    const channel = this.channels.get(channelName);

    if (!client || !channel) return;

    // Remove from channel
    channel.subscribers.delete(clientId);
    client.info.channels.delete(channelName);

    // Broadcast presence leave
    if (channel.presenceEnabled && client.info.isAuthenticated) {
      this.broadcastToChannel(channelName, {
        id: generateId(),
        type: 'presence:leave',
        timestamp: Date.now(),
        payload: {
          channel: channelName,
          userId: client.info.userId!,
        },
      });
    }

    // Clean up empty channels
    if (channel.subscribers.size === 0) {
      this.channels.delete(channelName);
    }
  }

  private handleChatMessage(clientId: string, message: ChatMessage): void {
    const client = this.clients.get(clientId);
    if (!client || !client.info.isAuthenticated) {
      this.sendError(clientId, 'UNAUTHORIZED', 'Must be authenticated to chat');
      return;
    }

    const channel = message.payload.channel;
    if (!client.info.channels.has(channel)) {
      this.sendError(clientId, 'NOT_SUBSCRIBED', 'Not subscribed to channel');
      return;
    }

    // Broadcast chat message to channel
    this.broadcastToChannel(channel, {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
      payload: {
        ...message.payload,
        userId: client.info.userId!,
        userName: client.info.userName!,
      },
    });
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave all channels
    for (const channelName of client.info.channels) {
      this.handleUnsubscribe(clientId, channelName);
    }

    // Remove client
    this.clients.delete(clientId);
  }

  private heartbeat(): void {
    for (const [clientId, { ws }] of this.clients) {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.ping();
      } else {
        this.handleDisconnect(clientId);
      }
    }
  }

  private sendToClient(clientId: string, message: RealtimeMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private sendError(clientId: string, code: string, message: string): void {
    this.sendToClient(clientId, {
      id: generateId(),
      type: 'error',
      timestamp: Date.now(),
      payload: { code, message },
    });
  }

  // Public API for broadcasting game events

  broadcastToChannel(channelName: string, message: RealtimeMessage, excludeClient?: string): void {
    const channel = this.channels.get(channelName);
    if (!channel) return;

    for (const clientId of channel.subscribers) {
      if (clientId !== excludeClient) {
        this.sendToClient(clientId, message);
      }
    }
  }

  broadcastGameScore(gameId: string, score: Omit<GameScoreMessage['payload'], 'gameId'>): void {
    this.broadcastToChannel(`game:${gameId}`, {
      id: generateId(),
      type: 'game:score',
      timestamp: Date.now(),
      payload: {
        gameId,
        ...score,
      },
    });
  }

  broadcastGamePlay(gameId: string, play: Omit<GamePlayMessage['payload'], 'gameId'>): void {
    this.broadcastToChannel(`game:${gameId}`, {
      id: generateId(),
      type: 'game:play',
      timestamp: Date.now(),
      payload: {
        gameId,
        ...play,
      },
    });
  }

  broadcastGameStat(gameId: string, stat: Omit<GameStatMessage['payload'], 'gameId'>): void {
    this.broadcastToChannel(`game:${gameId}`, {
      id: generateId(),
      type: 'game:stat',
      timestamp: Date.now(),
      payload: {
        gameId,
        ...stat,
      },
    });
  }

  broadcastGameStatus(gameId: string, status: Omit<GameStatusMessage['payload'], 'gameId'>): void {
    this.broadcastToChannel(`game:${gameId}`, {
      id: generateId(),
      type: 'game:status',
      timestamp: Date.now(),
      payload: {
        gameId,
        ...status,
      },
    });
  }

  // Stats
  getStats(): { clients: number; channels: number; channelSizes: Record<string, number> } {
    const channelSizes: Record<string, number> = {};
    for (const [name, channel] of this.channels) {
      channelSizes[name] = channel.subscribers.size;
    }
    return {
      clients: this.clients.size,
      channels: this.channels.size,
      channelSizes,
    };
  }
}

export function createRealtimeServer(config?: RealtimeServerConfig): RealtimeServer {
  return new RealtimeServer(config);
}
