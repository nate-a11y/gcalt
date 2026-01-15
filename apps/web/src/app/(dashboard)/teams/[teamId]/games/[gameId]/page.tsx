'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@sideline/ui';
import { gamesApi, playersApi } from '@/lib/api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Plus, Minus, Play, Square, Flag } from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const gameId = params.gameId as string;
  const queryClient = useQueryClient();

  const { data: gameData, isLoading: gameLoading } = useQuery({
    queryKey: ['game', teamId, gameId],
    queryFn: () => gamesApi.get(teamId, gameId),
    refetchInterval: 3000, // Real-time updates
  });

  const { data: playersData } = useQuery({
    queryKey: ['players', teamId],
    queryFn: () => playersApi.list(teamId),
  });

  const updateScore = useMutation({
    mutationFn: ({ homeScore, awayScore }: { homeScore: number; awayScore: number }) =>
      gamesApi.updateScore(teamId, gameId, homeScore, awayScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', teamId, gameId] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => gamesApi.updateStatus(teamId, gameId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', teamId, gameId] });
      queryClient.invalidateQueries({ queryKey: ['games', teamId] });
      toast.success('Game status updated');
    },
  });

  const game = gameData?.game;
  const players = playersData?.players || [];

  if (gameLoading || !game) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isLive = game.status === 'in_progress';
  const isFinal = game.status === 'final';

  const handleScoreChange = (team: 'home' | 'away', delta: number) => {
    const newHomeScore = team === 'home' ? Math.max(0, game.homeScore + delta) : game.homeScore;
    const newAwayScore = team === 'away' ? Math.max(0, game.awayScore + delta) : game.awayScore;
    updateScore.mutate({ homeScore: newHomeScore, awayScore: newAwayScore });
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">
              {game.isHome ? 'vs' : '@'} {game.opponentName || 'Opponent'}
            </h2>
            <Badge
              variant={
                isLive ? 'success' : isFinal ? 'secondary' : 'default'
              }
            >
              {isLive && <span className="mr-1 h-2 w-2 rounded-full bg-white animate-pulse inline-block" />}
              {game.status === 'scheduled' ? 'Scheduled' : isLive ? 'Live' : 'Final'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {format(parseISO(game.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          {game.status === 'scheduled' && (
            <Button onClick={() => updateStatus.mutate('in_progress')} className="gap-2">
              <Play className="h-4 w-4" />
              Start Game
            </Button>
          )}
          {isLive && (
            <Button
              onClick={() => updateStatus.mutate('final')}
              variant="destructive"
              className="gap-2"
            >
              <Flag className="h-4 w-4" />
              End Game
            </Button>
          )}
        </div>
      </div>

      {/* Scoreboard */}
      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 items-center gap-8">
            {/* Home Team */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {game.isHome ? 'Your Team' : game.opponentName || 'Opponent'}
              </p>
              <p className="text-6xl font-bold">{game.homeScore}</p>
              {isLive && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleScoreChange('home', -1)}
                    disabled={game.homeScore === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleScoreChange('home', 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* VS / Period */}
            <div className="text-center">
              <p className="text-4xl font-bold text-muted-foreground">-</p>
              {game.currentPeriod && (
                <p className="text-sm text-muted-foreground mt-2">
                  Period {game.currentPeriod}
                </p>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {!game.isHome ? 'Your Team' : game.opponentName || 'Opponent'}
              </p>
              <p className="text-6xl font-bold">{game.awayScore}</p>
              {isLive && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleScoreChange('away', -1)}
                    disabled={game.awayScore === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => handleScoreChange('away', 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats / Play-by-Play would go here */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Play-by-Play</CardTitle>
          </CardHeader>
          <CardContent>
            {game.gameEvents?.length > 0 ? (
              <div className="space-y-3">
                {game.gameEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 border-b pb-3 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(event.timestamp), 'h:mm a')}
                    </span>
                    <span className="text-sm">{event.description || event.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No events recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Player Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Player statistics will appear here during the game
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
