'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@sideline/ui';
import { gamesApi, eventsApi } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { Trophy, Play, Clock, MapPin } from 'lucide-react';

export default function GamesPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['games', teamId],
    queryFn: () => gamesApi.list(teamId),
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', teamId],
    queryFn: () => eventsApi.list(teamId),
  });

  const games = gamesData?.games || [];
  const events = eventsData?.events || [];

  // Get upcoming game events that don't have games created yet
  const upcomingGameEvents = events
    .filter(
      (e: any) =>
        e.type === 'game' &&
        new Date(e.startTime) >= new Date() &&
        !games.some((g: any) => g.eventId === e.id)
    )
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const isLoading = gamesLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Separate live, upcoming, and completed games
  const liveGames = games.filter((g: any) => g.status === 'in_progress');
  const completedGames = games
    .filter((g: any) => g.status === 'final')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Games</h2>
        <p className="text-muted-foreground">
          Live scorekeeping and game history
        </p>
      </div>

      {/* Live Games */}
      {liveGames.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Now
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {liveGames.map((game: any) => (
              <Link key={game.id} href={`/teams/${teamId}/games/${game.id}`}>
                <Card className="border-green-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="success" className="mb-2">
                          Live
                        </Badge>
                        <p className="font-semibold text-lg">
                          vs {game.opponentName || 'Opponent'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {game.isHome ? 'Home' : 'Away'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold">
                          {game.isHome
                            ? `${game.homeScore}-${game.awayScore}`
                            : `${game.awayScore}-${game.homeScore}`}
                        </p>
                        {game.currentPeriod && (
                          <p className="text-sm text-muted-foreground">
                            Period {game.currentPeriod}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Games */}
      {upcomingGameEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upcoming Games</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingGameEvents.map((event: any) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(parseISO(event.startTime), 'MMM d, h:mm a')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {event.isHome ? 'Home' : 'Away'}
                    </Badge>
                  </div>
                  <Link href={`/teams/${teamId}/games/new?eventId=${event.id}`}>
                    <Button className="w-full mt-4 gap-2">
                      <Play className="h-4 w-4" />
                      Start Scorekeeping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Games */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Game History</h3>
        {completedGames.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">No games yet</h3>
            <p className="mt-2 text-muted-foreground">
              Schedule a game to start scorekeeping
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {completedGames.map((game: any) => {
              const won =
                (game.isHome && game.homeScore > game.awayScore) ||
                (!game.isHome && game.awayScore > game.homeScore);
              const tied = game.homeScore === game.awayScore;

              return (
                <Link key={game.id} href={`/teams/${teamId}/games/${game.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Badge
                        variant={tied ? 'secondary' : won ? 'success' : 'destructive'}
                        className="w-8 text-center"
                      >
                        {tied ? 'T' : won ? 'W' : 'L'}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {game.isHome ? 'vs' : '@'} {game.opponentName || 'Opponent'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(game.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="text-2xl font-bold">
                        {game.isHome
                          ? `${game.homeScore}-${game.awayScore}`
                          : `${game.awayScore}-${game.homeScore}`}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
