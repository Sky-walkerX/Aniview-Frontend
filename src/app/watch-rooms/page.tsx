"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWatchRooms, createWatchRoom, type CreateRoomPayload, type WatchRoom } from '@/lib/watch-room-api';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { ProtectedRoute } from '@/components/ui/protected-route';

const WatchRoomCard = ({ room }: { room: WatchRoom }) => (
  <div className="bg-muted/50 border border-border rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
    <div>
      <h3 className="text-lg font-bold text-foreground truncate">{room.name}</h3>
      <p className="text-sm text-muted-foreground">Anime ID: {room.anime_id} - Ep: {room.episode}</p>
      <p className="text-sm text-muted-foreground">Owner: {room.owner_username}</p>
    </div>
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
        {room.participant_count} / {room.max_participants}
      </span>
      <Link href={`/watch-rooms/${room.id}`} passHref>
        <Button size="sm" disabled={room.participant_count >= room.max_participants}>
          {room.participant_count >= room.max_participants ? 'Full' : 'Join Room'}
        </Button>
      </Link>
    </div>
  </div>
);

const CreateRoomForm = ({ onSuccess }: { onSuccess: (room: WatchRoom) => void }) => {
  const [name, setName] = useState('');
  const [animeId, setAnimeId] = useState('');
  const [episode, setEpisode] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateRoomPayload) => createWatchRoom(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['watch-rooms'] });
      onSuccess(data);
    },
    onError: (error) => {
      alert(`Error creating room: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !animeId || !episode) {
      alert('Please fill all fields');
      return;
    }
    mutation.mutate({
      name,
      anime_id: parseInt(animeId, 10),
      episode: parseInt(episode, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-foreground">Create a New Watch Room</h2>
      <Input placeholder="Room Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input type="number" placeholder="Anime ID (e.g., 16498)" value={animeId} onChange={(e) => setAnimeId(e.target.value)} required />
      <Input type="number" placeholder="Episode Number" value={episode} onChange={(e) => setEpisode(e.target.value)} required />
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? <LoadingIndicator size="sm" /> : 'Create Room'}
      </Button>
    </form>
  );
};

export default function WatchRoomsPage() {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['watch-rooms'],
    queryFn: () => getWatchRooms(),
  });

  const handleRoomCreated = (room: WatchRoom) => {
    // You could add a toast notification here
    console.log('Room created!', room);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-foreground mb-8">Watch Parties</h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-4">Active Rooms</h2>
              {isLoading && <LoadingIndicator text="Loading rooms..." />}
              {error && <p className="text-red-500">Error: {error.message}</p>}
              {rooms && rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {rooms.map(room => (
                    <WatchRoomCard key={room.id} room={room} />
                  ))}
                </div>
              ) : (
                !isLoading && <p className="text-muted-foreground">No active rooms found. Why not create one?</p>
              )}
            </div>
            <div>
              <CreateRoomForm onSuccess={handleRoomCreated} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
