import { atom } from "jotai";

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

export const settingsAtom = atom<Settings>(getInitialSettings());

export const settingsSavedAtom = atom<boolean>(false);