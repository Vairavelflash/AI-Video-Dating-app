import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import { supabase } from "@/lib/supabase";

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
    
    // Call the backend edge function
    const { data, error } = await supabase.functions.invoke('tavus-api', {
      body: {
        action: 'create',
        personaId: personaId.trim(),
        replicaId: replicaId?.trim(),
        name: settings.name
      }
    });

    if (error) {
      console.error('Backend error:', error);
      throw new Error(error.message || 'Failed to create conversation');
    }

    if (!data) {
      throw new Error('No data received from backend');
    }

    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};