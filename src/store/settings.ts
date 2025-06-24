import { atom } from "jotai";
import { userAtom } from "./auth";
import { getDefaultStore } from "jotai";

interface Settings {
  name: string;
  language: string;
  interruptSensitivity: string;
  persona: string;
  replica: string;
  menPersonaId: string;
  womenPersonaId: string;
  menReplicaId: string;
  womenReplicaId: string;
  apiKey: string;
}

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem('tavus-settings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    return {
      name: parsed.name || "",
      language: parsed.language || "en",
      interruptSensitivity: parsed.interruptSensitivity || "medium",
      persona: parsed.persona || "",
      replica: parsed.replica || "",
      apiKey: parsed.apiKey || "",
      menPersonaId: parsed.menPersonaId || "pd43ffef", // Default persona ID
      womenPersonaId: parsed.womenPersonaId || "pd43ffef", // Default persona ID
      menReplicaId: parsed.menReplicaId || "",
      womenReplicaId: parsed.womenReplicaId || "",
    };
  }
  return {
    name: "",
    language: "en",
    interruptSensitivity: "medium",
    persona: "",
    replica: "",
    apiKey: "",
    menPersonaId: "pd43ffef", // Default persona ID
    womenPersonaId: "pd43ffef", // Default persona ID
    menReplicaId: "",
    womenReplicaId: "",
  };
};

// Helper atom to trigger settings updates
const settingsUpdateTriggerAtom = atom(0);

// Derived atom that updates name from user data
export const settingsAtom = atom<Settings>(
  (get) => {
    const user = get(userAtom);
    const settings = getInitialSettings();
    
    // If user is logged in and settings name is empty, use username
    if (user && !settings.name) {
      return {
        ...settings,
        name: user.username
      };
    }
    
    return settings;
  },
  (get, set, newSettings: Settings) => {
    localStorage.setItem('tavus-settings', JSON.stringify(newSettings));
    // Force re-evaluation by updating a dummy atom
    set(settingsUpdateTriggerAtom, Date.now());
  }
);

export const settingsSavedAtom = atom<boolean>(false);