import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const endConversation = async (conversationId: string) => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to end a conversation.');
    }

    // Call the Express backend
    const response = await fetch(`${API_URL}/api/tavus/conversation/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error:', data);
      throw new Error(data.error || 'Failed to end conversation');
    }

    return data;
  } catch (error) {
    console.error("Error ending conversation:", error);
    throw error;
  }
};