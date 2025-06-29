import { supabase } from "@/lib/supabase";

export const endConversation = async (conversationId: string) => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to end a conversation.');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('end-conversation', {
      body: {
        conversationId
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to end conversation');
    }

    if (data.error) {
      console.error('API error:', data.error);
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Error ending conversation:", error);
    throw error;
  }
};