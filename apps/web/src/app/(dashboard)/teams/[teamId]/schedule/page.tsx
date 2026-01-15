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
  Badge,
} from '@sideline/ui';
import { eventsApi } from '@/lib/api';
import { toast } from 'sonner';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Plus, X, Calendar, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';

export default function SchedulePage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const queryClient = useQueryClient();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    type: 'game',
    title: '',
    startTime: '',
    location: '',
    opponentName: '',
    isHome: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['events', teamId],
    queryFn: () => eventsApi.list(teamId),
  });

  const addEvent = useMutation({
    mutationFn: (data: any) => eventsApi.create(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', teamId] });
      toast.success('Event created!');
      setShowAddEvent(false);
      setNewEvent({
        type: 'game',
        title: '',
        startTime: '',
        location: '',
        opponentName: '',
        isHome: true,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  const events = data?.events || [];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startTime) return;
    addEvent.mutate({
      ...newEvent,
      startTime: new Date(newEvent.startTime).toISOString(),
    });
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e: any) => isSameDay(parseISO(e.startTime), day));

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
          <h2 className="text-2xl font-bold">Schedule</h2>
          <p className="text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <Button onClick={() => setShowAddEvent(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Add Event Form */}
      {showAddEvent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Event</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddEvent(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="game">Game</option>
                    <option value="practice">Practice</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder={newEvent.type === 'game' ? 'vs Opponent' : 'Event title'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Field/venue name"
                  />
                </div>
                {newEvent.type === 'game' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opponent</label>
                      <Input
                        value={newEvent.opponentName}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, opponentName: e.target.value })
                        }
                        placeholder="Opponent team name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Home/Away</label>
                      <select
                        value={newEvent.isHome ? 'home' : 'away'}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, isHome: e.target.value === 'home' })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddEvent(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addEvent.isPending}>
                  {addEvent.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 rounded-lg border p-2 ${
                    isToday ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      isToday ? 'text-primary' : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </p>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div
                        key={event.id}
                        className={`rounded px-1 py-0.5 text-xs truncate ${
                          event.type === 'game'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No events scheduled yet
            </p>
          ) : (
            <div className="space-y-4">
              {events
                .filter((e: any) => new Date(e.startTime) >= new Date())
                .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="text-center min-w-16">
                      <p className="text-xs text-muted-foreground uppercase">
                        {format(parseISO(event.startTime), 'MMM')}
                      </p>
                      <p className="text-2xl font-bold">
                        {format(parseISO(event.startTime), 'd')}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{event.title}</p>
                        <Badge
                          variant={event.type === 'game' ? 'default' : 'secondary'}
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(event.startTime), 'h:mm a')}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
