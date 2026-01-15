// Real-time WebSocket Types

export type MessageType =
  | 'subscribe'
  | 'unsubscribe'
  | 'game:update'
  | 'game:score'
  | 'game:play'
  | 'game:stat'
  | 'game:status'
  | 'chat:message'
  | 'presence:join'
  | 'presence:leave'
  | 'error'
  | 'ack';

export interface BaseMessage {
  id: string;
  type: MessageType;
  timestamp: number;
}

// Channel subscription
export interface SubscribeMessage extends BaseMessage {
  type: 'subscribe';
  payload: {
    channel: string;
    authToken?: string;
  };
}

export interface UnsubscribeMessage extends BaseMessage {
  type: 'unsubscribe';
  payload: {
    channel: string;
  };
}

// Game events
export interface GameUpdateMessage extends BaseMessage {
  type: 'game:update';
  payload: {
    gameId: string;
    update: Record<string, any>;
  };
}

export interface GameScoreMessage extends BaseMessage {
  type: 'game:score';
  payload: {
    gameId: string;
    homeScore: number;
    awayScore: number;
    period?: number;
    time?: string;
  };
}

export interface GamePlayMessage extends BaseMessage {
  type: 'game:play';
  payload: {
    gameId: string;
    playerId?: string;
    playerName?: string;
    teamId: string;
    description: string;
    playType: string;
    value?: number;
    period?: number;
    time?: string;
  };
}

export interface GameStatMessage extends BaseMessage {
  type: 'game:stat';
  payload: {
    gameId: string;
    playerId: string;
    statKey: string;
    value: number;
    delta: number;
  };
}

export interface GameStatusMessage extends BaseMessage {
  type: 'game:status';
  payload: {
    gameId: string;
    status: 'scheduled' | 'warmup' | 'in_progress' | 'halftime' | 'final' | 'postponed' | 'cancelled';
    period?: number;
    time?: string;
  };
}

// Chat
export interface ChatMessage extends BaseMessage {
  type: 'chat:message';
  payload: {
    channel: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    message: string;
    replyTo?: string;
  };
}

// Presence
export interface PresenceJoinMessage extends BaseMessage {
  type: 'presence:join';
  payload: {
    channel: string;
    userId: string;
    userName: string;
    userAvatar?: string;
  };
}

export interface PresenceLeaveMessage extends BaseMessage {
  type: 'presence:leave';
  payload: {
    channel: string;
    userId: string;
  };
}

// System
export interface ErrorMessage extends BaseMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    originalMessageId?: string;
  };
}

export interface AckMessage extends BaseMessage {
  type: 'ack';
  payload: {
    originalMessageId: string;
    success: boolean;
  };
}

export type RealtimeMessage =
  | SubscribeMessage
  | UnsubscribeMessage
  | GameUpdateMessage
  | GameScoreMessage
  | GamePlayMessage
  | GameStatMessage
  | GameStatusMessage
  | ChatMessage
  | PresenceJoinMessage
  | PresenceLeaveMessage
  | ErrorMessage
  | AckMessage;

// Connection state
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface ConnectionInfo {
  state: ConnectionState;
  connectedAt?: Date;
  lastPingAt?: Date;
  reconnectAttempts: number;
}

// Channel types
export type ChannelType = 'game' | 'team' | 'league' | 'user';

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  subscribers: Set<string>;
  presenceEnabled: boolean;
}

// Client info
export interface ClientInfo {
  id: string;
  userId?: string;
  userName?: string;
  connectedAt: Date;
  channels: Set<string>;
  isAuthenticated: boolean;
}
