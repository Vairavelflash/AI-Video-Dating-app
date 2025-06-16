import { atom } from "jotai";

export type Screen =
  | "introLoading"
  | "outage"
  | "outOfMinutes"
  | "loginPage"
  | "personaSelection"
  | "videoCall"
  | "instructions"
  | "settings"
  | "conversation"
  | "conversationError"
  | "positiveFeedback"
  | "negativeFeedback"
  | "finalScreen"
  | "sessionEnded";

interface ScreenState {
  currentScreen: Screen;
}

const initialScreenState: ScreenState = {
  currentScreen: "loginPage",
};

export const screenAtom = atom<ScreenState>(initialScreenState);