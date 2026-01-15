import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { GameCard } from '@/components/GameCard';
import { TeamCard } from '@/components/TeamCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API calls
  const liveGames = [
    {
      id: '1',
      homeTeam: 'Eagles',
      awayTeam: 'Hawks',
      homeScore: 5,
      awayScore: 3,
      status: 'in_progress' as const,
      inning: 4,
      sport: 'baseball',
    },
    {
      id: '2',
      homeTeam: 'Panthers',
      awayTeam: 'Lions',
      homeScore: 24,
      awayScore: 18,
      status: 'in_progress' as const,
      period: 3,
      sport: 'basketball',
    },
  ];

  const upcomingGames = [
    {
      id: '3',
      homeTeam: 'Eagles',
      awayTeam: 'Tigers',
      date: new Date(Date.now() + 86400000),
      sport: 'baseball',
    },
  ];

  const teams = [
    { id: '1', name: 'Eagles', sport: 'Baseball', role: 'Coach' },
    { id: '2', name: 'Panthers', sport: 'Basketball', role: 'Parent' },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch fresh data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0] || 'there'}!</Text>
        <Text style={styles.subGreeting}>Here's what's happening today</Text>
      </View>

      {/* Live Games */}
      {liveGames.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionTitle}>Live Now</Text>
            </View>
          </View>
          {liveGames.map(game => (
            <Link key={game.id} href={`/game/${game.id}`} asChild>
              <TouchableOpacity>
                <GameCard game={game} isLive />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}

      {/* Upcoming Games */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Games</Text>
        {upcomingGames.map(game => (
          <Link key={game.id} href={`/game/${game.id}`} asChild>
            <TouchableOpacity>
              <GameCard game={game} />
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* My Teams */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Teams</Text>
          <Link href="/teams" asChild>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {teams.map(team => (
            <Link key={team.id} href={`/team/${team.id}`} asChild>
              <TouchableOpacity>
                <TeamCard team={team} compact />
              </TouchableOpacity>
            </Link>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Link href="/(tabs)/scorekeeping" asChild>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Start Scorekeeping</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/schedule" asChild>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Add Event</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>🎥</Text>
            <Text style={styles.quickActionText}>Record Game</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#10B981',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  viewAll: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
