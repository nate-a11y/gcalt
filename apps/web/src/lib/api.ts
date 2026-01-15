import { useAuth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuth.getState().token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      useAuth.getState().logout();
    }
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

// Team API
export const teamsApi = {
  list: () => apiClient<{ teams: any[] }>('/teams'),
  get: (id: string) => apiClient<{ team: any }>(`/teams/${id}`),
  create: (data: { name: string; sport: string }) =>
    apiClient<{ team: any }>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<{ name: string; sport: string }>) =>
    apiClient<{ team: any }>(`/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<void>(`/teams/${id}`, { method: 'DELETE' }),
};

// Players API
export const playersApi = {
  list: (teamId: string) =>
    apiClient<{ players: any[] }>(`/teams/${teamId}/players`),
  get: (teamId: string, playerId: string) =>
    apiClient<{ player: any }>(`/teams/${teamId}/players/${playerId}`),
  create: (teamId: string, data: any) =>
    apiClient<{ player: any }>(`/teams/${teamId}/players`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (teamId: string, playerId: string, data: any) =>
    apiClient<{ player: any }>(`/teams/${teamId}/players/${playerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (teamId: string, playerId: string) =>
    apiClient<void>(`/teams/${teamId}/players/${playerId}`, {
      method: 'DELETE',
    }),
};

// Events API
export const eventsApi = {
  list: (teamId: string) =>
    apiClient<{ events: any[] }>(`/teams/${teamId}/events`),
  get: (teamId: string, eventId: string) =>
    apiClient<{ event: any }>(`/teams/${teamId}/events/${eventId}`),
  create: (teamId: string, data: any) =>
    apiClient<{ event: any }>(`/teams/${teamId}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (teamId: string, eventId: string, data: any) =>
    apiClient<{ event: any }>(`/teams/${teamId}/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (teamId: string, eventId: string) =>
    apiClient<void>(`/teams/${teamId}/events/${eventId}`, {
      method: 'DELETE',
    }),
  rsvp: (teamId: string, eventId: string, status: string) =>
    apiClient<{ rsvp: any }>(`/teams/${teamId}/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
};

// Games API
export const gamesApi = {
  list: (teamId: string) =>
    apiClient<{ games: any[] }>(`/teams/${teamId}/games`),
  get: (teamId: string, gameId: string) =>
    apiClient<{ game: any }>(`/teams/${teamId}/games/${gameId}`),
  create: (teamId: string, eventId: string) =>
    apiClient<{ game: any }>(`/teams/${teamId}/games`, {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    }),
  updateScore: (teamId: string, gameId: string, homeScore: number, awayScore: number) =>
    apiClient<{ game: any }>(`/teams/${teamId}/games/${gameId}/score`, {
      method: 'POST',
      body: JSON.stringify({ homeScore, awayScore }),
    }),
  addEvent: (teamId: string, gameId: string, eventData: any) =>
    apiClient<{ gameEvent: any }>(`/teams/${teamId}/games/${gameId}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
  updateStatus: (teamId: string, gameId: string, status: string) =>
    apiClient<{ game: any }>(`/teams/${teamId}/games/${gameId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
};

// Messages API
export const messagesApi = {
  list: (teamId: string) =>
    apiClient<{ messages: any[] }>(`/teams/${teamId}/messages`),
  send: (teamId: string, content: string, isAnnouncement?: boolean) =>
    apiClient<{ message: any }>(`/teams/${teamId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, isAnnouncement }),
    }),
};
