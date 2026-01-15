'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@sideline/ui';
import { teamsApi, eventsApi, gamesApi } from '@/lib/api';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TeamOverviewPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const { data: teamData } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsApi.get(teamId),
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events', teamId],
    queryFn: () => eventsApi.list(teamId),
  });

  const { data: gamesData } = useQuery({
    queryKey: ['games', teamId],
    queryFn: () => gamesApi.list(teamId),
  });

  const team = teamData?.team;
  const events = eventsData?.events || [];
  const games = gamesData?.games || [];

  const upcomingEvents = events
    .filter((e: any) => new Date(e.startTime) >= new Date())
    .slice(0, 5);

  const recentGames = games
    .filter((g: any) => g.status === 'final')
    .slice(0, 5);

  const record = {
    wins: recentGames.filter((g: any) =>
      (g.isHome && g.homeScore > g.awayScore) || (!g.isHome && g.awayScore > g.homeScore)
    ).length,
    losses: recentGames.filter((g: any) =>
      (g.isHome && g.homeScore < g.awayScore) || (!g.isHome && g.awayScore < g.homeScore)
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Record</p>
              <p className="text-2xl font-bold">{record.wins}-{record.losses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Players</p>
              <p className="text-2xl font-bold">{team?.playerCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingEvents.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Games Played</p>
              <p className="text-2xl font-bold">{recentGames.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Link
              href={`/teams/${teamId}/schedule`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No upcoming events scheduled
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase">
                        {format(new Date(event.startTime), 'MMM')}
                      </p>
                      <p className="text-2xl font-bold">
                        {format(new Date(event.startTime), 'd')}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startTime), 'h:mm a')}
                        {event.location && ` • ${event.location}`}
                      </p>
                    </div>
                    <Badge variant={event.type === 'game' ? 'default' : 'secondary'}>
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Games */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Games</CardTitle>
            <Link
              href={`/teams/${teamId}/games`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentGames.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No games played yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentGames.map((game: any) => {
                  const won = (game.isHome && game.homeScore > game.awayScore) ||
                    (!game.isHome && game.awayScore > game.homeScore);
                  return (
                    <Link
                      key={game.id}
                      href={`/teams/${teamId}/games/${game.id}`}
                      className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <Badge variant={won ? 'success' : 'destructive'}>
                        {won ? 'W' : 'L'}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">
                          vs {game.opponentName || 'Opponent'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(game.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="text-lg font-bold">
                        {game.isHome
                          ? `${game.homeScore}-${game.awayScore}`
                          : `${game.awayScore}-${game.homeScore}`}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
