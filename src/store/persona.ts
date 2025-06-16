import { atom } from "jotai";

interface SelectedPersona {
  id: string;
  name: string;
  age: number;
  interests: string[];
  image: string;
  personaId: string;
  gender: "male" | "female";
}

export const selectedPersonaAtom = atom<SelectedPersona | null>(null);