// Push Notification Types

export type NotificationType =
  | 'game_starting'
  | 'game_score_update'
  | 'game_final'
  | 'game_highlight'
  | 'team_message'
  | 'event_reminder'
  | 'roster_update'
  | 'photo_added'
  | 'video_ready'
  | 'stream_live';

export type NotificationPriority = 'high' | 'normal' | 'low';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  sound?: string;
  badge?: number;
  priority?: NotificationPriority;

  // Routing
  deepLink?: string;
  gameId?: string;
  teamId?: string;
  eventId?: string;
}

export interface DeviceToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'expo';
  deviceId: string;
  createdAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}

export interface NotificationPreferences {
  userId: string;

  // Global
  enabled: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "07:00"

  // By type
  gameStarting: boolean;
  gameScoreUpdates: boolean;
  gameFinal: boolean;
  gameHighlights: boolean;
  teamMessages: boolean;
  eventReminders: boolean;
  rosterUpdates: boolean;
  photoNotifications: boolean;
  videoNotifications: boolean;
  streamNotifications: boolean;

  // By team (team ID -> enabled)
  teamSettings: Record<string, boolean>;
}

export interface NotificationResult {
  token: string;
  success: boolean;
  error?: string;
  messageId?: string;
}

export interface NotificationStats {
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
}

// Notification templates
export interface NotificationTemplate {
  type: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  defaultPriority: NotificationPriority;
  defaultSound?: string;
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  game_starting: {
    type: 'game_starting',
    titleTemplate: 'Game Starting Soon',
    bodyTemplate: '{{homeTeam}} vs {{awayTeam}} starts in {{minutes}} minutes',
    defaultPriority: 'high',
    defaultSound: 'default',
  },
  game_score_update: {
    type: 'game_score_update',
    titleTemplate: 'Score Update',
    bodyTemplate: '{{homeTeam}} {{homeScore}} - {{awayScore}} {{awayTeam}}',
    defaultPriority: 'high',
    defaultSound: 'score.wav',
  },
  game_final: {
    type: 'game_final',
    titleTemplate: 'Game Final',
    bodyTemplate: '{{homeTeam}} {{homeScore}} - {{awayScore}} {{awayTeam}} (Final)',
    defaultPriority: 'high',
    defaultSound: 'default',
  },
  game_highlight: {
    type: 'game_highlight',
    titleTemplate: 'Highlight: {{playerName}}',
    bodyTemplate: '{{description}}',
    defaultPriority: 'normal',
  },
  team_message: {
    type: 'team_message',
    titleTemplate: '{{teamName}}',
    bodyTemplate: '{{senderName}}: {{message}}',
    defaultPriority: 'high',
    defaultSound: 'message.wav',
  },
  event_reminder: {
    type: 'event_reminder',
    titleTemplate: 'Upcoming: {{eventTitle}}',
    bodyTemplate: '{{eventDescription}} - {{eventTime}}',
    defaultPriority: 'high',
    defaultSound: 'default',
  },
  roster_update: {
    type: 'roster_update',
    titleTemplate: 'Roster Update',
    bodyTemplate: '{{playerName}} has been {{action}} the roster',
    defaultPriority: 'normal',
  },
  photo_added: {
    type: 'photo_added',
    titleTemplate: 'New Photos',
    bodyTemplate: '{{count}} new photos added to {{gameName}}',
    defaultPriority: 'low',
  },
  video_ready: {
    type: 'video_ready',
    titleTemplate: 'Video Ready',
    bodyTemplate: 'Your {{gameName}} video is ready to watch',
    defaultPriority: 'normal',
  },
  stream_live: {
    type: 'stream_live',
    titleTemplate: 'Live Now',
    bodyTemplate: '{{teamName}} game is streaming live',
    defaultPriority: 'high',
    defaultSound: 'default',
  },
};
