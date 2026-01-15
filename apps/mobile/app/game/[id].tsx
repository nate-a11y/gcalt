import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useGameUpdates } from '@/hooks/useRealtime';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isConnected, score, plays } = useGameUpdates(id);
  const [activeTab, setActiveTab] = useState<'plays' | 'boxscore' | 'stats'>('plays');

  // Mock game data
  const game = {
    id,
    homeTeam: { name: 'Eagles', score: 5 },
    awayTeam: { name: 'Hawks', score: 3 },
    status: 'in_progress' as const,
    sport: 'baseball',
    inning: 4,
    half: 'top',
    outs: 2,
    balls: 2,
    strikes: 1,
  };

  const mockPlays = [
    { id: '1', time: '4th', description: 'Johnson doubles to left field', team: 'Eagles', type: 'hit' },
    { id: '2', time: '4th', description: 'Smith strikes out swinging', team: 'Hawks', type: 'out' },
    { id: '3', time: '3rd', description: 'Williams homers to center field (2 RBI)', team: 'Eagles', type: 'homerun' },
    { id: '4', time: '3rd', description: 'Brown grounds out to shortstop', team: 'Hawks', type: 'out' },
    { id: '5', time: '3rd', description: 'Davis singles to right field', team: 'Eagles', type: 'hit' },
  ];

  return (
    <View style={styles.container}>
      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="cloud-offline" size={16} color="#F59E0B" />
          <Text style={styles.connectionText}>Reconnecting...</Text>
        </View>
      )}

      {/* Score Header */}
      <View style={styles.scoreHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{game.homeTeam.name}</Text>
            <Text style={styles.score}>{game.homeTeam.score}</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.inningText}>
              {game.half === 'top' ? '▲' : '▼'} {game.inning}
            </Text>
            <View style={styles.countContainer}>
              <Text style={styles.countLabel}>{game.balls}-{game.strikes}</Text>
              <View style={styles.outs}>
                {[0, 1, 2].map(i => (
                  <View
                    key={i}
                    style={[styles.outDot, i < game.outs && styles.outDotActive]}
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.teamScore}>
            <Text style={styles.score}>{game.awayTeam.score}</Text>
            <Text style={styles.teamName}>{game.awayTeam.name}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['plays', 'boxscore', 'stats'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'plays' && (
          <View style={styles.playsList}>
            {mockPlays.map(play => (
              <View key={play.id} style={styles.playCard}>
                <View style={[styles.playIndicator, getPlayColor(play.type)]} />
                <View style={styles.playContent}>
                  <View style={styles.playHeader}>
                    <Text style={styles.playTeam}>{play.team}</Text>
                    <Text style={styles.playTime}>{play.time}</Text>
                  </View>
                  <Text style={styles.playDescription}>{play.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'boxscore' && (
          <View style={styles.boxScore}>
            <View style={styles.boxScoreHeader}>
              <Text style={styles.boxScoreTitle}>Inning-by-Inning</Text>
            </View>
            <View style={styles.inningRow}>
              <View style={styles.inningTeam}>
                <Text style={styles.inningTeamName}>Team</Text>
              </View>
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <View key={i} style={styles.inningCell}>
                  <Text style={styles.inningNumber}>{i}</Text>
                </View>
              ))}
              <View style={styles.inningTotal}>
                <Text style={styles.inningNumber}>R</Text>
              </View>
            </View>
            <View style={styles.inningRow}>
              <View style={styles.inningTeam}>
                <Text style={styles.inningTeamValue}>{game.homeTeam.name}</Text>
              </View>
              {[2, 0, 1, 2, '-', '-', '-'].map((r, i) => (
                <View key={i} style={styles.inningCell}>
                  <Text style={styles.inningValue}>{r}</Text>
                </View>
              ))}
              <View style={styles.inningTotal}>
                <Text style={styles.inningTotalValue}>{game.homeTeam.score}</Text>
              </View>
            </View>
            <View style={styles.inningRow}>
              <View style={styles.inningTeam}>
                <Text style={styles.inningTeamValue}>{game.awayTeam.name}</Text>
              </View>
              {[1, 0, 2, 0, '-', '-', '-'].map((r, i) => (
                <View key={i} style={styles.inningCell}>
                  <Text style={styles.inningValue}>{r}</Text>
                </View>
              ))}
              <View style={styles.inningTotal}>
                <Text style={styles.inningTotalValue}>{game.awayTeam.score}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Team Leaders</Text>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Batting Average</Text>
              <Text style={styles.statPlayer}>J. Johnson</Text>
              <Text style={styles.statValue}>.425</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Home Runs</Text>
              <Text style={styles.statPlayer}>M. Williams</Text>
              <Text style={styles.statValue}>3</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>RBIs</Text>
              <Text style={styles.statPlayer}>M. Williams</Text>
              <Text style={styles.statValue}>8</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
          <Ionicons name="videocam" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Watch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getPlayColor(type: string) {
  switch (type) {
    case 'homerun':
      return { backgroundColor: '#10B981' };
    case 'hit':
      return { backgroundColor: '#3B82F6' };
    case 'out':
      return { backgroundColor: '#EF4444' };
    case 'walk':
      return { backgroundColor: '#F59E0B' };
    default:
      return { backgroundColor: '#6B7280' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
  },
  connectionText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
  },
  scoreHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
  },
  gameInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inningText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  countContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  countLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  outs: {
    flexDirection: 'row',
    marginTop: 4,
  },
  outDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 2,
  },
  outDotActive: {
    backgroundColor: '#EF4444',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  playsList: {
    padding: 16,
  },
  playCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  playIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  playContent: {
    flex: 1,
  },
  playHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  playTeam: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  playTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  playDescription: {
    fontSize: 14,
    color: '#1F2937',
  },
  boxScore: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  boxScoreHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  boxScoreTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  inningRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  inningTeam: {
    width: 80,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  inningTeamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  inningTeamValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  inningCell: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  inningNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  inningValue: {
    fontSize: 12,
    color: '#1F2937',
  },
  inningTotal: {
    width: 40,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  inningTotalValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsContainer: {
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  statPlayer: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
