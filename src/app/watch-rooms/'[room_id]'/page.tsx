"use client";

import { useEffect, useRef, useState } from "react";
import { useParams }s from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Users, Send, MessageCircle } from "lucide-react";

import { VideoPlayer } from "@/components/ui/video-player";
import { getWatchRoomDetails, WatchRoomDetails } from "@/lib/watch-room-api";
import { useWatchRoom } from "@/hooks/use-watch-room";
import { useVideoSources } from "@/hooks/use-anime";
import { useCurrentUser } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WatchRoomPage() {
  const params = useParams();
  const roomId = params.room_id as string;
  const { user } = useCurrentUser();

  const { data: roomDetails, isLoading: isLoadingRoom } = useQuery<WatchRoomDetails>({
    queryKey: ["watch-room", roomId],
    queryFn: () => getWatchRoomDetails(roomId),
    enabled: !!roomId,
  });

  const { sources, subtitles, isLoading: isLoadingSources } = useVideoSources(
    roomDetails?.anime_id,
    roomDetails?.episode
  );

  const {
    state,
    sendChatMessage,
    sendPlaybackCommand,
  } = useWatchRoom(roomId);

  const { participants, messages, isPlaying, currentTime, isConnected, error } = state;

  const [chatMessage, setChatMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage.trim());
      setChatMessage("");
    }
  };

  if (isLoadingRoom || isLoadingSources) {
    return <div className="flex items-center justify-center h-screen">Loading room...</div>;
  }

  if (!roomDetails) {
    return <div className="flex items-center justify-center h-screen">Room not found.</div>;
  }

  const isOwner = user?.id === roomDetails.owner_id;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{roomDetails.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer
            sources={sources || []}
            subtitles={subtitles || []}
            onPlay={(time) => sendPlaybackCommand('play', time)}
            onPause={(time) => sendPlaybackCommand('pause', time)}
            onSeek={(time) => sendPlaybackCommand('seek', time)}
            externalState={{ isPlaying, currentTime }}
            isOwner={isOwner}
          />
           <div className="mt-4 p-4 bg-card border rounded-lg">
             <h2 className="text-xl font-semibold mb-2">Episode {roomDetails.episode}</h2>
             <p className="text-muted-foreground">Connection status: {isConnected ? "Connected" : "Disconnected"}</p>
             {error && <p className="text-red-500">Error: {error.message}</p>}
           </div>
        </div>
        <div className="flex flex-col gap-6">
          {/* Participants Panel */}
          <div className="bg-card border rounded-lg p-4">
            <h2 className="text-xl font-semibold flex items-center mb-3">
              <Users className="mr-2" /> Participants ({participants.length})
            </h2>
            <ul className="space-y-2">
              {participants.map((p) => (
                <li key={p.user_id} className={`flex items-center justify-between p-2 rounded ${p.is_online ? '' : 'opacity-50'}`}>
                  <span>{p.username} {p.user_id === roomDetails.owner_id && '(Owner)'}</span>
                  <span className={`h-3 w-3 rounded-full ${p.is_online ? 'bg-green-500' : 'bg-gray-500'}`} title={p.is_online ? 'Online' : 'Offline'}></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Panel */}
          <div className="bg-card border rounded-lg flex flex-col h-[400px]">
            <h2 className="text-xl font-semibold flex items-center p-4 border-b">
              <MessageCircle className="mr-2" /> Chat
            </h2>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{msg.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
              <Input
                name="message"
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1"
                placeholder="Type a message..."
                autoComplete="off"
              />
              <Button type="submit" disabled={!isConnected}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
