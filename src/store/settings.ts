import { atom } from "jotai";
import { userAtom } from "./auth";
import { getDefaultStore } from "jotai";

interface Settings {
  name: string;
  language: string;
  interruptSensitivity: string;
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
      apiKey: parsed.apiKey || "c1de42cbbffa4bdcbf7e090f0904f52c",
      menPersonaId: parsed.menPersonaId || "pf82089ab8bb",
      womenPersonaId: parsed.womenPersonaId || "pbafdaca72e0",
      menReplicaId: parsed.menReplicaId || "rfe12d8b9597",
      womenReplicaId: parsed.womenReplicaId || "r8086c29d9b7",
    };
  }
  return {
    name: "",
    language: "en",
    interruptSensitivity: "medium",
    apiKey: "c1de42cbbffa4bdcbf7e090f0904f52c",
    menPersonaId: "pf82089ab8bb",
    womenPersonaId: "pbafdaca72e0",
    menReplicaId: "rfe12d8b9597",
    womenReplicaId: "r8086c29d9b7",
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