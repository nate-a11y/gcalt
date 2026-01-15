'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Avatar,
  AvatarFallback,
  Badge,
} from '@sideline/ui';
import { playersApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, X, UserPlus } from 'lucide-react';

export default function RosterPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const queryClient = useQueryClient();
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    firstName: '',
    lastName: '',
    jerseyNumber: '',
    position: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['players', teamId],
    queryFn: () => playersApi.list(teamId),
  });

  const addPlayer = useMutation({
    mutationFn: (data: any) => playersApi.create(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', teamId] });
      toast.success('Player added!');
      setShowAddPlayer(false);
      setNewPlayer({ firstName: '', lastName: '', jerseyNumber: '', position: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add player');
    },
  });

  const deletePlayer = useMutation({
    mutationFn: (playerId: string) => playersApi.delete(teamId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', teamId] });
      toast.success('Player removed');
    },
  });

  const players = data?.players || [];

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.firstName || !newPlayer.lastName) return;
    addPlayer.mutate(newPlayer);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Roster</h2>
          <p className="text-muted-foreground">
            {players.length} player{players.length !== 1 ? 's' : ''} on the team
          </p>
        </div>
        <Button onClick={() => setShowAddPlayer(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Player
        </Button>
      </div>

      {/* Add Player Form */}
      {showAddPlayer && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Player</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddPlayer(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={newPlayer.firstName}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, firstName: e.target.value })
                    }
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={newPlayer.lastName}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, lastName: e.target.value })
                    }
                    placeholder="Last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jersey Number</label>
                  <Input
                    value={newPlayer.jerseyNumber}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })
                    }
                    placeholder="e.g., 23"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    value={newPlayer.position}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, position: e.target.value })
                    }
                    placeholder="e.g., Pitcher"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddPlayer(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addPlayer.isPending}>
                  {addPlayer.isPending ? 'Adding...' : 'Add Player'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Players List */}
      {players.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">No players yet</h3>
          <p className="mt-2 text-muted-foreground">
            Add players to build your roster
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player: any) => (
            <Card key={player.id} className="relative">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {player.jerseyNumber || player.firstName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">
                    {player.firstName} {player.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {player.jerseyNumber && (
                      <span>#{player.jerseyNumber}</span>
                    )}
                    {player.position && (
                      <Badge variant="secondary" className="text-xs">
                        {player.position}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm('Remove this player from the roster?')) {
                      deletePlayer.mutate(player.id);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
