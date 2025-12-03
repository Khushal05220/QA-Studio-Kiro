-- Add unique constraints for upsert functionality
-- Run this in your Supabase SQL Editor

-- STEP 1: Remove duplicates by keeping only the most recent record

-- Remove duplicate user_stories (keep most recent)
DELETE FROM user_stories a USING user_stories b
WHERE a.id < b.id 
AND a.user_id = b.user_id 
AND a.story_id = b.story_id;

-- Remove duplicate bugs (keep most recent)
DELETE FROM bugs a USING bugs b
WHERE a.id < b.id 
AND a.user_id = b.user_id 
AND a.bug_id = b.bug_id;

-- Remove duplicate test_plans (keep most recent)
DELETE FROM test_plans a USING test_plans b
WHERE a.id < b.id 
AND a.user_id = b.user_id 
AND a.plan_id = b.plan_id;

-- Remove duplicate test_cases (keep most recent)
DELETE FROM test_cases a USING test_cases b
WHERE a.id < b.id 
AND a.user_id = b.user_id 
AND a.test_id = b.test_id;

-- Remove duplicate api_collections (keep most recent)
DELETE FROM api_collections a USING api_collections b
WHERE a.id < b.id 
AND a.user_id = b.user_id 
AND a.collection_id = b.collection_id;

-- STEP 2: Add unique constraints

-- Add unique constraint for user_stories (user_id, story_id)
ALTER TABLE user_stories 
ADD CONSTRAINT user_stories_user_id_story_id_key 
UNIQUE (user_id, story_id);

-- Add unique constraint for bugs (user_id, bug_id)
ALTER TABLE bugs 
ADD CONSTRAINT bugs_user_id_bug_id_key 
UNIQUE (user_id, bug_id);

-- Add unique constraint for test_plans (user_id, plan_id)
ALTER TABLE test_plans 
ADD CONSTRAINT test_plans_user_id_plan_id_key 
UNIQUE (user_id, plan_id);

-- Add unique constraint for test_cases (user_id, test_id)
ALTER TABLE test_cases 
ADD CONSTRAINT test_cases_user_id_test_id_key 
UNIQUE (user_id, test_id);

-- Add unique constraint for api_collections (user_id, collection_id)
ALTER TABLE api_collections 
ADD CONSTRAINT api_collections_user_id_collection_id_key 
UNIQUE (user_id, collection_id);
