// src/hooks/use-watch-room.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { type ChatMessage, type Participant } from '@/lib/watch-room-api';

// ===== WebSocket Message Types =====

// Client-to-Server
type WsClientMessage =
  | { type: 'send_message'; content: string; message_type: 'text' }
  | { type: 'edit_message'; message_id: string; new_content: string }
  | { type: 'play'; current_time: number }
  | { type: 'pause'; current_time: number }
  | { type: 'seek'; current_time: number }
  | { type: 'change_episode'; episode: number; current_time: number }
  | { type: 'heartbeat' }
  | { type: 'get_participants' }
  | { type: 'get_messages'; limit: number; offset: number };

// Server-to-Client
interface WsServerMessageBase { type: string; }

interface ChatMessageEvent extends WsServerMessageBase {
  type: 'chat_message';
  message: ChatMessage;
}
interface MessageEditedEvent extends WsServerMessageBase {
  type: 'message_edited';
  message_id: string;
  new_content: string;
  edited_at: string;
}
interface PlaybackEvent extends WsServerMessageBase {
  type: 'play' | 'pause' | 'seek';
  current_time: number;
}
interface EpisodeChangeEvent extends WsServerMessageBase {
  type: 'episode_change';
  episode: number;
  current_time: number;
}
interface UserJoinedEvent extends WsServerMessageBase {
  type: 'user_joined';
  user: Participant;
}
interface UserLeftEvent extends WsServerMessageBase {
  type: 'user_left';
  user_id: string;
  username: string;
}
interface ErrorEvent extends WsServerMessageBase {
  type: 'error';
  message: string;
  code: string;
}
interface ParticipantsListEvent extends WsServerMessageBase {
  type: 'participants_list';
  participants: Participant[];
}
interface MessageHistoryEvent extends WsServerMessageBase {
  type: 'message_history';
  messages: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

type WsServerMessage =
  | ChatMessageEvent
  | MessageEditedEvent
  | PlaybackEvent
  | EpisodeChangeEvent
  | UserJoinedEvent
  | UserLeftEvent
  | ErrorEvent
  | ParticipantsListEvent
  | MessageHistoryEvent;

// ===== Hook State =====
interface WatchRoomState {
  participants: Participant[];
  messages: ChatMessage[];
  isPlaying: boolean;
  currentTime: number;
  currentEpisode: number;
  isConnected: boolean;
  error: { message: string; code: string } | null;
}

// ===== Hook =====
export const useWatchRoom = (roomId: string) => {
  const [state, setState] = useState<WatchRoomState>({
    participants: [],
    messages: [],
    isPlaying: false,
    currentTime: 0,
    currentEpisode: 1,
    isConnected: false,
    error: null,
  });

  const ws = useRef<WebSocket | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = useCallback((message: WsClientMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const connect = useCallback(() => {
    if (ws.current || !roomId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setState(s => ({
        ...s,
        error: { message: 'Authentication token not found.', code: 'NO_TOKEN' }
      }));
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/watch-room/${roomId}?token=${token}`;
    console.log('Connecting to:', wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setState(s => ({ ...s, isConnected: true, error: null }));

      // Request initial data
      sendMessage({ type: 'get_participants' });
      sendMessage({ type: 'get_messages', limit: 100, offset: 0 });

      // Start heartbeat
      heartbeatInterval.current = setInterval(() => {
        sendMessage({ type: 'heartbeat' });
      }, 30000);
    };

    ws.current.onmessage = (event) => {
      const data: WsServerMessage = JSON.parse(event.data);

      setState(prevState => {
        switch (data.type) {
          case 'chat_message':
            if (prevState.messages.some(msg => msg.id === data.message.id)) {
              return prevState;
            }
            return { ...prevState, messages: [...prevState.messages, data.message] };

          case 'message_edited':
            return {
              ...prevState,
              messages: prevState.messages.map(msg =>
                msg.id === data.message_id
                  ? { ...msg, content: data.new_content, edited_at: data.edited_at }
                  : msg
              ),
            };

          case 'play':
          case 'pause':
          case 'seek':
            return {
              ...prevState,
              isPlaying: data.type === 'play',
              currentTime: data.current_time
            };

          case 'episode_change':
            return {
              ...prevState,
              currentEpisode: data.episode,
              currentTime: data.current_time,
              isPlaying: false,
              messages: []
            };

          case 'user_joined':
            return {
              ...prevState,
              participants: prevState.participants.find(p => p.user_id === data.user.user_id)
                ? prevState.participants.map(p =>
                    p.user_id === data.user.user_id
                      ? { ...data.user, is_online: true }
                      : p
                  )
                : [...prevState.participants, { ...data.user, is_online: true }]
            };

          case 'user_left':
            return {
              ...prevState,
              participants: prevState.participants.map(p =>
                p.user_id === data.user_id ? { ...p, is_online: false } : p
              )
            };

          case 'participants_list':
            return { ...prevState, participants: data.participants };

          case 'message_history':
            return {
              ...prevState,
              messages: data.messages.sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
            };

          case 'error':
            console.error('WebSocket error from server:', data);
            return {
              ...prevState,
              error: { message: data.message, code: data.code }
            };

          default:
            return prevState;
        }
      });
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.reason);
      setState(s => ({ ...s, isConnected: false }));
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      ws.current = null;
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState(s => ({
        ...s,
        error: { message: 'WebSocket connection error.', code: 'WS_ERROR' }
      }));
    };
  }, [roomId, sendMessage]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  useEffect(() => {
    if (roomId) connect();
    return () => disconnect();
  }, [roomId, connect, disconnect]);

  const sendChatMessage = useCallback((content: string) => {
    sendMessage({ type: 'send_message', content, message_type: 'text' });
  }, [sendMessage]);

  const sendPlaybackCommand = useCallback(
    (type: 'play' | 'pause' | 'seek', currentTime: number) => {
      sendMessage({ type, current_time: currentTime });
    },
    [sendMessage]
  );

  const changeEpisode = useCallback(
    (episode: number, currentTime = 0) => {
      sendMessage({ type: 'change_episode', episode, current_time: currentTime });
    },
    [sendMessage]
  );

  return {
    state,
    sendChatMessage,
    sendPlaybackCommand,
    changeEpisode
  };
};
