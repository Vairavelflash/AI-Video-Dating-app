import React, { useState } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { settingsAtom } from "@/store/settings";
import { Heart, Calendar, Sparkles, CheckSquare, Square, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Persona {
  id: string;
  name: string;
  age: number;
  interests: string[];
  image: string;
  personaId: string;
}

const menPersonas: Persona[] = [
  {
    id: "1",
    name: "Alex",
    age: 28,
    interests: ["Photography", "Hiking", "Cooking"],
    image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
    personaId: "pd43ffef"
  },
  {
    id: "2", 
    name: "Marcus",
    age: 32,
    interests: ["Music", "Travel", "Fitness"],
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    personaId: "pd43ffef"
  }
];

const womenPersonas: Persona[] = [
  {
    id: "3",
    name: "Sofia",
    age: 26,
    interests: ["Art", "Yoga", "Reading"],
    image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400",
    personaId: "pd43ffef"
  },
  {
    id: "4",
    name: "Emma",
    age: 29,
    interests: ["Dancing", "Coffee", "Movies"],
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    personaId: "pd43ffef"
  }
];

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const initialTodos: TodoItem[] = [
  { id: "1", text: "Update profile photos", completed: false },
  { id: "2", text: "Write a better bio", completed: true },
  { id: "3", text: "Plan first date ideas", completed: false },
  { id: "4", text: "Practice conversation starters", completed: false },
  { id: "5", text: "Choose outfit for date", completed: false },
];

export const DatingHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"men" | "women">("men");
  const [, setScreenState] = useAtom(screenAtom);
  // const [, setConversation] = useAtom(conversationAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);

  const currentPersonas = activeTab === "men" ? menPersonas : womenPersonas;

  const handlePersonaClick = (persona: Persona) => {
    // Update settings with selected persona
    setSettings({
      ...settings,
      persona: persona.personaId,
      greeting: `Hi! I'm ${persona.name}. Nice to meet you!`,
      context: `You are ${persona.name}, a ${persona.age}-year-old who loves ${persona.interests.join(", ")}. You're on a dating app and having a conversation with someone you're interested in getting to know better.`
    });
    
    setScreenState({ currentScreen: "instructions" });
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto relative">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 right-4 z-50 lg:hidden bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
      >
        {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      <div className="flex gap-6 h-full">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Find Your Perfect Match
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Connect with AI personas and practice your dating conversations in a safe, fun environment.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
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
          </div>

          {/* Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentPersonas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => handlePersonaClick(persona)}
                className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 hover:border-pink-300"
              >
                <div className="relative mb-6">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                    <img
                      src={persona.image}
                      alt={persona.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Heart className="size-6 text-white" />
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

                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                    Start Conversation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "fixed lg:relative top-0 right-0 h-full w-80 bg-white/80 backdrop-blur-sm border-l border-pink-200 shadow-2xl transition-transform duration-300 z-40",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Dating Goals
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors duration-200 cursor-pointer group"
                >
                  {todo.completed ? (
                    <CheckSquare className="size-5 text-pink-500 flex-shrink-0" />
                  ) : (
                    <Square className="size-5 text-gray-400 group-hover:text-pink-500 flex-shrink-0 transition-colors duration-200" />
                  )}
                  <span
                    className={cn(
                      "text-gray-700 transition-all duration-200",
                      todo.completed && "line-through text-gray-400"
                    )}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl border border-pink-200">
              <h3 className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                💡 Dating Tip
              </h3>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Practice makes perfect! Use these AI conversations to build confidence before your real dates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};