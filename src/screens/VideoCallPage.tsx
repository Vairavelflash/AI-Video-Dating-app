import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { selectedPersonaAtom } from "@/store/persona";
import { conversationAtom } from "@/store/conversation";
import { settingsAtom } from "@/store/settings";
import { userAtom } from "@/store/auth";
import { createConversation } from "@/api";
import { 
  Calendar, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Menu, 
  X, 
  Plus,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
  AlertCircle,
  Home,Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import Video from "@/components/Video";
import { endConversation } from "@/api/endConversation";
import { quantum } from 'ldrs';

quantum.register();

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const initialTodos: TodoItem[] = [
  { id: "1", text: "Ask about their hobbies", completed: false },
  { id: "2", text: "Share something interesting about yourself", completed: false },
  { id: "3", text: "Find common interests", completed: false },
  { id: "4", text: "Ask open-ended questions", completed: false },
  { id: "5", text: "Practice active listening", completed: false },
];

// Persona data (same as PersonaSelection)
const personas = [
  {
    id: "1",
    name: "Alex",
    age: 28,
    interests: ["Photography", "Hiking", "Cooking"],
    image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
    gender: "male"
  },
  {
    id: "4",
    name: "Sofia",
    age: 26,
    interests: ["Art", "Yoga", "Reading"],
    image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400",
    gender: "female"
  }
];

export const VideoCallPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const personaId = searchParams.get('persona');
  const gender = searchParams.get('gender') as 'male' | 'female';
  
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [settings] = useAtom(settingsAtom);
  const user = useAtomValue(userAtom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Find the selected persona
  const selectedPersona = personas.find(p => p.id === personaId);

  useEffect(() => {
    if (!selectedPersona) {
      navigate('/personas');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (!conversation) {
      startConversation();
    }
  }, [selectedPersona, user]);

  useEffect(() => {
    if (conversation?.conversation_url && !isConnected) {
      connectToCall();
    }
  }, [conversation?.conversation_url]);

  useEffect(() => {
    if (remoteParticipantIds.length > 0) {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    }
  }, [remoteParticipantIds]);

  const startConversation = async () => {
    if (!selectedPersona || !settings.apiKey) return;

    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Get the correct persona ID based on gender
      const personaIdToUse = gender === 'male' ? settings.menPersonaId : settings.womenPersonaId;
      
      if (!personaIdToUse) {
        throw new Error('Persona ID not configured for this gender');
      }

      const newConversation = await createConversation(settings.apiKey);
      setConversation(newConversation);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to create conversation');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToCall = async () => {
    if (!conversation?.conversation_url || !daily) return;

    try {
      await daily.join({
        url: conversation.conversation_url,
        startVideoOff: false,
        startAudioOff: true,
      });
      
      daily.setLocalVideo(true);
      daily.setLocalAudio(false);
    } catch (error) {
      console.error("Failed to join call:", error);
      setIsConnecting(false);
      setConnectionError('Failed to join the video call');
    }
  };

  const handleGoHome = () => {
    // Close this tab and focus on the main tab
    window.close();
  };

  const handleRetry = () => {
    setConnectionError(null);
    setConversation(null);
    startConversation();
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      };
      setTodos([...todos, newItem]);
      setNewTodo("");
    }
  };

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const leaveConversation = useCallback(async () => {
    // Properly end the call and cut all connections
    if (daily) {
      try {
        daily.setLocalVideo(false);
        daily.setLocalAudio(false);
        daily.leave();
        daily.destroy();
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
    
    // End conversation via API
    if (conversation?.conversation_id && settings.apiKey) {
      try {
        await endConversation(settings.apiKey, conversation.conversation_id);
      } catch (error) {
        console.error("Error ending conversation via API:", error);
      }
    }
    
    // Clear conversation state
    setConversation(null);
    setIsConnected(false);
    setIsConnecting(false);
    
    // Close this tab
    window.close();
  }, [daily, conversation, settings.apiKey, setConversation]);

  if (!selectedPersona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Persona not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm border-b border-pink-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg">
            <Heart className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-pink-600" style={{ fontFamily: 'Playfair Display, serif' }}>
              LoveChat AI
            </h1>
            {user && (
              <p className="text-sm text-gray-600">
                {user.username} • Video Call with {selectedPersona.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50 shadow-lg"
          >
            {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50 shadow-lg"
          >
            <Home className="size-4 mr-2" />
            Close
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className={cn(
          "transition-all duration-300 relative",
          sidebarOpen ? "flex-1 mr-80" : "flex-1"
        )}>
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-pink-200 shadow-xl h-full overflow-hidden m-4">
            
            {/* Persona Info - ABOVE the video */}
            <div className="p-6 border-b border-pink-200/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-200 flex-shrink-0">
                  <img
                    src={selectedPersona.image}
                    alt={selectedPersona.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {selectedPersona.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="size-4" />
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{selectedPersona.age} years old</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-pink-500" />
                    <div className="flex flex-wrap gap-2">
                      {selectedPersona.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-xs font-medium border border-pink-200"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tavus AI Video Player */}
            <div className="relative flex-1 bg-gradient-to-br from-pink-100 to-purple-100" style={{ height: 'calc(100% - 140px)' }}>
              {connectionError ? (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="size-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Connection Failed</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{connectionError}</p>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleRetry}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              ) : isConnecting ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <l-quantum size="45" speed="1.75" color="#ec4899"></l-quantum>
                    <p className="mt-4 text-gray-600">Connecting to {selectedPersona.name}...</p>
                  </div>
                </div>
              ) : remoteParticipantIds?.length > 0 ? (
                <Video
                  id={remoteParticipantIds[0]}
                  className="size-full"
                  tileClassName="!object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-pink-200">
                      <img
                        src={selectedPersona.image}
                        alt={selectedPersona.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-gray-600">Waiting for {selectedPersona.name} to join...</p>
                  </div>
                </div>
              )}

              {/* Local Video - Bottom Right */}
              {localSessionId && !connectionError && (
                <Video
                  id={localSessionId}
                  tileClassName="!object-cover"
                  className="absolute bottom-20 right-4 aspect-video h-32 w-24 overflow-hidden rounded-lg border-2 border-pink-400 shadow-lg"
                />
              )}

              {/* Video Controls - Bottom Center */}
              {isConnected && !connectionError && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={toggleAudio}
                    className="bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
                  >
                    {!isMicEnabled ? (
                      <MicOffIcon className="size-5" />
                    ) : (
                      <MicIcon className="size-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={toggleVideo}
                    className="bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
                  >
                    {!isCameraEnabled ? (
                      <VideoOffIcon className="size-5" />
                    ) : (
                      <VideoIcon className="size-5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* End Call Button - Bottom Center */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <Button
              onClick={leaveConversation}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 font-medium"
            >
              <PhoneIcon className="size-6 rotate-[135deg]" />
              End Call
            </Button>
          </div>
        </div>

        {/* To-Do Sidebar */}
        <motion.div 
          initial={false}
          animate={{ 
            x: sidebarOpen ? 0 : "100%",
            opacity: sidebarOpen ? 1 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed top-20 right-0 h-[calc(100vh-80px)] w-80 bg-white/95 backdrop-blur-sm border-l border-pink-200 shadow-2xl z-40"
        >
          <div className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Conversation Goals
              </h2>
            </div>

            {/* Todo List */}
            <div className="space-y-3 mb-6 overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-pink-50 transition-colors duration-200 cursor-pointer group border border-pink-100 bg-white/70 shadow-sm"
                >
                  {todo.completed ? (
                    <CheckSquare className="size-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Square className="size-5 text-gray-400 group-hover:text-pink-500 flex-shrink-0 transition-colors duration-200" />
                  )}
                  <span
                    className={cn(
                      "text-gray-700 transition-all duration-200",
                      todo.completed && "line-through text-green-600"
                    )}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {todo.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Add Todo */}
            <div className="mt-auto">
              <div className="flex gap-2">
                <Input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new goal..."
                  className="flex-1 bg-white/80 border-pink-200 focus:border-pink-400 rounded-2xl"
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <Button
                  onClick={addTodo}
                  size="icon"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <DailyAudio />
    </div>
  );
};