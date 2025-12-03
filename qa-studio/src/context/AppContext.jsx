import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const initialState = {
  apiStatus: { status: 'checking', lastModel: null, lastCheck: null, errors: [] },
  settings: {
    backendUrl: '/api',
    defaultModel: 'gemini-2.5-pro',
    streamingEnabled: true,
    systemPrompts: {}
  },
  testCases: [],
  testScripts: [],
  userStories: [],
  bugs: [],
  testPlans: [],
  apiCollections: [],
  toasts: [],
  modals: { quickCreate: false, apiStatus: false },
  mobileMenuOpen: false,
  undoStack: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_API_STATUS':
      return { ...state, apiStatus: { ...state.apiStatus, ...action.payload } };
    case 'ADD_API_ERROR':
      return {
        ...state,
        apiStatus: {
          ...state.apiStatus,
          errors: [action.payload, ...state.apiStatus.errors].slice(0, 5)
        }
      };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_TEST_CASES':
      return { ...state, testCases: action.payload };
    case 'ADD_TEST_CASES':
      return { ...state, testCases: [...state.testCases, ...action.payload] };
    case 'UPDATE_TEST_CASE':
      return {
        ...state,
        testCases: state.testCases.map(tc =>
          tc.id === action.payload.id ? { ...tc, ...action.payload } : tc
        )
      };
    case 'DELETE_TEST_CASES':
      return {
        ...state,
        testCases: state.testCases.filter(tc => !action.payload.includes(tc.id))
      };
    case 'DELETE_TEST_CASES':
      return {
        ...state,
        testCases: state.testCases.filter(tc => !action.payload.includes(tc.id))
      };
    case 'SET_USER_STORIES':
      return { ...state, userStories: action.payload };
    case 'ADD_USER_STORY':
      return { ...state, userStories: [...state.userStories, action.payload] };
    case 'UPDATE_USER_STORY':
      return {
        ...state,
        userStories: state.userStories.map(us =>
          us.id === action.payload.id ? { ...us, ...action.payload } : us
        )
      };
    case 'DELETE_USER_STORY':
      return {
        ...state,
        userStories: state.userStories.filter(us => us.id !== action.payload)
      };
    case 'SET_BUGS':
      return { ...state, bugs: action.payload };
    case 'ADD_BUG':
      return { ...state, bugs: [...state.bugs, action.payload] };
    case 'UPDATE_BUG':
      return {
        ...state,
        bugs: state.bugs.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload } : b
        )
      };
    case 'DELETE_BUG':
      return { ...state, bugs: state.bugs.filter(b => b.id !== action.payload) };
    case 'SET_TEST_PLANS':
      return { ...state, testPlans: action.payload };
    case 'ADD_TEST_PLAN':
      return { ...state, testPlans: [...state.testPlans, action.payload] };
    case 'UPDATE_TEST_PLAN':
      return {
        ...state,
        testPlans: state.testPlans.map(tp =>
          tp.id === action.payload.id ? { ...tp, ...action.payload } : tp
        )
      };
    case 'DELETE_TEST_PLAN':
      return { ...state, testPlans: state.testPlans.filter(tp => tp.id !== action.payload) };
    case 'SET_API_COLLECTIONS':
      return { ...state, apiCollections: action.payload };
    case 'ADD_API_COLLECTION':
      return { ...state, apiCollections: [...state.apiCollections, action.payload] };
    case 'UPDATE_API_COLLECTION':
      return {
        ...state,
        apiCollections: state.apiCollections.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        )
      };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'OPEN_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload]: true } };
    case 'CLOSE_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload]: false } };
    case 'TOGGLE_MOBILE_MENU':
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };
    case 'CLOSE_MOBILE_MENU':
      return { ...state, mobileMenuOpen: false };
    case 'PUSH_UNDO':
      return { ...state, undoStack: [action.payload, ...state.undoStack].slice(0, 20) };
    case 'POP_UNDO':
      return { ...state, undoStack: state.undoStack.slice(1) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  const checkApiStatus = useCallback(async () => {
    try {
      const result = await apiService.healthCheck();
      dispatch({
        type: 'SET_API_STATUS',
        payload: {
          status: result.geminiConnected ? 'connected' : 'degraded',
          lastModel: result.model,
          lastCheck: new Date().toISOString()
        }
      });
    } catch (error) {
      dispatch({
        type: 'SET_API_STATUS',
        payload: { status: 'failed', lastCheck: new Date().toISOString() }
      });
      dispatch({
        type: 'ADD_API_ERROR',
        payload: { message: error.message, timestamp: new Date().toISOString() }
      });
    }
  }, []);

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      console.log('No user, skipping data load');
      setIsInitialLoad(false);
      return;
    }

    console.log('Loading data from Supabase for user:', user.email);

    const loadData = async () => {
      try {
        const [testCases, userStories, bugs, testPlans, apiCollections] = await Promise.all([
          supabaseService.getTestCases(),
          supabaseService.getUserStories(),
          supabaseService.getBugs(),
          supabaseService.getTestPlans(),
          supabaseService.getApiCollections(),
        ]);

        console.log('Loaded from Supabase:', {
          testCases: testCases.length,
          userStories: userStories.length,
          bugs: bugs.length,
          testPlans: testPlans.length,
          apiCollections: apiCollections.length
        });

        // Transform Supabase data to app format
        dispatch({ type: 'SET_TEST_CASES', payload: testCases.map(tc => ({
          id: tc.test_id,
          category: tc.category,
          title: tc.title,
          priority: tc.priority,
          preconditions: tc.preconditions,
          steps: tc.steps,
          expectedResult: tc.expected_result,
          tags: tc.tags,
          estimatedTimeMinutes: tc.estimated_time_minutes,
          scenarioTitle: tc.scenario_title || 'Ungrouped Test Cases',
          epic: tc.epic,
          generatedAt: tc.generated_at,
        })) });

        dispatch({ type: 'SET_USER_STORIES', payload: userStories.map(us => ({
          id: us.story_id,
          title: us.title,
          description: us.description,
          acceptanceCriteria: us.acceptance_criteria,
          priority: us.priority,
          epic: us.epic,
          tags: us.tags,
          status: us.status,
        })) });

        dispatch({ type: 'SET_BUGS', payload: bugs.map(b => ({
          id: b.bug_id,
          title: b.title,
          description: b.description,
          stepsToReproduce: b.steps_to_reproduce,
          severity: b.severity,
          priority: b.priority,
          environment: b.environment,
          tags: b.tags,
          status: b.status,
        })) });

        dispatch({ type: 'SET_TEST_PLANS', payload: testPlans.map(tp => ({
          id: tp.plan_id,
          name: tp.name,
          description: tp.description,
          testCases: tp.test_cases,
          status: tp.status,
          metadata: tp.metadata || {},
        })) });

        dispatch({ type: 'SET_API_COLLECTIONS', payload: apiCollections.map(c => ({
          id: c.collection_id,
          name: c.name,
          requests: c.requests,
        })) });

        // Mark initial load as complete after a short delay
        setTimeout(() => setIsInitialLoad(false), 500);
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
        setIsInitialLoad(false);
      }
    };

    loadData();
  }, [user]);

  // Test Cases use MANUAL save only (to prevent duplicates)
  // User Stories and Bugs - DISABLED auto-save to prevent delete issues
  // Test Plans - DISABLED auto-save to prevent 409 conflict errors
  // Saves are now handled explicitly in each page when items are created/updated
  
  // NOTE: Auto-save disabled due to duplicate key conflicts
  // To re-enable, first clean up duplicate test_plans in Supabase

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, [checkApiStatus]);

  useEffect(() => {
    const saved = localStorage.getItem('qa-studio-settings');
    if (saved) {
      try {
        dispatch({ type: 'SET_SETTINGS', payload: JSON.parse(saved) });
      } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('qa-studio-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration);
    }
    return id;
  }, []);

  // Manual save function - saves specific test cases only
  const saveToDatabase = useCallback(async (testCasesToSave) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    if (!testCasesToSave || testCasesToSave.length === 0) {
      return { success: false, error: 'No test cases to save' };
    }
    
    try {
      await supabaseService.saveTestCases(testCasesToSave);
      return { success: true };
    } catch (error) {
      console.error('Save failed:', error);
      return { success: false, error };
    }
  }, [user]);

  const value = {
    state,
    dispatch,
    checkApiStatus,
    addToast,
    saveToDatabase
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
