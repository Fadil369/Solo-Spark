// 💾 Cloudflare Pages Functions - Projects API
// Handles project CRUD operations with KV and R2 storage

interface Env {
  USER_DATA: KVNamespace;
  SESSIONS: KVNamespace;
  USER_FILES: R2Bucket;
  PROTOTYPES: R2Bucket;
  EXPORTS: R2Bucket;
  AI_QUEUE: Queue;
  ANTHROPIC_API_KEY: string;
  GITHUB_TOKEN: string;
}

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  stage: 'idea' | 'story' | 'prd' | 'prototype';
  content: {
    idea?: any;
    story?: any;
    prd?: any;
    prototype?: any;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  collaborators?: string[];
  githubRepo?: string;
  exportUrls?: {
    pdf?: string;
    json?: string;
    zip?: string;
  };
}

export async function onRequestPost(context: EventContext<Env, string, Record<string, string>>): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://brainsait.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Verify authentication
    const user = await verifyAuth(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'create':
        return await handleCreateProject(request, env, user, corsHeaders);
      case 'update':
        return await handleUpdateProject(request, env, user, corsHeaders);
      case 'delete':
        return await handleDeleteProject(request, env, user, corsHeaders);
      case 'export':
        return await handleExportProject(request, env, user, corsHeaders);
      case 'share':
        return await handleShareProject(request, env, user, corsHeaders);
      case 'submit-github':
        return await handleGithubSubmission(request, env, user, corsHeaders);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Projects API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet(context: EventContext<Env, string, Record<string, string>>): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('id');
  const userId = url.searchParams.get('userId');

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://brainsait.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const user = await verifyAuth(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (projectId) {
      // Get specific project
      const projectData = await env.USER_DATA.get(`project:${projectId}`);
      if (!projectData) {
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const project: Project = JSON.parse(projectData);

      // Check if user has access
      if (project.userId !== user.id && !project.collaborators?.includes(user.id) && !project.isPublic) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ project }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Get user's projects
      const userProjects = await getUserProjects(env, user.id);
      return new Response(JSON.stringify({ projects: userProjects }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Get Projects Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function verifyAuth(request: Request, env: Env): Promise<any> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const sessionToken = authHeader.substring(7);
  const sessionData = await env.SESSIONS.get(`session:${sessionToken}`);

  if (!sessionData) {
    return null;
  }

  const session = JSON.parse(sessionData);
  const userEmail = await env.USER_DATA.get(`user_id:${session.userId}`);
  const userData = await env.USER_DATA.get(`user:${userEmail}`);

  return userData ? JSON.parse(userData) : null;
}

async function handleCreateProject(request: Request, env: Env, user: any, corsHeaders: any): Promise<Response> {
  const { title, description, stage = 'idea', content = {}, tags = [], isPublic = false } = await request.json();

  const projectId = crypto.randomUUID();
  const project: Project = {
    id: projectId,
    userId: user.id,
    title,
    description,
    stage,
    content,
    tags,
    isPublic,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Store project
  await env.USER_DATA.put(`project:${projectId}`, JSON.stringify(project));

  // Update user's project list
  const userProjectsKey = `user_projects:${user.id}`;
  const userProjects = await env.USER_DATA.get(userProjectsKey);
  const projectIds = userProjects ? JSON.parse(userProjects) : [];
  projectIds.push(projectId);
  await env.USER_DATA.put(userProjectsKey, JSON.stringify(projectIds));

  return new Response(JSON.stringify({ project }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateProject(request: Request, env: Env, user: any, corsHeaders: any): Promise<Response> {
  const { projectId, ...updates } = await request.json();

  const projectData = await env.USER_DATA.get(`project:${projectId}`);
  if (!projectData) {
    return new Response(JSON.stringify({ error: 'Project not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const project: Project = JSON.parse(projectData);

  // Check ownership
  if (project.userId !== user.id && !project.collaborators?.includes(user.id)) {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Update project
  const updatedProject = {
    ...project,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await env.USER_DATA.put(`project:${projectId}`, JSON.stringify(updatedProject));

  return new Response(JSON.stringify({ project: updatedProject }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleExportProject(request: Request, env: Env, user: any, corsHeaders: any): Promise<Response> {
  const { projectId, format } = await request.json();

  const projectData = await env.USER_DATA.get(`project:${projectId}`);
  if (!projectData) {
    return new Response(JSON.stringify({ error: 'Project not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const project: Project = JSON.parse(projectData);

  // Check access
  if (project.userId !== user.id && !project.isPublic) {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Generate export based on format
  let exportData: string;
  let contentType: string;
  let filename: string;

  switch (format) {
    case 'pdf':
      // Queue PDF generation job
      await env.AI_QUEUE.send({
        type: 'generate_pdf',
        projectId,
        userId: user.id
      });

      return new Response(JSON.stringify({
        message: 'PDF generation started',
        checkUrl: `/api/projects/export-status?projectId=${projectId}&format=pdf`
      }), {
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    case 'json':
      exportData = JSON.stringify(project, null, 2);
      contentType = 'application/json';
      filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      break;

    default:
      return new Response(JSON.stringify({ error: 'Unsupported format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }

  // Store export in R2
  const exportKey = `exports/${user.id}/${projectId}/${filename}`;
  await env.EXPORTS.put(exportKey, exportData, {
    httpMetadata: { contentType }
  });

  // Generate signed URL
  const exportUrl = `https://cdn.brainsait.io/exports/${user.id}/${projectId}/${filename}`;

  return new Response(JSON.stringify({ exportUrl }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGithubSubmission(request: Request, env: Env, user: any, corsHeaders: any): Promise<Response> {
  const { projectId, repoName, description } = await request.json();

  // Queue GitHub submission job
  await env.AI_QUEUE.send({
    type: 'submit_to_github',
    projectId,
    userId: user.id,
    repoName,
    description
  });

  return new Response(JSON.stringify({
    message: 'GitHub submission started',
    checkUrl: `/api/projects/github-status?projectId=${projectId}`
  }), {
    status: 202,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getUserProjects(env: Env, userId: string): Promise<Project[]> {
  const userProjectsKey = `user_projects:${userId}`;
  const userProjects = await env.USER_DATA.get(userProjectsKey);

  if (!userProjects) {
    return [];
  }

  const projectIds: string[] = JSON.parse(userProjects);
  const projects: Project[] = [];

  for (const projectId of projectIds) {
    const projectData = await env.USER_DATA.get(`project:${projectId}`);
    if (projectData) {
      projects.push(JSON.parse(projectData));
    }
  }

  return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function onRequestOptions(): Promise<Response> {
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
