// Push Notification Service
// Supports Expo Push and Firebase Cloud Messaging

import Expo, { ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import type {
  NotificationPayload,
  DeviceToken,
  NotificationResult,
  NotificationPreferences,
  NotificationType,
  NOTIFICATION_TEMPLATES,
} from './types';

// Template string interpolation
function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
  });
}

export class NotificationService {
  private expo: Expo;
  private getDeviceTokens: (userIds: string[]) => Promise<DeviceToken[]>;
  private getUserPreferences: (userId: string) => Promise<NotificationPreferences | null>;

  constructor(options: {
    getDeviceTokens: (userIds: string[]) => Promise<DeviceToken[]>;
    getUserPreferences: (userId: string) => Promise<NotificationPreferences | null>;
  }) {
    this.expo = new Expo();
    this.getDeviceTokens = options.getDeviceTokens;
    this.getUserPreferences = options.getUserPreferences;
  }

  // Send notification to specific users
  async sendToUsers(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<NotificationResult[]> {
    // Get device tokens
    const tokens = await this.getDeviceTokens(userIds);
    const activeTokens = tokens.filter(t => t.isActive);

    // Filter by preferences
    const eligibleTokens: DeviceToken[] = [];
    for (const token of activeTokens) {
      const prefs = await this.getUserPreferences(token.userId);
      if (this.shouldSendNotification(prefs, payload.type, payload.teamId)) {
        eligibleTokens.push(token);
      }
    }

    if (eligibleTokens.length === 0) {
      return [];
    }

    // Separate Expo and FCM tokens
    const expoTokens = eligibleTokens.filter(t => t.platform === 'expo');

    // Send via Expo
    const results = await this.sendViaExpo(expoTokens, payload);

    return results;
  }

  // Send to a team's members
  async sendToTeam(
    teamId: string,
    memberIds: string[],
    payload: NotificationPayload
  ): Promise<NotificationResult[]> {
    return this.sendToUsers(memberIds, {
      ...payload,
      teamId,
    });
  }

  // Send using Expo Push Notification service
  private async sendViaExpo(
    tokens: DeviceToken[],
    payload: NotificationPayload
  ): Promise<NotificationResult[]> {
    if (tokens.length === 0) return [];

    // Build messages
    const messages: ExpoPushMessage[] = tokens
      .filter(t => Expo.isExpoPushToken(t.token))
      .map(token => ({
        to: token.token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: payload.sound as any || 'default',
        priority: payload.priority || 'high',
        badge: payload.badge,
      }));

    if (messages.length === 0) return [];

    // Send in chunks
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending Expo push notifications:', error);
      }
    }

    // Map results
    return tickets.map((ticket, index) => {
      const token = tokens[index];
      if (ticket.status === 'ok') {
        return {
          token: token.token,
          success: true,
          messageId: ticket.id,
        };
      } else {
        return {
          token: token.token,
          success: false,
          error: ticket.message,
        };
      }
    });
  }

  // Check push receipts for delivery status
  async checkReceipts(receiptIds: string[]): Promise<Map<string, { success: boolean; error?: string }>> {
    const results = new Map<string, { success: boolean; error?: string }>();

    const chunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);

    for (const chunk of chunks) {
      try {
        const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);

        for (const [id, receipt] of Object.entries(receipts)) {
          if (receipt.status === 'ok') {
            results.set(id, { success: true });
          } else {
            results.set(id, {
              success: false,
              error: receipt.message,
            });
          }
        }
      } catch (error) {
        console.error('Error checking receipts:', error);
      }
    }

    return results;
  }

  // Check user preferences
  private shouldSendNotification(
    prefs: NotificationPreferences | null,
    type: NotificationType,
    teamId?: string
  ): boolean {
    // No preferences = send by default
    if (!prefs) return true;

    // Global disable
    if (!prefs.enabled) return false;

    // Check quiet hours
    if (prefs.quietHoursStart && prefs.quietHoursEnd) {
      if (this.isQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) {
        return false;
      }
    }

    // Check team-specific settings
    if (teamId && prefs.teamSettings[teamId] === false) {
      return false;
    }

    // Check notification type settings
    switch (type) {
      case 'game_starting':
        return prefs.gameStarting;
      case 'game_score_update':
        return prefs.gameScoreUpdates;
      case 'game_final':
        return prefs.gameFinal;
      case 'game_highlight':
        return prefs.gameHighlights;
      case 'team_message':
        return prefs.teamMessages;
      case 'event_reminder':
        return prefs.eventReminders;
      case 'roster_update':
        return prefs.rosterUpdates;
      case 'photo_added':
        return prefs.photoNotifications;
      case 'video_ready':
        return prefs.videoNotifications;
      case 'stream_live':
        return prefs.streamNotifications;
      default:
        return true;
    }
  }

  private isQuietHours(start: string, end: string): boolean {
    const now = new Date();
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes < endMinutes) {
      // Same day range (e.g., 09:00 - 17:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight range (e.g., 22:00 - 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }
}

