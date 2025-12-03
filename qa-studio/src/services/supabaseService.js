import { supabase } from '../lib/supabase';

class SupabaseService {
  // Test Cases
  async getTestCases() {
    const { data, error } = await supabase
      .from('test_cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveTestCases(testCases) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (testCases.length === 0) {
      return { success: true };
    }

    // Insert new test cases only (don't delete existing ones)
    const casesToInsert = testCases.map(tc => ({
      user_id: user.id,
      test_id: tc.id,
      category: tc.category || 'Uncategorized',
      title: tc.title,
      priority: tc.priority || 'Medium',
      preconditions: tc.preconditions || [],
      steps: tc.steps || [],
      expected_result: tc.expectedResult || '',
      tags: tc.tags || [],
      estimated_time_minutes: tc.estimatedTimeMinutes || 5,
      scenario_title: tc.scenarioTitle || 'Ungrouped Test Cases',
      epic: tc.epic || null,
      generated_at: tc.generatedAt || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('test_cases')
      .insert(casesToInsert);
      
    if (error) throw error;
    return { success: true };
  }

  async deleteTestCases(testIds) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!testIds || testIds.length === 0) {
      return { success: true };
    }

    const { error } = await supabase
      .from('test_cases')
      .delete()
      .eq('user_id', user.id)
      .in('test_id', testIds);
      
    if (error) throw error;
    return { success: true };
  }

  // API Collections
  async getApiCollections() {
    const { data, error } = await supabase
      .from('api_collections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveApiCollection(collection) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const collectionToInsert = {
      user_id: user.id,
      collection_id: collection.id,
      name: collection.name,
      requests: collection.requests || [],
    };

    const { error } = await supabase
      .from('api_collections')
      .insert(collectionToInsert);
      
    if (error) throw error;
    return { success: true };
  }

  async updateApiCollection(collection) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('api_collections')
      .update({ 
        name: collection.name,
        requests: collection.requests || []
      })
      .eq('user_id', user.id)
      .eq('collection_id', collection.id);
      
    if (error) throw error;
    return { success: true };
  }

  async deleteUserStories(storyIds) {
    console.log('deleteUserStories called with:', storyIds);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('deleteUserStories: Not authenticated');
      throw new Error('Not authenticated');
    }

    if (!storyIds || storyIds.length === 0) {
      console.log('deleteUserStories: No IDs provided');
      return { success: true };
    }

    console.log('Deleting user stories from Supabase:', storyIds, 'for user:', user.id);
    const { data, error } = await supabase
      .from('user_stories')
      .delete()
      .eq('user_id', user.id)
      .in('story_id', storyIds)
      .select();
      
    console.log('Delete result:', { data, error });
    if (error) {
      console.error('Delete user stories error:', error);
      throw error;
    }
    console.log('User stories deleted successfully');
    return { success: true };
  }

  async deleteBugs(bugIds) {
    console.log('deleteBugs called with:', bugIds);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('deleteBugs: Not authenticated');
      throw new Error('Not authenticated');
    }

    if (!bugIds || bugIds.length === 0) {
      console.log('deleteBugs: No IDs provided');
      return { success: true };
    }

    console.log('Deleting bugs from Supabase:', bugIds, 'for user:', user.id);
    const { data, error } = await supabase
      .from('bugs')
      .delete()
      .eq('user_id', user.id)
      .in('bug_id', bugIds)
      .select();
      
    console.log('Delete result:', { data, error });
    if (error) {
      console.error('Delete bugs error:', error);
      throw error;
    }
    console.log('Bugs deleted successfully');
    return { success: true };
  }

  async deleteTestPlans(planIds) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!planIds || planIds.length === 0) {
      return { success: true };
    }

    const { error } = await supabase
      .from('test_plans')
      .delete()
      .eq('user_id', user.id)
      .in('plan_id', planIds);
      
    if (error) throw error;
    return { success: true };
  }

  // User Stories
  async getUserStories() {
    const { data, error } = await supabase
      .from('user_stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveUserStories(stories) {
    console.log('saveUserStories called with:', stories);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('saveUserStories: Not authenticated');
      throw new Error('Not authenticated');
    }

    if (stories.length === 0) {
      console.log('saveUserStories: No stories to save');
      return { success: true };
    }

    const storiesToUpsert = stories.map(story => ({
      user_id: user.id,
      story_id: story.id,
      title: story.title,
      description: story.description || '',
      acceptance_criteria: story.acceptanceCriteria || [],
      priority: story.priority || 'Medium',
      epic: story.epic || '',
      tags: story.tags || [],
      status: story.status || 'New',
    }));

    console.log('Upserting user stories:', storiesToUpsert);

    // Use onConflict to update existing records based on user_id and story_id
    const { data, error } = await supabase
      .from('user_stories')
      .upsert(storiesToUpsert, { 
        onConflict: 'user_id,story_id',
        ignoreDuplicates: false 
      })
      .select();
      
    console.log('Upsert result:', { data, error });
    if (error) {
      console.error('Upsert user stories error:', error);
      throw error;
    }
    console.log('User stories saved successfully');
    return { success: true };
  }

  // Bugs
  async getBugs() {
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveBugs(bugs) {
    console.log('saveBugs called with:', bugs);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('saveBugs: Not authenticated');
      throw new Error('Not authenticated');
    }

    if (bugs.length === 0) {
      console.log('saveBugs: No bugs to save');
      return { success: true };
    }

    const bugsToUpsert = bugs.map(bug => ({
      user_id: user.id,
      bug_id: bug.id,
      title: bug.title,
      description: bug.description || '',
      steps_to_reproduce: bug.stepsToReproduce || [],
      severity: bug.severity || 'Major',
      priority: bug.priority || 'Medium',
      environment: bug.environment || '',
      tags: bug.tags || [],
      status: bug.status || 'New',
    }));

    console.log('Upserting bugs:', bugsToUpsert);

    // Use onConflict to update existing records based on user_id and bug_id
    const { data, error } = await supabase
      .from('bugs')
      .upsert(bugsToUpsert, { 
        onConflict: 'user_id,bug_id',
        ignoreDuplicates: false 
      })
      .select();
      
    console.log('Upsert result:', { data, error });
    if (error) {
      console.error('Upsert bugs error:', error);
      throw error;
    }
    console.log('Bugs saved successfully');
    return { success: true };
  }

  // Test Plans
  async getTestPlans() {
    const { data, error } = await supabase
      .from('test_plans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveTestPlans(plans) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (plans.length === 0) {
      return { success: true };
    }

    const plansToUpsert = plans.map(plan => ({
      user_id: user.id,
      plan_id: plan.id,
      name: plan.name,
      description: plan.description || '',
      test_cases: plan.testCases || [],
      status: plan.status || 'draft',
      metadata: plan.metadata || null, // Store additional fields as JSON
    }));

    const { error } = await supabase
      .from('test_plans')
      .upsert(plansToUpsert);
    if (error) throw error;
    return { success: true };
  }

}

export const supabaseService = new SupabaseService();
