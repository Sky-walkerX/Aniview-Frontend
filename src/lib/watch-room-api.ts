// src/lib/watch-room-api.ts

import { api } from './api';

// ===== TypeScript Interfaces =====

export interface Participant {
  user_id: string;
  username: string;
  joined_at: string;
  last_seen_at: string;
  is_online: boolean;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: 'text' | 'system';
  created_at: string;
  edited_at: string | null;
}

export interface WatchRoom {
  id: string;
  name: string;
  anime_id: number;
  episode: number;
  current_time: number;
  is_playing: boolean;
  owner_id: string;
  owner_username: string;
  max_participants: number;
  is_private: boolean;
  participant_count: number;
  created_at: string;
  updated_at: string;
}

export interface WatchRoomDetails extends WatchRoom {
  participants: Participant[];
  recent_messages: ChatMessage[];
}

export interface CreateRoomPayload {
  name: string;
  anime_id: number;
  episode: number;
  is_private?: boolean;
  max_participants?: number;
}

// ===== API Functions =====

export const getWatchRooms = async (page = 1, per_page = 20): Promise<WatchRoom[]> => {
  const response = await api.get('/api/rooms', {
    params: { page, per_page },
  });
  return response.data;
};

export const createWatchRoom = async (payload: CreateRoomPayload): Promise<WatchRoom> => {
  const response = await api.post('/api/rooms', payload);
  return response.data;
};

export const getWatchRoomDetails = async (roomId: string): Promise<WatchRoomDetails> => {
  const response = await api.get(`/api/rooms/${roomId}`);
  return response.data;
};

export const joinWatchRoom = async (roomId: string): Promise<{ message: string }> => {
  const response = await api.post(`/api/rooms/${roomId}/join`);
  return response.data;
};

export const leaveWatchRoom = async (roomId: string): Promise<{ message: string }> => {
  const response = await api.post(`/api/rooms/${roomId}/leave`);
  return response.data;
};
