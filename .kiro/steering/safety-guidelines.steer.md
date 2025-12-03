---
inclusion: always
---

# Safety and Security Guidelines for QA Studio

## Data Privacy

### User Data Protection
- Never store API keys or passwords in plain text
- Use environment variables for all sensitive configuration
- Implement proper session management
- Clear sensitive data from memory after use
- Follow GDPR and data protection regulations

### Supabase Security
- Use Row Level Security (RLS) policies
- Validate user ownership before data access
- Sanitize all user inputs before database queries
- Use parameterized queries to prevent SQL injection
- Implement proper authentication checks

### API Key Management
```javascript
// ✅ CORRECT: Use environment variables
const apiKey = process.env.GEMINI_API_KEY;

// ❌ WRONG: Never hardcode keys
const apiKey = "AIzaSy..."; // NEVER DO THIS
```

## Input Validation

### User Input Sanitization
- Validate all form inputs
- Escape HTML to prevent XSS
- Limit input length
- Check data types
- Validate URLs before fetching

### API Request Validation
```javascript
// Validate URL format
if (!isValidUrl(url)) {
  throw new Error('Invalid URL format');
}

// Sanitize user input
const sanitized = DOMPurify.sanitize(userInput);
```

## Rate Limiting

### API Protection
- Implement rate limiting on all endpoints
- Limit requests per user per minute
- Return 429 status for exceeded limits
- Log suspicious activity

### Client-Side Throttling
- Debounce user inputs
- Prevent duplicate submissions
- Show loading states
- Disable buttons during processing

## Error Handling

### Secure Error Messages
```javascript
// ✅ CORRECT: Generic user-facing message
catch (error) {
  console.error('Detailed error:', error); // Log for debugging
  return { error: 'An error occurred. Please try again.' }; // User sees this
}

// ❌ WRONG: Exposing internal details
catch (error) {
  return { error: error.stack }; // NEVER expose stack traces
}
```

### Error Logging
- Log errors server-side only
- Never expose sensitive data in logs
- Include context for debugging
- Monitor error patterns

## Authentication & Authorization

### Session Management
- Use secure, httpOnly cookies
- Implement session timeout
- Validate session on every request
- Clear sessions on logout

### Authorization Checks
```javascript
// Always verify user owns the resource
const item = await getItem(itemId);
if (item.user_id !== currentUser.id) {
  throw new Error('Unauthorized');
}
```

## Content Security

### XSS Prevention
- Sanitize all user-generated content
- Use Content Security Policy headers
- Escape HTML in rendered content
- Validate file uploads

### CSRF Protection
- Use CSRF tokens for state-changing operations
- Validate origin headers
- Implement SameSite cookie attributes

## Dependency Security

### Package Management
- Regularly update dependencies
- Audit packages for vulnerabilities
- Use `npm audit` before deployment
- Pin dependency versions

### Third-Party Services
- Validate all external API responses
- Implement timeouts
- Handle service failures gracefully
- Monitor third-party status

## Testing Security

### Secure Test Data
- Never use real user data in tests
- Generate synthetic test data
- Clear test data after runs
- Isolate test environments

### API Testing Safety
- Don't test against production
- Use test API keys
- Implement request limits
- Validate responses

## Deployment Security

### Environment Configuration
```bash
# .env.example (safe to commit)
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_key_here

# .env (NEVER commit)
GEMINI_API_KEY=actual_secret_key
```

### Production Checklist
- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Security headers set

## Monitoring & Alerts

### Security Monitoring
- Log authentication attempts
- Monitor API usage patterns
- Track failed requests
- Alert on suspicious activity

### Incident Response
- Have rollback plan ready
- Document security procedures
- Test backup restoration
- Maintain audit logs

## Code Review Guidelines

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Authorization checks implemented
- [ ] Error handling secure
- [ ] Dependencies up to date
- [ ] SQL injection prevented
- [ ] XSS protection in place

## Compliance

### Data Retention
- Define data retention policies
- Implement data deletion
- Provide data export
- Honor user deletion requests

### Audit Trail
- Log important actions
- Track data modifications
- Maintain access logs
- Enable audit queries

## Best Practices

### Principle of Least Privilege
- Grant minimum necessary permissions
- Use role-based access control
- Regularly review permissions
- Revoke unused access

### Defense in Depth
- Multiple layers of security
- Don't rely on single protection
- Validate at every layer
- Assume breach mentality

### Secure by Default
- Secure configurations out of box
- Opt-in for risky features
- Clear security documentation
- Regular security training
