import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Event {
  id: string;
  type: 'game' | 'practice' | 'event';
  title: string;
  team: string;
  date: Date;
  location: string;
  opponent?: string;
}

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data
  const events: Event[] = [
    {
      id: '1',
      type: 'game',
      title: 'vs Hawks',
      team: 'Eagles',
      date: new Date(),
      location: 'Home Field',
      opponent: 'Hawks',
    },
    {
      id: '2',
      type: 'practice',
      title: 'Team Practice',
      team: 'Eagles',
      date: new Date(),
      location: 'Practice Field A',
    },
    {
      id: '3',
      type: 'game',
      title: 'vs Lions',
      team: 'Panthers',
      date: new Date(Date.now() + 86400000),
      location: 'Away - Lion Park',
      opponent: 'Lions',
    },
  ];

  // Generate week dates
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(e => e.date.toDateString() === date.toDateString());
  };

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'game': return 'trophy';
      case 'practice': return 'fitness';
      case 'event': return 'calendar';
    }
  };

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'game': return '#10B981';
      case 'practice': return '#3B82F6';
      case 'event': return '#8B5CF6';
    }
  };

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => {
          const prev = new Date(selectedDate);
          prev.setMonth(prev.getMonth() - 1);
          setSelectedDate(prev);
        }}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => {
          const next = new Date(selectedDate);
          next.setMonth(next.getMonth() + 1);
          setSelectedDate(next);
        }}>
          <Ionicons name="chevron-forward" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Week View */}
      <View style={styles.weekContainer}>
        {weekDates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              isSelected(date) && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[
              styles.dayName,
              isSelected(date) && styles.dayTextSelected,
            ]}>
              {dayNames[index]}
            </Text>
            <View style={[
              styles.dayNumber,
              isToday(date) && styles.dayNumberToday,
              isSelected(date) && styles.dayNumberSelected,
            ]}>
              <Text style={[
                styles.dayNumberText,
                (isToday(date) || isSelected(date)) && styles.dayTextSelected,
              ]}>
                {date.getDate()}
              </Text>
            </View>
            {getEventsForDate(date).length > 0 && (
              <View style={styles.eventDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsList}>
        <Text style={styles.dateHeader}>
          {selectedDate.toLocaleDateString('default', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {selectedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No events scheduled</Text>
          </View>
        ) : (
          selectedEvents.map(event => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={[styles.eventIndicator, { backgroundColor: getEventColor(event.type) }]} />
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>
                    {event.date.toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.eventTeam}>{event.team}</Text>
                <View style={styles.eventMeta}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </View>
              <Ionicons name={getEventIcon(event.type)} size={24} color={getEventColor(event.type)} />
            </TouchableOpacity>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  weekContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  dayButtonSelected: {
    backgroundColor: '#D1FAE5',
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberToday: {
    backgroundColor: '#10B981',
  },
  dayNumberSelected: {
    backgroundColor: '#10B981',
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 4,
  },
  eventsList: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  eventCard: {
    flexDirection: 'row',
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
  eventIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventTeam: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 2,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eventLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPadding: {
    height: 80,
  },
});
