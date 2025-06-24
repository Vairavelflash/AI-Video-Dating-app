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
      ...parsed,
      apiKey: parsed.apiKey || import.meta.env.VITE_TAVUS_API_KEY || "",
      menPersonaId: parsed.menPersonaId || import.meta.env.VITE_MALE_PERSONA_ID || "",
      womenPersonaId: parsed.womenPersonaId || import.meta.env.VITE_FEMALE_PERSONA_ID || "",
      menReplicaId: parsed.menReplicaId || import.meta.env.VITE_MALE_REPLICA_ID || "",
      womenReplicaId: parsed.womenReplicaId || import.meta.env.VITE_FEMALE_REPLICA_ID || "",
    };
  }
  return {
    name: "",
    language: "en",
    interruptSensitivity: "medium",
    persona: "",
    replica: "",
    apiKey: import.meta.env.VITE_TAVUS_API_KEY || "",
    menPersonaId: import.meta.env.VITE_MALE_PERSONA_ID || "",
    womenPersonaId: import.meta.env.VITE_FEMALE_PERSONA_ID || "",
    menReplicaId: import.meta.env.VITE_MALE_REPLICA_ID || "",
    womenReplicaId: import.meta.env.VITE_FEMALE_REPLICA_ID || "",
  };
};

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

// Helper atom to trigger settings updates
const settingsUpdateTriggerAtom = atom(0);

export const settingsSavedAtom = atom<boolean>(false);