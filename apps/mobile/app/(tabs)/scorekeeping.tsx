import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Sport = 'baseball' | 'basketball' | 'soccer' | 'football' | 'volleyball';

interface ActiveGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  sport: Sport;
  startedAt: Date;
}

export default function ScorekeepingScreen() {
  // Mock data
  const activeGames: ActiveGame[] = [
    {
      id: '1',
      homeTeam: 'Eagles',
      awayTeam: 'Hawks',
      homeScore: 5,
      awayScore: 3,
      sport: 'baseball',
      startedAt: new Date(Date.now() - 3600000),
    },
  ];

  const upcomingGames = [
    { id: '2', homeTeam: 'Eagles', awayTeam: 'Tigers', date: new Date(Date.now() + 86400000), sport: 'baseball' as Sport },
    { id: '3', homeTeam: 'Panthers', awayTeam: 'Lions', date: new Date(Date.now() + 172800000), sport: 'basketball' as Sport },
  ];

  const getSportIcon = (sport: Sport) => {
    switch (sport) {
      case 'baseball': return 'baseball';
      case 'basketball': return 'basketball';
      case 'soccer': return 'football';
      case 'football': return 'american-football';
      case 'volleyball': return 'tennisball';
      default: return 'trophy';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Active Games */}
      {activeGames.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionTitle}>Active Games</Text>
            </View>
          </View>
          {activeGames.map(game => (
            <Link key={game.id} href={`/game/${game.id}`} asChild>
              <TouchableOpacity style={styles.activeGameCard}>
                <View style={styles.activeGameHeader}>
                  <Ionicons name={getSportIcon(game.sport) as any} size={24} color="#10B981" />
                  <Text style={styles.activeGameDuration}>
                    {Math.floor((Date.now() - game.startedAt.getTime()) / 60000)} min
                  </Text>
                </View>
                <View style={styles.scoreRow}>
                  <View style={styles.teamScore}>
                    <Text style={styles.teamName}>{game.homeTeam}</Text>
                    <Text style={styles.score}>{game.homeScore}</Text>
                  </View>
                  <Text style={styles.vs}>-</Text>
                  <View style={styles.teamScore}>
                    <Text style={styles.score}>{game.awayScore}</Text>
                    <Text style={styles.teamName}>{game.awayTeam}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.continueButton}>
                  <Text style={styles.continueButtonText}>Continue Scorekeeping</Text>
                  <Ionicons name="arrow-forward" size={16} color="#10B981" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}

      {/* Start New Game */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start Scorekeeping</Text>

        {upcomingGames.length > 0 && (
          <>
            <Text style={styles.subTitle}>Upcoming Games</Text>
            {upcomingGames.map(game => (
              <TouchableOpacity key={game.id} style={styles.upcomingGameCard}>
                <View style={styles.upcomingGameInfo}>
                  <Ionicons name={getSportIcon(game.sport) as any} size={20} color="#6B7280" />
                  <View style={styles.upcomingGameDetails}>
                    <Text style={styles.upcomingGameTeams}>
                      {game.homeTeam} vs {game.awayTeam}
                    </Text>
                    <Text style={styles.upcomingGameDate}>
                      {game.date.toLocaleDateString('default', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.newGameButton}>
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.newGameButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Games */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Games</Text>
        <View style={styles.recentGameCard}>
          <View style={styles.recentGameHeader}>
            <Ionicons name="baseball" size={18} color="#6B7280" />
            <Text style={styles.recentGameDate}>Yesterday</Text>
          </View>
          <Text style={styles.recentGameResult}>Eagles 8 - Hawks 5</Text>
          <Text style={styles.recentGameStatus}>Final</Text>
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
  subTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
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
  activeGameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeGameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeGameDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamScore: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 12,
  },
  vs: {
    fontSize: 20,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 12,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginRight: 8,
  },
  upcomingGameCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  upcomingGameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingGameDetails: {
    marginLeft: 12,
  },
  upcomingGameTeams: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  upcomingGameDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  newGameButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  newGameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recentGameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  recentGameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentGameDate: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  recentGameResult: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  recentGameStatus: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
});
