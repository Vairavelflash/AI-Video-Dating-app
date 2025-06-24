import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Settings, Check, Heart, LogOut, User, X } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { conversationAtom } from "@/store/conversation";
import { settingsSavedAtom } from "@/store/settings";
import { userAtom } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Settings as SettingsModal } from "@/screens/Settings";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/useToast";

export const Header = memo(() => {
  const navigate = useNavigate();
  const [conversation] = useAtom(conversationAtom);
  const [settingsSaved] = useAtom(settingsSavedAtom);
  const [user, setUser] = useAtom(userAtom);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { toast } = useToast();

  const handleSettings = () => {
    if (!conversation) {
      setShowSettings(true);
    }
  };

  const handleHome = () => {
    if (!conversation) {
      navigate("/personas");
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowLogoutModal(false);
      navigate("/login");
      toast({
        variant: "success",
        title: "Logged Out",
        description: "Successfully logged out!",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <header
        className="flex w-full items-start justify-between p-5"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div
          onClick={handleHome}
          className="flex cursor-pointer items-center gap-3 transition-opacity duration-200 hover:opacity-80"
        >
          <div className="to-rose-500 rounded-xl bg-gradient-to-r from-pink-500 p-2 shadow-lg">
            <Heart className="size-6 text-white" />
          </div>
          <h1
            className="bg-clip-text text-2xl font-bold text-[#ec7cae] "
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            LoveChat AI
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-pink-200">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <User className="size-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user.username}</span>
            </div>
          )}

          {/* Settings Button */}
          <div className="relative">
            {settingsSaved && (
              <div className="absolute -right-2 -top-2 z-20 animate-fade-in rounded-full bg-green-500 p-1">
                <Check className="size-3" />
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleSettings}
              className="relative size-10 border-pink-200 bg-white/70 backdrop-blur-sm hover:bg-pink-50 sm:size-14"
            >
              <Settings className="size-4 text-pink-600 sm:size-6" />
            </Button>
          </div>

          {/* Logout Button */}
          {user && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogoutClick}
              className="size-10 border-pink-200 bg-white/70 backdrop-blur-sm hover:bg-pink-50 sm:size-14"
            >
              <LogOut className="size-4 text-pink-600 sm:size-6" />
            </Button>
          )}
        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleLogoutCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-pink-200 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="size-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Are you sure?
                </h3>
                <p className="text-gray-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Do you want to logout from your account?
                </p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleLogoutCancel}
                    variant="outline"
                    className="flex-1 border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLogoutConfirm}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});