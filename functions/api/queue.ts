// 🤖 Cloudflare Pages Functions - AI Processing Queue
// Background job processing for AI tasks, PDF generation, and GitHub integration

interface Env {
  USER_DATA: KVNamespace;
  USER_FILES: R2Bucket;
  PROTOTYPES: R2Bucket;
  EXPORTS: R2Bucket;
  ANTHROPIC_API_KEY: string;
  GITHUB_TOKEN: string;
}

interface QueueMessage {
  type: 'generate_pdf' | 'submit_to_github' | 'ai_enhancement' | 'analytics_processing';
  projectId: string;
  userId: string;
  data?: any;
}

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;
  const { messages }: { messages: QueueMessage[] } = await request.json();

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://brainsait.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    for (const message of messages) {
      await processQueueMessage(message, env);
    }

    return new Response(JSON.stringify({
      success: true,
      processed: messages.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Queue Processing Error:', error);
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function processQueueMessage(message: QueueMessage, env: Env): Promise<void> {
  switch (message.type) {
    case 'generate_pdf':
      await generateProjectPDF(message, env);
      break;
    case 'submit_to_github':
      await submitToGitHub(message, env);
      break;
    case 'ai_enhancement':
      await processAIEnhancement(message, env);
      break;
    case 'analytics_processing':
      await processAnalytics(message, env);
      break;
    default:
      console.warn('Unknown message type:', message.type);
  }
}

async function generateProjectPDF(message: QueueMessage, env: Env): Promise<void> {
  try {
    // Get project data
    const projectData = await env.USER_DATA.get(`project:${message.projectId}`);
    if (!projectData) {
      throw new Error('Project not found');
    }

    const project = JSON.parse(projectData);

    // Generate PDF content using AI
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Generate a comprehensive PDF report for this innovation project in Arabic and English:

          Project: ${project.title}
          Description: ${project.description}
          Stage: ${project.stage}
          Content: ${JSON.stringify(project.content, null, 2)}

          Please create a professional PDF-ready HTML structure with:
          1. Executive Summary (Arabic & English)
          2. Project Overview
          3. Innovation Journey Details
          4. Technical Specifications
          5. Market Analysis
          6. Implementation Timeline
          7. Risk Assessment
          8. Recommendations

          Format as clean HTML with embedded CSS for PDF generation.`
        }]
      })
    });

    const aiResult = await response.json();
    const htmlContent = aiResult.content[0].text;

    // Store HTML in R2 for PDF conversion
    const htmlKey = `exports/${message.userId}/${message.projectId}/report.html`;
    await env.EXPORTS.put(htmlKey, htmlContent, {
      httpMetadata: { contentType: 'text/html' }
    });

    // Update project with export URL
    const exportUrl = `https://cdn.brainsait.io/exports/${message.userId}/${message.projectId}/report.html`;
    project.exportUrls = { ...project.exportUrls, html: exportUrl };
    await env.USER_DATA.put(`project:${message.projectId}`, JSON.stringify(project));

    console.log(`PDF generation completed for project ${message.projectId}`);
  } catch (error) {
    console.error('PDF generation failed:', error);

    // Store error status
    await env.USER_DATA.put(`export_status:${message.projectId}:pdf`, JSON.stringify({
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

async function submitToGitHub(message: QueueMessage, env: Env): Promise<void> {
  try {
    const projectData = await env.USER_DATA.get(`project:${message.projectId}`);
    if (!projectData) {
      throw new Error('Project not found');
    }

    const project = JSON.parse(projectData);
    const { repoName = `solo-spark-${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, description } = message.data || {};

    // Create GitHub repository
    const createRepoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Solo-Spark-Platform'
      },
      body: JSON.stringify({
        name: repoName,
        description: description || `Innovation project: ${project.title}`,
        private: false,
        auto_init: true
      })
    });

    const repo = await createRepoResponse.json();

    if (!createRepoResponse.ok) {
      throw new Error(`Failed to create repository: ${repo.message}`);
    }

    // Generate project files
    const files = await generateProjectFiles(project);

    // Upload files to GitHub
    for (const [filename, content] of Object.entries(files)) {
      await uploadFileToGitHub(repo.full_name, filename, content, env.GITHUB_TOKEN);
    }

    // Update project with GitHub info
    project.githubRepo = repo.html_url;
    project.updatedAt = new Date().toISOString();
    await env.USER_DATA.put(`project:${message.projectId}`, JSON.stringify(project));

    console.log(`GitHub submission completed for project ${message.projectId}: ${repo.html_url}`);
  } catch (error) {
    console.error('GitHub submission failed:', error);

    await env.USER_DATA.put(`github_status:${message.projectId}`, JSON.stringify({
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

async function uploadFileToGitHub(repoFullName: string, filename: string, content: string, token: string): Promise<void> {
  const encodedContent = btoa(content);

  await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filename}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Solo-Spark-Platform'
    },
    body: JSON.stringify({
      message: `Add ${filename}`,
      content: encodedContent
    })
  });
}

async function generateProjectFiles(project: any): Promise<Record<string, string>> {
  const files: Record<string, string> = {};

  // README.md
  files['README.md'] = `# ${project.title}

## Description
${project.description}

## Innovation Journey Stage
Current Stage: **${project.stage.toUpperCase()}**

## Project Details
- Created: ${new Date(project.createdAt).toLocaleDateString()}
- Last Updated: ${new Date(project.updatedAt).toLocaleDateString()}
- Tags: ${project.tags.join(', ')}

## Content

### Idea Phase
${project.content.idea ? JSON.stringify(project.content.idea, null, 2) : 'Not completed yet'}

### Story Phase
${project.content.story ? JSON.stringify(project.content.story, null, 2) : 'Not completed yet'}

### PRD Phase
${project.content.prd ? JSON.stringify(project.content.prd, null, 2) : 'Not completed yet'}

### Prototype Phase
${project.content.prototype ? JSON.stringify(project.content.prototype, null, 2) : 'Not completed yet'}

---

Generated by [Solo-Spark Innovation Platform](https://brainsait.io)
`;

  // project.json
  files['project.json'] = JSON.stringify(project, null, 2);

  // package.json for prototype projects
  if (project.content.prototype) {
    files['package.json'] = JSON.stringify({
      name: project.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '1.0.0',
      description: project.description,
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        test: 'echo "No tests specified" && exit 0'
      },
      keywords: project.tags,
      author: 'Solo-Spark Platform',
      license: 'MIT'
    }, null, 2);
  }

  return files;
}

async function processAIEnhancement(message: QueueMessage, env: Env): Promise<void> {
  // AI enhancement processing logic
  console.log(`Processing AI enhancement for project ${message.projectId}`);
}

async function processAnalytics(message: QueueMessage, env: Env): Promise<void> {
  // Analytics processing logic
  console.log(`Processing analytics for project ${message.projectId}`);
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://brainsait.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}
