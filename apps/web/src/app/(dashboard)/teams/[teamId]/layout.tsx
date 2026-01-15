'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { teamsApi } from '@/lib/api';
import { Badge } from '@sideline/ui';
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  Trophy,
  Settings,
  BarChart3,
} from 'lucide-react';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;

  const { data, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsApi.get(teamId),
  });

  const team = data?.team;

  const navItems = [
    { href: `/teams/${teamId}`, label: 'Overview', icon: Home },
    { href: `/teams/${teamId}/roster`, label: 'Roster', icon: Users },
    { href: `/teams/${teamId}/schedule`, label: 'Schedule', icon: Calendar },
    { href: `/teams/${teamId}/games`, label: 'Games', icon: Trophy },
    { href: `/teams/${teamId}/messages`, label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Team Header */}
      <header className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center gap-4">
            {team && (
              <>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-lg text-white font-bold text-xl"
                  style={{ backgroundColor: team.primaryColor || '#3b82f6' }}
                >
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {team.sport}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {team.playerCount || 0} players
                    </span>
                  </div>
                </div>
              </>
            )}
            {isLoading && (
              <div className="h-14 w-48 animate-pulse rounded bg-muted" />
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-1 px-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
