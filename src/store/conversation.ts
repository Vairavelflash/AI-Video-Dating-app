import { atom } from "jotai";
import { IConversation } from "../types";

const initialConversationState: IConversation | null |any = null;

export const conversationAtom = atom<IConversation | null|any>(
  initialConversationState,
);
