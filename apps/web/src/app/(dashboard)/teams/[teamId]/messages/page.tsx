'use client';

import { useState, useRef, useEffect } from 'react';
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
import { messagesApi } from '@/lib/api';
import { useUser } from '@/lib/auth';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Send, Megaphone } from 'lucide-react';

export default function MessagesPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const queryClient = useQueryClient();
  const user = useUser();
  const [message, setMessage] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['messages', teamId],
    queryFn: () => messagesApi.list(teamId),
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  const sendMessage = useMutation({
    mutationFn: ({ content, isAnnouncement }: { content: string; isAnnouncement: boolean }) =>
      messagesApi.send(teamId, content, isAnnouncement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', teamId] });
      setMessage('');
      setIsAnnouncement(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  const messages = data?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate({ content: message.trim(), isAnnouncement });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Team Messages</h2>
        <p className="text-muted-foreground">
          Stay connected with your team
        </p>
      </div>

      {/* Messages Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg: any) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {msg.senderName
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {isOwn ? 'You' : msg.senderName || 'Unknown'}
                        </span>
                        {msg.isAnnouncement && (
                          <Badge variant="secondary" className="text-xs">
                            <Megaphone className="h-3 w-3 mr-1" />
                            Announcement
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(msg.createdAt), 'h:mm a')}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          msg.isAnnouncement
                            ? 'bg-primary/10 border border-primary/20'
                            : isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Button
                type="button"
                variant={isAnnouncement ? 'default' : 'outline'}
                size="icon"
                onClick={() => setIsAnnouncement(!isAnnouncement)}
                title="Send as announcement"
              >
                <Megaphone className="h-4 w-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isAnnouncement
                    ? 'Type an announcement...'
                    : 'Type a message...'
                }
                className="flex-1"
              />
            </div>
            <Button type="submit" disabled={sendMessage.isPending || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
