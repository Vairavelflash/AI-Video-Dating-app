import { atom } from "jotai";
import { userAtom } from "./auth";

interface Settings {
  name: string;
  language: string;
  interruptSensitivity: string;
  menPersonaId: string;
  womenPersonaId: string;
  menReplicaId: string;
  womenReplicaId: string;
}

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem('tavus-settings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    return {
      name: parsed.name || "",
      language: parsed.language || "en",
      interruptSensitivity: parsed.interruptSensitivity || "medium",
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
    menPersonaId: "pf82089ab8bb",
    womenPersonaId: "pbafdaca72e0",
    menReplicaId: "rfe12d8b9597",
    womenReplicaId: "r8086c29d9b7",
  };
};

// Create a base atom that holds the actual settings value
const baseSettingsAtom = atom<Settings>(getInitialSettings());

// Derived atom that updates name from user data and handles localStorage sync
export const settingsAtom = atom<Settings>(
  (get) => {
    const user = get(userAtom);
    const settings = get(baseSettingsAtom);
    
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
    // Save to localStorage
    localStorage.setItem('tavus-settings', JSON.stringify(newSettings));
    
    // Update the base atom to trigger re-renders
    set(baseSettingsAtom, newSettings);
  }
);

// Atom to listen for localStorage changes and update settings
export const syncSettingsFromStorageAtom = atom(null, (get, set) => {
  const updatedSettings = getInitialSettings();
  set(baseSettingsAtom, updatedSettings);
});

export const settingsSavedAtom = atom<boolean>(false);