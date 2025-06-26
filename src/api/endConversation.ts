import { supabase } from "@/lib/supabase";

export const endConversation = async (conversationId: string) => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to end a conversation.');
    }

    // Call the backend edge function
    const { data, error } = await supabase.functions.invoke('tavus-api', {
      body: {
        action: 'end',
        conversationId
      }
    });

    if (error) {
      console.error('Backend error:', error);
      throw new Error(error.message || 'Failed to end conversation');
    }

    return data;
  } catch (error) {
    console.error("Error ending conversation:", error);
    throw error;
  }
};