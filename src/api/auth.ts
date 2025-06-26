const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthResponse {
  user?: any;
  session?: any;
  error?: string;
}

export const signUpUser = async (email: string, password: string, username: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create account' };
    }

    return { user: data.user };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to sign in' };
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const signOutUser = async (): Promise<{ error?: string }> => {
  try {
    // For now, we'll handle sign out on the frontend only
    // In a production app, you might want to invalidate tokens on the backend
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};