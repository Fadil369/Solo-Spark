export interface UserProfile {
  id: string;
  email: string;
  name: string;
  nameAr?: string;
  avatar?: string;
  industry: string;
  experience: string;
  language: 'en' | 'ar';
  subscription?: {
    plan: string;
    status: 'active' | 'inactive' | 'cancelled' | 'trial';
    renewalDate: string;
    features: string[];
  };
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    autoSave: boolean;
    aiAssistance: 'basic' | 'adaptive' | 'proactive';
  };
  stats: {
    projectsCreated: number;
    prdsGenerated: number;
    prototypesBuilt: number;
    totalXP: number;
    level: number;
    achievements: string[];
  };
  createdAt: string;
  lastLogin: string;
}

export interface SavedProject {
  id: string;
  userId: string;
  title: string;
  titleAr?: string;
  type: 'idea' | 'story' | 'prd' | 'prototype';
  stage: number;
  content: any;
  metadata: {
    industry: string;
    tags: string[];
    estimatedValue: number;
    feasibilityScore: number;
    lastModified: string;
    version: number;
  };
  shared: boolean;
  collaborators?: string[];
}

export interface GitHubSubmission {
  id: string;
  userId: string;
  projectId: string;
  repositoryUrl: string;
  submissionType: 'validation' | 'stage2_preparation';
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export class UserAccountService {
  private apiBase = '/api/users';
  private githubApiBase = 'https://api.github.com';

  // Authentication
  async signUp(email: string, password: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.apiBase}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          profile: {
            ...profile,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            stats: {
              projectsCreated: 0,
              prdsGenerated: 0,
              prototypesBuilt: 0,
              totalXP: 0,
              level: 1,
              achievements: ['welcome']
            },
            preferences: {
              notifications: true,
              darkMode: false,
              autoSave: true,
              aiAssistance: 'adaptive'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Sign up failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userProfile', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Account creation failed. Please try again.');
    }
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.apiBase}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Sign in failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userProfile', JSON.stringify(data.user));

      // Update last login
      this.updateProfile({ lastLogin: new Date().toISOString() });

