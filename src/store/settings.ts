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
}

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem('tavus-settings');
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return {
    name: "",
    language: "en",
    interruptSensitivity: "medium",
    persona: "",
    replica: "",
    menPersonaId: "",
    womenPersonaId: "",
    menReplicaId: "",
    womenReplicaId: "",
  };
};

export const settingsAtom = atom<Settings>(getInitialSettings());

export const settingsSavedAtom = atom<boolean>(false);