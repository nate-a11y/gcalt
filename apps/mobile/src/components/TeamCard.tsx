import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Team {
  id: string;
  name: string;
  sport: string;
  role?: string;
  season?: string;
  record?: string;
}

interface TeamCardProps {
  team: Team;
  compact?: boolean;
}

export function TeamCard({ team, compact }: TeamCardProps) {
  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
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

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'coach':
        return '#10B981';
      case 'parent':
        return '#3B82F6';
      case 'manager':
        return '#8B5CF6';
      case 'player':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <View style={[styles.compactIcon, { backgroundColor: `${getRoleBadgeColor(team.role)}20` }]}>
          <Ionicons name={getSportIcon(team.sport) as any} size={24} color={getRoleBadgeColor(team.role)} />
        </View>
        <Text style={styles.compactName} numberOfLines={1}>{team.name}</Text>
        <Text style={styles.compactSport}>{team.sport}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${getRoleBadgeColor(team.role)}15` }]}>
          <Ionicons name={getSportIcon(team.sport) as any} size={28} color={getRoleBadgeColor(team.role)} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{team.name}</Text>
          <Text style={styles.sport}>{team.sport}</Text>
          {team.season && (
            <Text style={styles.season}>{team.season}</Text>
          )}
        </View>
        <View style={styles.rightContent}>
          {team.role && (
            <View style={[styles.roleBadge, { backgroundColor: `${getRoleBadgeColor(team.role)}15` }]}>
              <Text style={[styles.roleText, { color: getRoleBadgeColor(team.role) }]}>
                {team.role}
              </Text>
            </View>
          )}
          {team.record && (
            <Text style={styles.record}>{team.record}</Text>
          )}
        </View>
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sport: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  season: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  record: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  // Compact styles
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 120,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  compactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  compactSport: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
