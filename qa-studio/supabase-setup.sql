-- QA Studio Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL,
  preconditions JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  expected_result TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  estimated_time_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Stories Table
CREATE TABLE IF NOT EXISTS user_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria JSONB DEFAULT '[]'::jsonb,
  priority TEXT NOT NULL,
  epic TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'backlog',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bugs Table
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bug_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps_to_reproduce JSONB DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL,
  priority TEXT NOT NULL,
  environment TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Plans Table
CREATE TABLE IF NOT EXISTS test_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Collections Table
CREATE TABLE IF NOT EXISTS api_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collection_id TEXT NOT NULL,
  name TEXT NOT NULL,
  requests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_cases_user_id ON test_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_bugs_user_id ON bugs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_plans_user_id ON test_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_api_collections_user_id ON api_collections(user_id);

-- Enable Row Level Security
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_cases
CREATE POLICY "Users can view their own test cases"
  ON test_cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test cases"
  ON test_cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test cases"
  ON test_cases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test cases"
  ON test_cases FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_stories
CREATE POLICY "Users can view their own user stories"
  ON user_stories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user stories"
  ON user_stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user stories"
  ON user_stories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user stories"
  ON user_stories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for bugs
CREATE POLICY "Users can view their own bugs"
  ON bugs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bugs"
  ON bugs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bugs"
  ON bugs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bugs"
  ON bugs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for test_plans
CREATE POLICY "Users can view their own test plans"
  ON test_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test plans"
  ON test_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test plans"
  ON test_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test plans"
  ON test_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for api_collections
CREATE POLICY "Users can view their own api collections"
  ON api_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own api collections"
  ON api_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own api collections"
  ON api_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own api collections"
  ON api_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stories_updated_at BEFORE UPDATE ON user_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at BEFORE UPDATE ON bugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_plans_updated_at BEFORE UPDATE ON test_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_collections_updated_at BEFORE UPDATE ON api_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