      return data.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Invalid credentials. Please try again.');
    }
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('savedProjects');
  }

  // Profile Management
  getCurrentUser(): UserProfile | null {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.apiBase}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      // Fallback to local storage for offline mode
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw error;
    }
  }

  // Project Management
  async saveProject(project: Omit<SavedProject, 'id' | 'userId'>): Promise<SavedProject> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const savedProject: SavedProject = {
      ...project,
      id: this.generateId(),
      userId: user.id,
      metadata: {
        ...project.metadata,
        lastModified: new Date().toISOString(),
        version: (project.metadata?.version || 0) + 1
      }
    };

    try {
      const response = await fetch(`${this.apiBase}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(savedProject)
      });

      if (!response.ok) {
        throw new Error('Project save failed');
      }

      // Update user stats
      await this.updateStats({
        projectsCreated: user.stats.projectsCreated + 1,
        totalXP: user.stats.totalXP + this.getXPForProjectType(project.type)
      });

      return await response.json();
    } catch (error) {
      console.error('Project save error:', error);
      // Fallback to local storage
      return this.saveProjectLocally(savedProject);
    }
  }

  async getProjects(): Promise<SavedProject[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    try {
      const response = await fetch(`${this.apiBase}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      return await response.json();
    } catch (error) {
      console.error('Project fetch error:', error);
      // Fallback to local storage
      return this.getProjectsLocally();
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Project deletion failed');
      }
    } catch (error) {
      console.error('Project deletion error:', error);
      // Fallback to local storage
      this.deleteProjectLocally(projectId);
    }
  }

  // GitHub Integration
  async submitToGitHub(project: SavedProject, submissionType: 'validation' | 'stage2_preparation'): Promise<GitHubSubmission> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Create repository for the project
      const repoName = `${project.title.replace(/\s+/g, '-').toLowerCase()}-${project.type}`;
      const repoDescription = `${project.type.toUpperCase()} submitted from BrainSAIT Innovation Lab - Solo-Prototype`;

      const response = await fetch(`${this.githubApiBase}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          description: repoDescription,
          private: false,
          auto_init: true
        })
      });

      if (!response.ok) {
        throw new Error('GitHub repository creation failed');
      }

      const repo = await response.json();

      // Create project files
      await this.createProjectFiles(repo.full_name, project);

      // Create submission record
      const submission: GitHubSubmission = {
        id: this.generateId(),
        userId: user.id,
        projectId: project.id,
        repositoryUrl: repo.html_url,
        submissionType,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Save submission
      await fetch(`${this.apiBase}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(submission)
      });

      return submission;
    } catch (error) {
      console.error('GitHub submission error:', error);
      throw new Error('Failed to submit to GitHub. Please try again.');
    }
  }

  // File Export Functions
  async exportAsPDF(content: any, filename: string): Promise<void> {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const pdf = new jsPDF();

      // Create a temporary div with the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.formatContentForPDF(content);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export PDF. Please try again.');
    }
  }

  async exportAsJSON(project: SavedProject): Promise<void> {
    try {
      const { saveAs } = await import('file-saver');
      const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: 'application/json;charset=utf-8'
      });
      saveAs(blob, `${project.title}-${project.type}.json`);
    } catch (error) {
      console.error('JSON export error:', error);
      throw new Error('Failed to export JSON. Please try again.');
    }
  }

  // Private helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getXPForProjectType(type: string): number {
    const xpMap = {
      'idea': 10,
      'story': 20,
      'prd': 30,
      'prototype': 50
    };
    return xpMap[type as keyof typeof xpMap] || 10;
  }

  private saveProjectLocally(project: SavedProject): SavedProject {
    const projects = this.getProjectsLocally();
    projects.push(project);
    localStorage.setItem('savedProjects', JSON.stringify(projects));
    return project;
  }

  private getProjectsLocally(): SavedProject[] {
    const projects = localStorage.getItem('savedProjects');
    return projects ? JSON.parse(projects) : [];
  }

  private deleteProjectLocally(projectId: string): void {
    const projects = this.getProjectsLocally();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem('savedProjects', JSON.stringify(filtered));
  }

  private async updateStats(newStats: Partial<UserProfile['stats']>): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    const updatedStats = { ...user.stats, ...newStats };

    // Level calculation
    const newLevel = Math.floor(updatedStats.totalXP / 100) + 1;
    if (newLevel > updatedStats.level) {
      updatedStats.level = newLevel;
      updatedStats.achievements.push(`level_${newLevel}`);
    }

    await this.updateProfile({ stats: updatedStats });
  }

  private async createProjectFiles(repoFullName: string, project: SavedProject): Promise<void> {
    const files = [
      {
        path: 'README.md',
        content: this.generateReadme(project)
      },
      {
        path: `${project.type}.json`,
        content: JSON.stringify(project, null, 2)
      }
    ];

    if (project.type === 'prd') {
      files.push({
        path: 'PRD.md',
        content: this.formatPRDAsMarkdown(project.content)
      });
    }

    if (project.type === 'prototype') {
      files.push({
        path: 'PROTOTYPE.md',
        content: this.formatPrototypeAsMarkdown(project.content)
      });
    }

    for (const file of files) {
      await fetch(`${this.githubApiBase}/repos/${repoFullName}/contents/${file.path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add ${file.path}`,
          content: btoa(unescape(encodeURIComponent(file.content)))
        })
      });
    }
  }

  private generateReadme(project: SavedProject): string {
    return `# ${project.title}

## Project Information
- **Type**: ${project.type.toUpperCase()}
- **Industry**: ${project.metadata.industry}
- **Stage**: ${project.stage}
- **Estimated Value**: $${project.metadata.estimatedValue.toLocaleString()}
- **Feasibility Score**: ${project.metadata.feasibilityScore}/100

## Description
This project was created using BrainSAIT Innovation Lab - Solo-Prototype, an AI-powered innovation platform that guides users from ideas to prototypes.

## Tags
${project.metadata.tags.map(tag => `- ${tag}`).join('\n')}

## Generated Content
See the accompanying files for detailed project content:
- \`${project.type}.json\` - Raw project data
${project.type === 'prd' ? '- `PRD.md` - Product Requirements Document' : ''}
${project.type === 'prototype' ? '- `PROTOTYPE.md` - Prototype Documentation' : ''}

---
*Generated by [BrainSAIT Innovation Lab](https://brainsait.com) - من الأفكار إلى الابتكار*
`;
  }

  private formatPRDAsMarkdown(content: any): string {
    return `# Product Requirements Document

## Executive Summary
${content.executiveSummary || 'No executive summary provided.'}

## Problem Statement
${content.problemStatement || 'No problem statement provided.'}

## Solution Overview
${content.solutionOverview || 'No solution overview provided.'}

## Features & Requirements
${content.features ? content.features.map((feature: any, index: number) =>
  `### ${index + 1}. ${feature.title || 'Feature'}
  ${feature.description || 'No description provided.'}
  - **Priority**: ${feature.priority || 'Medium'}
  - **Effort**: ${feature.effort || 'Unknown'}
  `).join('\n') : 'No features defined.'}

## Technical Specifications
${content.technicalSpecs || 'No technical specifications provided.'}

## Success Metrics
${content.successMetrics || 'No success metrics defined.'}

## Timeline & Milestones
${content.timeline || 'No timeline provided.'}

---
*Generated by BrainSAIT Innovation Lab*
`;
  }

  private formatPrototypeAsMarkdown(content: any): string {
    return `# Prototype Documentation

## Business Overview
${content.businessOverview || 'No business overview provided.'}

## Technical Architecture
${content.technicalArchitecture || 'No technical architecture provided.'}

## Implementation Plan
${content.implementationPlan || 'No implementation plan provided.'}

## Market Analysis
${content.marketAnalysis || 'No market analysis provided.'}

## Financial Projections
${content.financialProjections || 'No financial projections provided.'}

## Risk Assessment
${content.riskAssessment || 'No risk assessment provided.'}

## Next Steps
${content.nextSteps || 'No next steps defined.'}

---
*Generated by BrainSAIT Innovation Lab*
`;
  }

  private formatContentForPDF(content: any): string {
    // Convert content to HTML for PDF generation
    if (typeof content === 'object') {
      return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            ${content.title || 'Project Document'}
          </h1>
          ${Object.entries(content).map(([key, value]) => `
            <div style="margin: 20px 0;">
              <h2 style="color: #4f46e5; margin-bottom: 10px;">
                ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h2>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
                ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              </div>
            </div>
          `).join('')}
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
            <p>Generated by BrainSAIT Innovation Lab - من الأفكار إلى الابتكار</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      `;
    }
    return `<div style="font-family: Arial, sans-serif; padding: 20px;">${content}</div>`;
  }
}

export const userAccountService = new UserAccountService();
