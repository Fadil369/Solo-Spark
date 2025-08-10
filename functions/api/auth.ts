// 🔐 Cloudflare Pages Functions - Authentication API
// Handles user authentication with KV storage

interface Env {
  USER_DATA: KVNamespace;
  SESSIONS: KVNamespace;
  ANTHROPIC_API_KEY: string;
  GITHUB_TOKEN: string;
  STRIPE_SECRET_KEY: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: 'free' | 'solo-prototype' | 'solo-ultimate';
  createdAt: string;
  lastLogin: string;
  preferences: {
    language: 'en' | 'ar';
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

interface Session {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://brainsait.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  try {
    switch (action) {
      case 'register':
        return await handleRegister(request, env, corsHeaders);
      case 'login':
        return await handleLogin(request, env, corsHeaders);
      case 'logout':
        return await handleLogout(request, env, corsHeaders);
      case 'verify-session':
        return await handleVerifySession(request, env, corsHeaders);
      case 'update-profile':
        return await handleUpdateProfile(request, env, corsHeaders);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions(context: any): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://brainsait.io',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

async function handleRegister(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const { email, password, name, language = 'ar' } = await request.json();

  // Check if user already exists
  const existingUser = await env.USER_DATA.get(`user:${email}`);
  if (existingUser) {
    return new Response(JSON.stringify({ error: 'User already exists' }), {
      status: 409,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Create user
  const userId = crypto.randomUUID();
  const user: User = {
    id: userId,
    email,
    name,
    subscription: 'free',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    preferences: {
      language: language as 'en' | 'ar',
      theme: 'light',
      notifications: true
    }
  };

  // Store user data
  await env.USER_DATA.put(`user:${email}`, JSON.stringify(user));
  await env.USER_DATA.put(`user_id:${userId}`, email);

  // Create session
  const sessionToken = crypto.randomUUID();
  const session: Session = {
    userId,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString()
  };

  await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(session), {
    expirationTtl: 7 * 24 * 60 * 60 // 7 days in seconds
  });

  return new Response(JSON.stringify({
    success: true,
    user: { ...user },
    sessionToken
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLogin(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const { email, password } = await request.json();

  // Get user data
  const userData = await env.USER_DATA.get(`user:${email}`);
  if (!userData) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const user: User = JSON.parse(userData);

  // Update last login
  user.lastLogin = new Date().toISOString();
  await env.USER_DATA.put(`user:${email}`, JSON.stringify(user));

  // Create session
  const sessionToken = crypto.randomUUID();
  const session: Session = {
    userId: user.id,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(session), {
    expirationTtl: 7 * 24 * 60 * 60
  });

  return new Response(JSON.stringify({
    success: true,
    user,
    sessionToken
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLogout(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No session token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sessionToken = authHeader.substring(7);
  await env.SESSIONS.delete(`session:${sessionToken}`);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleVerifySession(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No session token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sessionToken = authHeader.substring(7);
  const sessionData = await env.SESSIONS.get(`session:${sessionToken}`);

  if (!sessionData) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const session: Session = JSON.parse(sessionData);

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    await env.SESSIONS.delete(`session:${sessionToken}`);
    return new Response(JSON.stringify({ error: 'Session expired' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get user data
  const userEmail = await env.USER_DATA.get(`user_id:${session.userId}`);
  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const userData = await env.USER_DATA.get(`user:${userEmail}`);
  const user: User = JSON.parse(userData!);

  return new Response(JSON.stringify({
    success: true,
    user,
    sessionToken
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateProfile(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No session token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sessionToken = authHeader.substring(7);
  const sessionData = await env.SESSIONS.get(`session:${sessionToken}`);

  if (!sessionData) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const session: Session = JSON.parse(sessionData);
  const userEmail = await env.USER_DATA.get(`user_id:${session.userId}`);
  const userData = await env.USER_DATA.get(`user:${userEmail}`);
  const user: User = JSON.parse(userData!);

  // Update user data
  const updates = await request.json();
  const updatedUser = { ...user, ...updates };

  await env.USER_DATA.put(`user:${userEmail}`, JSON.stringify(updatedUser));

  return new Response(JSON.stringify({
    success: true,
    user: updatedUser
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
