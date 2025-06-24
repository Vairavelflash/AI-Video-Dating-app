import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import toast from "react-hot-toast";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  try {
    // Validate token
    if (!token || token.trim() === '') {
      throw new Error('API token is required. Please enter your Tavus API key.');
    }

    // Get settings from Jotai store
    const settings = getDefaultStore().get(settingsAtom);
    
    // Add debug logs
    console.log('Creating conversation with settings:', settings);
    console.log('Persona ID:', settings.persona);
    
    // Validate persona ID
    const personaId = settings.persona || settings.menPersonaId || settings.womenPersonaId;
    if (!personaId || personaId.trim() === '') {
      throw new Error('Persona ID is required. Please enter a valid persona ID from your Tavus account.');
    }
    
    // Build the context string
    let contextString = "";
    if (settings.name && settings.name.trim() !== '') {
      contextString = `You are talking with the user, ${settings.name}. `;
    }
    contextString += `You are an AI persona for dating practice conversations. Be friendly, engaging, and help the user practice their dating conversation skills.`;
    
    const payload = {
      persona_id: personaId,
      custom_greeting: "Hey there! I'm excited to chat with you today. How are you doing?",
      conversational_context: contextString.trim()
    };
    
    console.log('Sending payload to API:', payload);
    
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": token.trim(),
      },
      body: JSON.stringify(payload),
    });

    if (!response?.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      if (response.status === 400) {
        if (errorData.message?.includes('User has reached maximum concurrent conversations')) {
          throw new Error('You have reached the maximum number of concurrent conversations allowed by your Tavus account. Please wait for your current conversations to end or check your account limits at https://platform.tavus.io/account');
        }
        if (errorData.message?.includes('Invalid persona_id')) {
          throw new Error(`Invalid Persona ID: The persona ID "${personaId}" does not exist in your Tavus account. Please check your persona ID at https://platform.tavus.io/personas and make sure it's correctly entered.`);
        }
        throw new Error(`Invalid request: Please check your API key and persona ID. ${errorData.message || errorText}`);
      } else if (response.status === 401) {
        if (errorData.message?.includes('Invalid access token')) {
          throw new Error('Invalid API Key: Your Tavus API key is not valid. Please check your API key at https://platform.tavus.io/api-keys and make sure it\'s correctly entered.');
        }
        throw new Error('Invalid API key. Please check your Tavus API key.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Please verify your API key permissions.');
      } else {
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || errorText}`);
      }
    }

    const data = await response.json();
    toast.success("Conversation created successfully!");
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    toast.error(errorMessage);
    throw error;
  }
};