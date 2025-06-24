import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Settings, Check, Heart, ArrowLeft, LogOut, User } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import { settingsSavedAtom } from "@/store/settings";
import { userAtom } from "@/store/auth";
import { supabase } from "@/lib/supabase";

export const Header = memo(() => {
  const navigate = useNavigate();
  const [{ currentScreen }, setScreenState] = useAtom(screenAtom);
  const [conversation] = useAtom(conversationAtom);
  const [settingsSaved] = useAtom(settingsSavedAtom);
  const [user, setUser] = useAtom(userAtom);

  const handleSettings = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "settings" });
    }
  };

  const handleHome = () => {
    if (!conversation) {
      navigate("/personas");
    }
  };

  const handleBack = () => {
    if (currentScreen === "settings") {
      navigate("/personas");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header
      className="flex w-full items-start justify-between p-5"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex items-center gap-4">
        {currentScreen === "settings" && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="border-pink-200 bg-white/70 backdrop-blur-sm hover:bg-pink-50"
          >
            <ArrowLeft className="size-4 text-pink-600" />
          </Button>
        )}

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
            onClick={handleLogout}
            className="size-10 border-pink-200 bg-white/70 backdrop-blur-sm hover:bg-pink-50 sm:size-14"
          >
            <LogOut className="size-4 text-pink-600 sm:size-6" />
          </Button>
        )}
      </div>
    </header>
  );
});