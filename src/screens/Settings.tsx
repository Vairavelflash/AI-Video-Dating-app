import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
} from "@/components/DialogWrapper";
import { cn } from "@/utils";
import { useAtom } from "jotai";
import { getDefaultStore } from "jotai";
import { settingsAtom, settingsSavedAtom } from "@/store/settings";
import { screenAtom } from "@/store/screens";
import { X, Sparkles, Heart } from "lucide-react";
import * as React from "react";

// Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "ghost" | "outline";
    size?: "icon";
  }
>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
        {
          "border border-input bg-transparent hover:bg-accent": variant === "outline",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "size-10": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Select Component
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Select.displayName = "Select";

// Label Component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
Label.displayName = "Label";

export const Settings: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setSettingsSaved] = useAtom(settingsSavedAtom);

  const languages = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Italian", value: "it" },
    { label: "Portuguese", value: "pt" },
  ];

  const interruptSensitivities = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  const handleClose = () => {
    setScreenState({ 
      currentScreen: "personaSelection"
    });
  };

  const handleSave = async () => {
    console.log('Current settings before save:', settings);
    
    // Create a new settings object to ensure we have a fresh reference
    const updatedSettings = {
      ...settings,
    };
    
    // Save to localStorage
    localStorage.setItem('tavus-settings', JSON.stringify(updatedSettings));
    
    // Update the store with the new settings object
    const store = getDefaultStore();
    store.set(settingsAtom, updatedSettings);
    
    // Wait a moment to ensure the store is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check both localStorage and store
    const storedSettings = localStorage.getItem('tavus-settings');
    const storeSettings = store.get(settingsAtom);
    
    console.log('Settings in localStorage:', JSON.parse(storedSettings || '{}'));
    console.log('Settings in store after save:', storeSettings);
    
    setSettingsSaved(true);
    handleClose();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-pink-400 to-red-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Floating Hearts Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <Heart className="size-6" />
          </div>
        ))}
      </div>

      {/* Settings Form */}
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Sparkles className="size-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Settings
                </h2>
                <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Configure your dating practice experience
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full"
            >
              <X className="size-6" />
            </Button>
          </div>

          {/* Form Content */}
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-800 font-medium">
                  Your Name
                </Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-gray-800 font-medium">
                  Language
                </Label>
                <Select
                  id="language"
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {languages.map((lang) => (
                    <option
                      key={lang.value}
                      value={lang.value}
                      className="bg-white text-gray-800"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {lang.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interruptSensitivity" className="text-gray-800 font-medium">
                  Interrupt Sensitivity
                </Label>
                <Select
                  id="interruptSensitivity"
                  value={settings.interruptSensitivity}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      interruptSensitivity: e.target.value,
                    })
                  }
                  className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {interruptSensitivities.map((sensitivity) => (
                    <option
                      key={sensitivity.value}
                      value={sensitivity.value}
                      className="bg-white text-gray-800"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {sensitivity.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Heart className="size-5 text-pink-500" />
                  Persona Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="menPersonaId" className="text-gray-800 font-medium">
                      Men Persona ID
                    </Label>
                    <Input
                      id="menPersonaId"
                      value={settings.menPersonaId || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, menPersonaId: e.target.value })
                      }
                      placeholder="Enter men persona ID"
                      className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="womenPersonaId" className="text-gray-800 font-medium">
                      Women Persona ID
                    </Label>
                    <Input
                      id="womenPersonaId"
                      value={settings.womenPersonaId || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, womenPersonaId: e.target.value })
                      }
                      placeholder="Enter women persona ID"
                      className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="menReplicaId" className="text-gray-800 font-medium">
                      Men Replica ID
                    </Label>
                    <Input
                      id="menReplicaId"
                      value={settings.menReplicaId || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, menReplicaId: e.target.value })
                      }
                      placeholder="Enter men replica ID (optional)"
                      className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="womenReplicaId" className="text-gray-800 font-medium">
                      Women Replica ID
                    </Label>
                    <Input
                      id="womenReplicaId"
                      value={settings.womenReplicaId || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, womenReplicaId: e.target.value })
                      }
                      placeholder="Enter women replica ID (optional)"
                      className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-gray-800 font-medium">
                  Tavus API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={settings.apiKey || ""}
                  onChange={(e) => {
                    setSettings({ ...settings, apiKey: e.target.value });
                  }}
                  placeholder="Enter your Tavus API key"
                  className="bg-white/80 border-pink-200 text-gray-800 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="text-sm text-gray-600">
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
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-pink-200">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};