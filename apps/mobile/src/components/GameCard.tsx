import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status?: 'scheduled' | 'in_progress' | 'final';
  date?: Date;
  sport: string;
  inning?: number;
  period?: number;
}

interface GameCardProps {
  game: Game;
  isLive?: boolean;
}

export function GameCard({ game, isLive }: GameCardProps) {
  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'baseball':
      case 'softball':
        return 'baseball';
      case 'basketball':
        return 'basketball';
      case 'soccer':
        return 'football';
      case 'football':
        return 'american-football';
      case 'volleyball':
        return 'tennisball';
      default:
        return 'trophy';
    }
  };

  const getPeriodLabel = (sport: string, period?: number, inning?: number) => {
    if (sport === 'baseball' || sport === 'softball') {
      return inning ? `${getOrdinal(inning)} Inning` : '';
    }
    if (sport === 'basketball') {
      return period ? `${getOrdinal(period)} Quarter` : '';
    }
    if (sport === 'soccer') {
      return period ? `${period === 1 ? '1st Half' : '2nd Half'}` : '';
    }
    return '';
  };

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (isLive) {
    return (
      <View style={styles.liveCard}>
        <View style={styles.liveHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.periodText}>
            {getPeriodLabel(game.sport, game.period, game.inning)}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.teamRow}>
            <View style={styles.teamInfo}>
              <Ionicons name={getSportIcon(game.sport) as any} size={20} color="#10B981" />
              <Text style={styles.teamName}>{game.homeTeam}</Text>
            </View>
            <Text style={styles.score}>{game.homeScore}</Text>
          </View>
          <View style={styles.teamRow}>
            <View style={styles.teamInfo}>
              <View style={{ width: 20 }} />
              <Text style={styles.teamName}>{game.awayTeam}</Text>
            </View>
            <Text style={styles.score}>{game.awayScore}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={getSportIcon(game.sport) as any} size={18} color="#6B7280" />
        <Text style={styles.dateText}>
          {game.date?.toLocaleDateString('default', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View style={styles.matchup}>
        <Text style={styles.matchupText}>
          {game.homeTeam} vs {game.awayTeam}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  matchup: {
    marginTop: 4,
  },
  matchupText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  periodText: {
    fontSize: 12,
    color: '#6B7280',
  },
  scoreContainer: {
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
});
