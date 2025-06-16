import React, { useState } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Heart, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const LoginPage: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    // Simulate login success
    setScreenState({ currentScreen: "personaSelection" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200">
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
      </div>

      {/* Floating Hearts Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-300"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              opacity: 0.7,
            }}
            animate={{
              y: -50,
              x: Math.random() * window.innerWidth,
              opacity: [0.7, 1, 0.7, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            <Heart className="size-4" />
          </motion.div>
        ))}
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-pink-200/50">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-4 shadow-lg"
            >
              <Heart className="size-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
              LoveChat AI
            </h1>
            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Practice dating conversations with confidence
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="size-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div className="">
              <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email"
                  className="pl-10 h-9 bg-white/70 border-pink-200 rounded-xl focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
            </div>

            <div className="">
              <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="pl-10 h-9 bg-white/70 border-pink-200 rounded-xl focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={!email || !password}
              className="w-full h-9 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="size-5 mr-2" />
              Start Your Journey
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By logging in, you agree to our{" "}
                <a href="#" className="text-pink-600 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-pink-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};