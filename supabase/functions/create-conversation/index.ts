import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ConversationRequest {
  personaId: string;
  replicaId?: string;
  name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user with Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the Tavus API key from environment variables
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')
    if (!tavusApiKey) {
      return new Response(
        JSON.stringify({ error: 'Tavus API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { personaId, replicaId, name }: ConversationRequest = await req.json()

    if (!personaId) {
      return new Response(
        JSON.stringify({ error: 'Persona ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the context string
    let contextString = "";
    if (name && name.trim() !== '') {
      contextString = `You are talking with the user, ${name}. `;
    }
    contextString += `You are an AI persona for dating practice conversations. Be friendly, engaging, and help the user practice their dating conversation skills.`;
    
    const payload = {
      persona_id: personaId,
      custom_greeting: "Hey there! I'm excited to chat with you today. How are you doing?",
      conversational_context: contextString.trim()
    };

    // Add replica_id only if provided
    if (replicaId && replicaId.trim() !== '') {
      payload.replica_id = replicaId;
    }

    console.log('Creating conversation with payload:', payload);

    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": tavusApiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('Tavus API response:', response.status, responseText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Tavus API error: ${responseText}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = JSON.parse(responseText);
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Create conversation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create conversation' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})