// Notification builders for common scenarios
export function buildGameStartingNotification(data: {
  homeTeam: string;
  awayTeam: string;
  minutes: number;
  gameId: string;
}): NotificationPayload {
  return {
    type: 'game_starting',
    title: 'Game Starting Soon',
    body: `${data.homeTeam} vs ${data.awayTeam} starts in ${data.minutes} minutes`,
    priority: 'high',
    sound: 'default',
    gameId: data.gameId,
    deepLink: `/game/${data.gameId}`,
    data: {
      gameId: data.gameId,
    },
  };
}

export function buildScoreUpdateNotification(data: {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  gameId: string;
  description?: string;
}): NotificationPayload {
  return {
    type: 'game_score_update',
    title: 'Score Update',
    body: data.description || `${data.homeTeam} ${data.homeScore} - ${data.awayScore} ${data.awayTeam}`,
    priority: 'high',
    gameId: data.gameId,
    deepLink: `/game/${data.gameId}`,
    data: {
      gameId: data.gameId,
      homeScore: String(data.homeScore),
      awayScore: String(data.awayScore),
    },
  };
}

export function buildGameFinalNotification(data: {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  gameId: string;
}): NotificationPayload {
  const winner = data.homeScore > data.awayScore ? data.homeTeam :
                 data.awayScore > data.homeScore ? data.awayTeam : null;

  return {
    type: 'game_final',
    title: winner ? `${winner} Wins!` : 'Game Final - Tie',
    body: `${data.homeTeam} ${data.homeScore} - ${data.awayScore} ${data.awayTeam} (Final)`,
    priority: 'high',
    sound: 'default',
    gameId: data.gameId,
    deepLink: `/game/${data.gameId}`,
    data: {
      gameId: data.gameId,
    },
  };
}

export function buildTeamMessageNotification(data: {
  teamId: string;
  teamName: string;
  senderName: string;
  message: string;
  channelId?: string;
}): NotificationPayload {
  return {
    type: 'team_message',
    title: data.teamName,
    body: `${data.senderName}: ${data.message}`,
    priority: 'high',
    teamId: data.teamId,
    deepLink: `/team/${data.teamId}/messages${data.channelId ? `/${data.channelId}` : ''}`,
    data: {
      teamId: data.teamId,
      channelId: data.channelId || '',
    },
  };
}

export function buildEventReminderNotification(data: {
  eventId: string;
  title: string;
  description: string;
  time: string;
  teamId?: string;
}): NotificationPayload {
  return {
    type: 'event_reminder',
    title: `Upcoming: ${data.title}`,
    body: `${data.description} - ${data.time}`,
    priority: 'high',
    sound: 'default',
    teamId: data.teamId,
    deepLink: `/event/${data.eventId}`,
    data: {
      eventId: data.eventId,
    },
  };
}

export function buildStreamLiveNotification(data: {
  teamName: string;
  gameId: string;
  streamId: string;
}): NotificationPayload {
  return {
    type: 'stream_live',
    title: 'Live Now',
    body: `${data.teamName} game is streaming live`,
    priority: 'high',
    sound: 'default',
    gameId: data.gameId,
    deepLink: `/game/${data.gameId}?stream=${data.streamId}`,
    data: {
      gameId: data.gameId,
      streamId: data.streamId,
    },
  };
}
