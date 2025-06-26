import { supabase } from "@/lib/supabase";

interface AuthResponse {
  user?: any;
  session?: any;
  error?: string;
}

export const signUpUser = async (email: string, password: string, username: string): Promise<AuthResponse> => {
  try {
    // Use Supabase client-side auth for now
    // In production, this would go through the backend
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    });

    if (error) {
      return { error: error.message };
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Use Supabase client-side auth for now
    // In production, this would go through the backend
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const signOutUser = async (): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};