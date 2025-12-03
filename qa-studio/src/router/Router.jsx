import React, { useState, useEffect } from 'react';
import { Home } from '../pages/Home';
import { TestCaseGenerator } from '../pages/TestCaseGenerator';
import { TestScriptGenerator } from '../pages/TestScriptGenerator';
import { AdaAuditor } from '../pages/AdaAuditor';
import { ApiTesting } from '../pages/ApiTesting';
import { TestPlanMaker } from '../pages/TestPlanMaker';
import { StlcBacklog } from '../pages/StlcBacklog';
import { Library } from '../pages/Library';
import { Settings } from '../pages/Settings';
import Login from '../pages/Login';
import ResetPassword from '../pages/ResetPassword';

const routes = {
  '': Home,
  'login': Login,
  'reset-password': ResetPassword,
  'test-cases': TestCaseGenerator,
  'test-scripts': TestScriptGenerator,
  'ada-auditor': AdaAuditor,
  'api-testing': ApiTesting,
  'test-plans': TestPlanMaker,
  'stlc': StlcBacklog,
  'library': Library,
  'settings': Settings
};

export function Router() {
  const [currentPath, setCurrentPath] = useState(getHashPath());

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(getHashPath());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const Component = routes[currentPath] || Home;
  return <Component />;
}

function getHashPath() {
  const hash = window.location.hash.slice(1);
  return hash.startsWith('/') ? hash.slice(1) : hash;
}

export function navigate(path) {
  window.location.hash = path.startsWith('/') ? path : `/${path}`;
}

export function useRoute() {
  const [path, setPath] = useState(getHashPath());
  
  useEffect(() => {
    const handleHashChange = () => setPath(getHashPath());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return path;
}
