import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TeamCard } from '@/components/TeamCard';

export default function TeamsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API calls
  const teams = [
    { id: '1', name: 'Eagles', sport: 'Baseball', role: 'Coach', season: 'Spring 2024', record: '8-2' },
    { id: '2', name: 'Panthers', sport: 'Basketball', role: 'Parent', season: 'Winter 2024', record: '5-3' },
    { id: '3', name: 'Thunder', sport: 'Soccer', role: 'Manager', season: 'Fall 2024', record: '6-1-2' },
  ];

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Teams List */}
      <ScrollView style={styles.teamsList}>
        {filteredTeams.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No teams found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try a different search term' : 'Create or join a team to get started'}
            </Text>
          </View>
        ) : (
          filteredTeams.map(team => (
            <Link key={team.id} href={`/team/${team.id}`} asChild>
              <TouchableOpacity>
                <TeamCard team={team} />
              </TouchableOpacity>
            </Link>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: '#10B981',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamsList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
