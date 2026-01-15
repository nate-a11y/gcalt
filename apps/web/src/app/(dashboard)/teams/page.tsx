'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@sideline/ui';
import { teamsApi } from '@/lib/api';
import { Plus, Users, Calendar, Trophy } from 'lucide-react';

export default function TeamsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: teamsApi.list,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const teams = data?.teams || [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Teams</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your teams and view upcoming events
          </p>
        </div>
        <Link href="/teams/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </Link>
      </div>

      {teams.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">No teams yet</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Create your first team to get started with Sideline.
          </p>
          <Link href="/teams/new" className="mt-6">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Team
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team: any) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold text-lg"
                      style={{ backgroundColor: team.primaryColor || '#3b82f6' }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {team.sport}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3">{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{team.playerCount || 0} players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>{team.record || '0-0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
