import React, { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { selectedPersonaAtom } from "@/store/persona";
import { settingsAtom } from "@/store/settings";
import { userAtom } from "@/store/auth";
import { conversationAtom } from "@/store/conversation";
import { Heart, Calendar, Sparkles, Clock, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { VideoCallInterface } from "@/components/VideoCallInterface";

interface Persona {
  id: string;
  name: string;
  age: number;
  interests: string[];
  image: string;
  available: boolean;
  gender: "male" | "female";
}

const personas: Persona[] = [
  // Men - Only first one active
  {
    id: "1",
    name: "Alex",
    age: 28,
    interests: ["Photography", "Hiking", "Cooking"],
    image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    gender: "male"
  },
  {
    id: "2", 
    name: "Marcus",
    age: 32,
    interests: ["Music", "Travel", "Fitness"],
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: false,
    gender: "male"
  },
  {
    id: "3",
    name: "David",
    age: 30,
    interests: ["Art", "Coffee", "Books"],
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: false,
    gender: "male"
  },
  // Women - Only first one active
  {
    id: "4",
    name: "Sofia",
    age: 26,
    interests: ["Art", "Yoga", "Reading"],
    image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: true,
    gender: "female"
  },
  {
    id: "5",
    name: "Emma",
    age: 29,
    interests: ["Dancing", "Coffee", "Movies"],
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: false,
    gender: "female"
  },
  {
    id: "6",
    name: "Isabella",
    age: 27,
    interests: ["Travel", "Wine", "Fashion"],
    image: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400",
    available: false,
    gender: "female"
  }
];

export const PersonaSelection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"men" | "women">("men");
  const [, setSelectedPersona] = useAtom(selectedPersonaAtom);
  const [settings] = useAtom(settingsAtom);
  const user = useAtomValue(userAtom);
  const [conversation] = useAtom(conversationAtom);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const currentPersonas = personas.filter(p => 
    activeTab === "men" ? p.gender === "male" : p.gender === "female"
  );

  const handlePersonaClick = (persona: Persona) => {
    if (!persona.available) return;
    
    const personaId = activeTab === "men" ? settings.menPersonaId : settings.womenPersonaId;
    const replicaId = activeTab === "men" ? settings.menReplicaId : settings.womenReplicaId;
    
    if (!personaId || personaId.trim() === '') {
      alert("Please configure persona IDs in Settings first!");
      return;
    }

    // Update settings with the selected persona ID
    setSelectedPersona({
      ...persona,
      personaId: personaId.trim(),
      replicaId: replicaId?.trim() || ""
    });
    
    // Show video call interface in the same page
    setShowVideoCall(true);
  };

  const handleBackToSelection = () => {
    setShowVideoCall(false);
    setSelectedPersona(null);
  };

  const hasPersonaId = activeTab === "men" ? settings.menPersonaId : settings.womenPersonaId;

  // If video call is active, show the video call interface
  if (showVideoCall) {
    return <VideoCallInterface onBack={handleBackToSelection} />;
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-2 flex flex-col min-h-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Choose Your Practice Partner
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          Select an AI persona to practice your dating conversations. Build confidence in a safe, judgment-free environment.
        </p>
        {user && (
          <p className="text-pink-600 font-medium mt-2">Welcome back, {user.username}!</p>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex justify-center mb-8"
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-full p-1 border border-pink-200 shadow-lg">
          <button
            onClick={() => setActiveTab("men")}
            className={cn(
              "px-8 py-3 rounded-full font-medium transition-all duration-300",
              activeTab === "men"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                : "text-gray-600 hover:text-pink-600"
            )}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Men
          </button>
          <button
            onClick={() => setActiveTab("women")}
            className={cn(
              "px-8 py-3 rounded-full font-medium transition-all duration-300",
              activeTab === "women"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                : "text-gray-600 hover:text-pink-600"
            )}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Women
          </button>
        </div>
      </motion.div>

      {/* Persona Cards */}
      <div className="flex-1 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPersonas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className={cn(
                "group bg-white/70 backdrop-blur-sm rounded-3xl p-6 border shadow-xl transition-all duration-300",
                persona.available && hasPersonaId
                  ? "border-pink-200 hover:shadow-2xl cursor-pointer hover:scale-105 hover:border-pink-300"
                  : "border-gray-200 opacity-60 cursor-not-allowed"
              )}
              onClick={() => handlePersonaClick(persona)}
            >
              <div className="relative mb-6">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                  <img
                    src={persona.image}
                    alt={persona.name}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500",
                      persona.available && hasPersonaId ? "group-hover:scale-110" : "grayscale"
                    )}
                  />
                </div>
                
                {/* Status Badge */}
                <div className={cn(
                  "absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-medium shadow-lg",
                  persona.available && hasPersonaId
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                )}>
                  {persona.available && hasPersonaId 
                    ? "Ready" 
                    : persona.available 
                    ? "Setup Required" 
                    : "Coming Soon"
                  }
                </div>

                {/* Heart Icon */}
                <div className={cn(
                  "absolute -bottom-3 -right-3 rounded-full p-3 shadow-lg transition-transform duration-300",
                  persona.available && hasPersonaId
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 group-hover:scale-110"
                    : "bg-gray-400"
                )}>
                  {persona.available && hasPersonaId ? (
                    <Heart className="size-6 text-white" />
                  ) : (
                    <Clock className="size-6 text-white" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {persona.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-4" />
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{persona.age} years old</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-pink-500" />
                    <span className="font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Interests</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {persona.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-medium border border-pink-200"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  disabled={!persona.available || !hasPersonaId}
                  className={cn(
                    "w-full rounded-2xl py-3 font-medium shadow-lg transition-all duration-300",
                    persona.available && hasPersonaId
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {!persona.available 
                    ? "Coming Soon" 
                    : !hasPersonaId
                    ? "Configure in Settings"
                    : "Start Conversation"
                  }
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex justify-center py-6"
      >
        <a
          href="https://github.com/Vairavelflash/AI-Video-Dating-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-gray-700 hover:text-pink-600"
        >
          <Github className="size-5" />
          <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            View on GitHub
          </span>
        </a>
      </motion.footer>
    </div>
  );
};