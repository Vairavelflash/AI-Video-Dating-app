import { AnimatedWrapper } from "@/components/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Heart } from "lucide-react";
import AudioButton from "@/components/AudioButton";
import { apiTokenAtom } from "@/store/tokens";
import { Input } from "@/components/ui/input";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);

  const handleClick = () => {
    setScreenState({ currentScreen: "datingHome" });
  };

  return (
    <AnimatedWrapper>
      <div className="flex size-full flex-col items-center justify-center">
        {/* Romantic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 py-8 px-6 rounded-3xl border border-pink-200/50 backdrop-blur-sm" 
          style={{ 
            fontFamily: 'Inter, sans-serif',
            background: 'rgba(255,255,255,0.7)'
          }}>
          
          {/* Logo with heart */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg">
              <Heart className="size-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
              LoveChat AI
            </h1>
          </div>

          <p className="text-center text-gray-600 max-w-md text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            Practice dating conversations with AI personas in a safe, judgment-free environment
          </p>

          <div className="flex flex-col gap-4 items-center mt-4 w-full max-w-sm">
            <Input
              type="password"
              value={token || ""}
              onChange={(e) => {
                const newToken = e.target.value;
                setToken(newToken);
                localStorage.setItem('tavus-token', newToken);
              }}
              placeholder="Enter Tavus API Key"
              className="w-full bg-white/80 text-gray-800 rounded-2xl border border-pink-200 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              style={{ 
                fontFamily: 'Inter, sans-serif',
              }}
            />

            <p className="text-sm text-gray-600 text-center">
              Don't have a key?{" "}
              <a
                href="https://platform.tavus.io/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 underline font-medium"
              >
                Create an account
              </a>
            </p>
          </div>

          <AudioButton 
            onClick={handleClick}
            className="relative z-20 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-8 py-4 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!token}
          >
            <Heart className="size-5" />
            Start Dating Practice
          </AudioButton>

          <div className="text-xs text-gray-500 text-center max-w-xs mt-4">
            Your conversations are private and secure. Practice with confidence!
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
};