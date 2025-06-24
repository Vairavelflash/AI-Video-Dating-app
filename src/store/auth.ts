import { atom } from "jotai";
import { User } from "@/lib/supabase";

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);