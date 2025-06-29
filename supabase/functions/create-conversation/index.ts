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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user with Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Authentication failed:', authError)
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
      console.error('TAVUS_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: TAVUS_API_KEY is not configured. Please add your Tavus API key to the Edge Function environment variables in your Supabase dashboard.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { personaId, replicaId, name }: ConversationRequest = await req.json()

    if (!personaId) {
      console.error('Missing persona ID in request')
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

    console.log('Creating conversation with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": tavusApiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('Tavus API response status:', response.status);
    console.log('Tavus API response body:', responseText);

    if (!response.ok) {
      let errorMessage = `Tavus API error (${response.status}): ${responseText}`;
      
      // Try to parse the error response for more specific error messages
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = `Tavus API error: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `Tavus API error: ${errorData.message}`;
        }
      } catch (parseError) {
        // If we can't parse the error, use the raw response
        console.error('Failed to parse Tavus API error response:', parseError);
      }

      console.error('Tavus API error:', errorMessage);
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse successful Tavus API response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid response from Tavus API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully created conversation:', data.conversation_id);
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Create conversation error:', error);
    
    let errorMessage = 'Failed to create conversation';
    if (error instanceof Error) {
      errorMessage = `Failed to create conversation: ${error.message}`;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})