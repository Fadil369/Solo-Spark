// 📊 Cloudflare D1 Database Schema
-- Solo-Spark Innovation Platform Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'solo-prototype', 'solo-ultimate')),
  language TEXT DEFAULT 'ar' CHECK (language IN ('en', 'ar')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT DEFAULT 'idea' CHECK (stage IN ('idea', 'story', 'prd', 'prototype')),
  content TEXT, -- JSON content for each stage
  tags TEXT, -- JSON array of tags
  is_public BOOLEAN DEFAULT false,
  github_repo TEXT,
  export_urls TEXT, -- JSON object with export URLs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Project collaborators
CREATE TABLE IF NOT EXISTS project_collaborators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator', 'viewer')),
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE(project_id, user_id)
);

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  project_id TEXT,
  event_type TEXT NOT NULL,
  event_data TEXT, -- JSON data
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  stripe_subscription_id TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Payment history
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subscription_id INTEGER,
  amount INTEGER NOT NULL, -- Amount in halalas (SAR * 100)
  currency TEXT DEFAULT 'SAR',
  payment_method TEXT, -- stripe, stc_pay, mada
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL
);

-- AI usage tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  project_id TEXT,
  model TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  operation TEXT NOT NULL, -- idea_generation, story_creation, prd_writing, etc.
  cost_usd DECIMAL(10, 6),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
);

-- Feature usage analytics
CREATE TABLE IF NOT EXISTS feature_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  UNIQUE(user_id, feature_name) ON CONFLICT REPLACE
);

-- GitHub integrations
CREATE TABLE IF NOT EXISTS github_integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  submission_status TEXT DEFAULT 'pending' CHECK (submission_status IN ('pending', 'submitted', 'reviewed', 'approved', 'rejected')),
  reviewer_feedback TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- achievement, system, reminder, payment
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- User achievements and gamification
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_data TEXT, -- JSON data
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects (stage);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements (user_id);

-- Sample data for testing
INSERT OR IGNORE INTO users (id, email, name, subscription, language) VALUES
('test-user-1', 'test@brainsait.io', 'مستخدم تجريبي', 'solo-prototype', 'ar');

-- Views for common queries
CREATE VIEW IF NOT EXISTS user_projects_summary AS
SELECT
  u.id as user_id,
  u.name as user_name,
  u.email,
  COUNT(p.id) as total_projects,
  COUNT(CASE WHEN p.stage = 'idea' THEN 1 END) as idea_projects,
  COUNT(CASE WHEN p.stage = 'story' THEN 1 END) as story_projects,
  COUNT(CASE WHEN p.stage = 'prd' THEN 1 END) as prd_projects,
  COUNT(CASE WHEN p.stage = 'prototype' THEN 1 END) as prototype_projects,
  MAX(p.updated_at) as last_project_update
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.id, u.name, u.email;

CREATE VIEW IF NOT EXISTS project_analytics AS
SELECT
  p.id as project_id,
  p.title,
  p.stage,
  p.user_id,
  COUNT(ae.id) as total_events,
  COUNT(DISTINCT ae.user_id) as unique_users,
  MAX(ae.created_at) as last_activity
FROM projects p
LEFT JOIN analytics_events ae ON p.id = ae.project_id
GROUP BY p.id, p.title, p.stage, p.user_id;
