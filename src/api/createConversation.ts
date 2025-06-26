import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const createConversation = async (
  personaId: string,
  replicaId?: string,
): Promise<IConversation> => {
  try {
    // Validate persona ID
    if (!personaId || personaId.trim() === '') {
      throw new Error('Persona ID is required. Please enter a valid persona ID from your Tavus account.');
    }

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to start a conversation.');
    }

    // Get settings from Jotai store
    const settings = getDefaultStore().get(settingsAtom);
    
    // Add debug logs
    console.log('Creating conversation with settings:', settings);
    console.log('Using Persona ID:', personaId);
    console.log('Using Replica ID:', replicaId);
    
    // Call the Express backend
    const response = await fetch(`${API_URL}/api/tavus/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        personaId: personaId.trim(),
        replicaId: replicaId?.trim(),
        name: settings.name
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error:', data);
      throw new Error(data.error || 'Failed to create conversation');
    }

    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};