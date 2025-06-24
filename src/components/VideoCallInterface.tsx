import React, { useState, useCallback, useEffect } from "react";
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
  ArrowLeft,
  Heart,
  Clock,
  Play,
  Camera,
  Home,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
import { useToast } from "@/hooks/useToast";

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

const CALL_DURATION = 2 * 60; // 2 minutes in seconds

type CallScreen = "intro" | "haircheck" | "conversation" | "closing" | "error";

interface VideoCallInterfaceProps {
  onBack: () => void;
}

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({ onBack }) => {
  const selectedPersona = useAtomValue(selectedPersonaAtom);
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [settings] = useAtom(settingsAtom);
  const user = useAtomValue(userAtom);
  const { toast } = useToast();
  
  const [currentScreen, setCurrentScreen] = useState<CallScreen>("intro");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(CALL_DURATION);
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Timer effect
  useEffect(() => {
    if (!callStarted || !isConnected || currentScreen !== "conversation") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - end the call
          toast({
            variant: "destructive",
            title: "Call Ended",
            description: "Call time limit reached!",
          });
          handleCallEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callStarted, isConnected, currentScreen]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!selectedPersona) {
      onBack();
      return;
    }

    if (!user) {
      onBack();
      return;
    }
  }, [selectedPersona, user]);

  useEffect(() => {
    if (remoteParticipantIds.length > 0 && !callStarted && currentScreen === "conversation") {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setCallStarted(true);
      toast({
        variant: "success",
        title: "Call Connected",
        description: "You have 2 minutes to chat!",
      });
    }
  }, [remoteParticipantIds, callStarted, currentScreen]);

  const startConversation = async () => {
    if (!selectedPersona || !settings.apiKey) {
      setConnectionError('API key not configured. Please check settings.');
      setCurrentScreen("error");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Get the correct persona ID based on gender
      const personaIdToUse = selectedPersona.gender === 'male' ? settings.menPersonaId : settings.womenPersonaId;
      
      if (!personaIdToUse) {
        throw new Error('Persona ID not configured for this gender');
      }

      const newConversation = await createConversation(settings.apiKey);
      setConversation(newConversation);
      
      toast({
        variant: "success",
        title: "Conversation Created",
        description: "Connecting to video call...",
      });
      
      setCurrentScreen("conversation");
    } catch (error) {
      console.error("Failed to create conversation:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      setConnectionError(errorMessage);
      setCurrentScreen("error");
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage,
      });
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
      const errorMessage = 'Failed to join the video call';
      setConnectionError(errorMessage);
      setCurrentScreen("error");
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage,
      });
    }
  };

  useEffect(() => {
    if (conversation?.conversation_url && currentScreen === "conversation") {
      connectToCall();
    }
  }, [conversation?.conversation_url, currentScreen]);

  const handleCallEnd = useCallback(async () => {
    try {
      // Properly end the call and cut all connections
      if (daily) {
        daily.setLocalVideo(false);
        daily.setLocalAudio(false);
        daily.leave();
        daily.destroy();
      }
      
      // End conversation via API
      if (conversation?.conversation_id && settings.apiKey) {
        await endConversation(settings.apiKey, conversation.conversation_id);
      }
      
      // Clear conversation state
      setConversation(null);
      setIsConnected(false);
      setIsConnecting(false);
      setCallStarted(false);
      setCallEnded(true);
      
      // Show closing screen
      setCurrentScreen("closing");
      
      toast({
        variant: "success",
        title: "Call Ended",
        description: "Thanks for practicing!",
      });
    } catch (error) {
      console.error("Error ending call:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error ending call",
      });
      // Still show closing screen even if there's an error
      setCurrentScreen("closing");
    }
  }, [daily, conversation, settings.apiKey, setConversation]);

  const handleRetry = () => {
    setConnectionError(null);
    setConversation(null);
    setCurrentScreen("intro");
  };

  const handleHome = () => {
    // Clean up any existing call
    if (daily) {
      daily.setLocalVideo(false);
      daily.setLocalAudio(false);
      daily.leave();
      daily.destroy();
    }
    setConversation(null);
    onBack();
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
    try {
      daily?.setLocalVideo(!isCameraEnabled);
    } catch (error) {
      console.error("Error toggling video:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle video",
      });
    }
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    try {
      daily?.setLocalAudio(!isMicEnabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle audio",
      });
    }
  }, [daily, isMicEnabled]);

  if (!selectedPersona) {
    return null;
  }

  // Intro Screen
  if (currentScreen === "intro") {
    return (
      <div className="flex-1 w-full mx-auto relative h-full px-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
          >
            <ArrowLeft className="size-4" />
            Back to Selection
          </Button>
        </div>

        <div className="flex items-center justify-center h-[calc(100%-80px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-pink-200/50 max-w-2xl w-full text-center"
          >
            {/* Replica GIF placeholder */}
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-pink-200">
              <img
                src={selectedPersona.image}
                alt={selectedPersona.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ready to Chat with {selectedPersona.name}?
            </h1>
            
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              This is a two-way video experience where you can practice real dating conversations. 
              {selectedPersona.name} will respond naturally to everything you say!
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="size-5" />
                <span>{selectedPersona.age} years old</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="size-5" />
                <span>2 minute session</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {selectedPersona.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-medium border border-pink-200"
                >
                  {interest}
                </span>
              ))}
            </div>

            <Button
              onClick={() => setCurrentScreen("haircheck")}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              <Play className="size-6 mr-3" />
              Start Video Experience
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Hair Check Screen
  if (currentScreen === "haircheck") {
    return (
      <div className="flex-1 w-full mx-auto relative h-full px-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => setCurrentScreen("intro")}
            className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <div className="flex items-center justify-center h-[calc(100%-80px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-pink-200/50 max-w-4xl w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Hair Check & Camera Setup
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Make sure you look great before starting your conversation with {selectedPersona.name}!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Local Video Preview */}
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl overflow-hidden border-4 border-pink-200">
                  {localSessionId ? (
                    <Video
                      id={localSessionId}
                      className="size-full"
                      tileClassName="!object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Camera className="size-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Camera not detected</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Camera Controls */}
                <div className="flex justify-center gap-3 mt-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={toggleVideo}
                    className="bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
                  >
                    {!isCameraEnabled ? (
                      <VideoOffIcon className="size-5" />
                    ) : (
                      <VideoIcon className="size-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={toggleAudio}
                    className="bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
                  >
                    {!isMicEnabled ? (
                      <MicOffIcon className="size-5" />
                    ) : (
                      <MicIcon className="size-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Check Your Camera</h3>
                      <p className="text-gray-600 text-sm">Make sure you're well-lit and centered in the frame</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Test Your Microphone</h3>
                      <p className="text-gray-600 text-sm">Speak clearly and ensure your mic is working</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Get Comfortable</h3>
                      <p className="text-gray-600 text-sm">Relax and be yourself - this is practice!</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={startConversation}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <l-quantum size="20" speed="1.75" color="white"></l-quantum>
                      Connecting...
                    </div>
                  ) : (
                    <>
                      <Heart className="size-5 mr-2" />
                      Start Conversation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        <DailyAudio />
      </div>
    );
  }

  // Error Screen
  if (currentScreen === "error") {
    return (
      <div className="flex-1 w-full mx-auto relative h-full px-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
          >
            <ArrowLeft className="size-4" />
            Back to Selection
          </Button>
        </div>

        <div className="flex items-center justify-center h-[calc(100%-80px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-red-200/50 max-w-2xl w-full text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="size-8 text-red-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              {connectionError || "We encountered an unexpected error. Don't worry, it happens to the best of us!"}
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleRetry}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-2xl font-medium"
              >
                <RotateCcw className="size-5 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={handleHome}
                variant="outline"
                className="border-pink-200 hover:bg-pink-50 px-6 py-3 rounded-2xl"
              >
                <Home className="size-5 mr-2" />
                Go Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Closing Screen
  if (currentScreen === "closing") {
    return (
      <div className="flex-1 w-full mx-auto relative h-full px-6">
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-pink-200/50 max-w-2xl w-full text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="size-8 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Great conversation!
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              You just completed a 2-minute practice session with {selectedPersona.name}. 
              Every conversation makes you more confident for the real thing!
            </p>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Call Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="font-medium">2:00 minutes</p>
                </div>
                <div>
                  <span className="text-gray-600">Partner:</span>
                  <p className="font-medium">{selectedPersona.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Completed Tasks:</span>
                  <p className="font-medium">{todos.filter(t => t.completed).length}/{todos.length}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-green-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleRetry}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-2xl font-medium"
              >
                <RotateCcw className="size-5 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={handleHome}
                variant="outline"
                className="border-pink-200 hover:bg-pink-50 px-6 py-3 rounded-2xl"
              >
                <Home className="size-5 mr-2" />
                Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Conversation Screen (existing implementation)
  return (
    <div className="flex-1 w-full mx-auto relative h-full px-6">
      {/* Header with Back Button and Timer */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={handleHome}
          className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
        >
          <ArrowLeft className="size-4" />
          End Call
        </Button>
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          {callStarted && (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-full px-4 py-2">
              <Clock className="size-4 text-pink-600" />
              <span className="font-mono text-sm font-medium text-gray-700">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          
          {/* Sidebar Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50 shadow-lg"
          >
            {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100%-80px)]">
        {/* Main Video Area */}
        <div className={cn(
          "transition-all duration-300 relative",
          sidebarOpen ? "flex-1 lg:mr-80" : "flex-1"
        )}>
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-pink-200 shadow-xl h-full overflow-hidden">
            
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
              {isConnecting ? (
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
              {localSessionId && (
                <Video
                  id={localSessionId}
                  tileClassName="!object-cover"
                  className="absolute bottom-20 right-4 aspect-video h-32 w-24 overflow-hidden rounded-lg border-2 border-pink-400 shadow-lg"
                />
              )}

              {/* Video Controls - Bottom Center */}
              {isConnected && (
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
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <Button
              onClick={handleCallEnd}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 font-medium"
            >
              <PhoneIcon className="size-6 rotate-[135deg]" />
              End Call
            </Button>
          </div>
        </div>

        {/* Flirt List Sidebar - Slides in/out smoothly */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="fixed lg:absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-sm border-l border-pink-200 shadow-2xl z-40 rounded-l-3xl"
              style={{ 
                marginTop: '1rem', 
                marginRight: '1rem', 
                marginLeft: '1rem',
                height: 'calc(100% - 2rem)' 
              }}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Flirt List
                  </h2>
                </div>

                {/* Todo List - Takes up most of the space */}
                <div className="flex-1 space-y-3 mb-6 overflow-y-auto">
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

                {/* Add Todo - Fixed at the bottom with equal height components */}
                <div className="flex gap-2">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 bg-white/80 border-pink-200 focus:border-pink-400 rounded-2xl h-12"
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  />
                  <Button
                    onClick={addTodo}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl h-12 w-12 p-0 flex items-center justify-center"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <DailyAudio />
    </div>
  );
};