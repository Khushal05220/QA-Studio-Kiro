---
inclusion: always
---

# AI Behavior Guidelines for QA Studio

## Core Principles

### Quality Over Quantity
- Generate comprehensive but focused test cases
- Prioritize critical paths and edge cases
- Avoid redundant or trivial test scenarios
- Each test case should add unique value

### Clarity and Precision
- Use clear, unambiguous language
- Write specific, measurable expected results
- Include exact preconditions
- Number steps sequentially

### Professional Standards
- Follow industry best practices (ISTQB, IEEE)
- Use standard testing terminology
- Maintain consistent formatting
- Include proper test case metadata

## Test Case Generation

### Structure
Every test case must include:
1. **Title**: Clear, descriptive (max 100 chars)
2. **Description**: Brief overview of what's being tested
3. **Preconditions**: Required setup or state
4. **Steps**: Numbered, actionable steps
5. **Expected Result**: Specific, verifiable outcome
6. **Priority**: Critical, High, Medium, or Low

### Coverage Areas
- **Functional**: Core feature functionality
- **Edge Cases**: Boundary conditions, limits
- **Negative**: Invalid inputs, error handling
- **Performance**: Speed, load, stress scenarios

### Example Quality Test Case
```
Title: Verify user login with valid credentials
Description: Test successful authentication flow
Preconditions: User account exists with email test@example.com
Steps:
  1. Navigate to login page
  2. Enter email: test@example.com
  3. Enter password: ValidPass123
  4. Click "Sign In" button
Expected Result: User is redirected to dashboard, welcome message displayed
Priority: Critical
```

## Test Script Generation

### Code Quality Standards
- Follow framework conventions
- Include proper error handling
- Add meaningful comments
- Use descriptive variable names
- Implement waits/timeouts appropriately

### Framework-Specific Guidelines

**Selenium (Python)**
- Use explicit waits over implicit
- Implement Page Object Model pattern
- Include proper driver cleanup
- Handle stale element exceptions

**Cypress**
- Use cy.intercept() for API mocking
- Leverage custom commands
- Implement proper assertions
- Use data-testid selectors

**Playwright**
- Use auto-waiting features
- Implement proper page fixtures
- Handle multiple contexts
- Use codegen for complex interactions

**Postman**
- Include pre-request scripts
- Add test assertions
- Use environment variables
- Implement proper error handling

## API Testing

### Request Best Practices
- Validate URLs before sending
- Include appropriate headers
- Handle authentication properly
- Set reasonable timeouts

### Response Validation
- Check status codes
- Verify response structure
- Validate data types
- Check response times
- Verify headers

### Assertion Guidelines
- Test positive and negative cases
- Verify error messages
- Check edge cases
- Validate data integrity

## Accessibility Auditing

### WCAG 2.1 Compliance
- Level A: Must satisfy
- Level AA: Should satisfy (target)
- Level AAA: May satisfy

### Priority Issues
1. **Critical**: Prevents access entirely
2. **Serious**: Major barriers
3. **Moderate**: Significant issues
4. **Minor**: Improvements

### Audit Focus Areas
- Keyboard navigation
- Screen reader compatibility
- Color contrast (4.5:1 minimum)
- Alt text for images
- Form labels
- Heading hierarchy
- Focus indicators
- ARIA attributes

## User Story & Bug Generation

### User Story Format
```
As a [role]
I want [feature]
So that [benefit]

Acceptance Criteria:
- Given [context]
- When [action]
- Then [outcome]
```

### Bug Report Format
```
Title: [Clear, specific issue]
Description: [What happened]
Steps to Reproduce:
  1. [Step one]
  2. [Step two]
Expected: [What should happen]
Actual: [What actually happened]
Environment: [Browser, OS, version]
Severity: [Critical/Major/Minor/Trivial]
```

## Error Handling

### User-Facing Errors
- Provide clear, actionable messages
- Suggest solutions when possible
- Avoid technical jargon
- Include relevant context

### API Errors
- Return appropriate status codes
- Include error details in response
- Log errors for debugging
- Handle edge cases gracefully

## Performance Guidelines

### Response Times
- Test case generation: < 5 seconds
- Script generation: < 10 seconds
- API requests: < 2 seconds
- Accessibility audit: < 10 seconds

### Optimization
- Stream large responses
- Cache repeated requests
- Minimize API calls
- Optimize database queries

## Security Considerations

### Data Protection
- Never log sensitive data
- Sanitize user inputs
- Use environment variables for secrets
- Implement proper authentication

### API Security
- Validate all inputs
- Use HTTPS only
- Implement rate limiting
- Check authorization

## Continuous Improvement

### Learning from Usage
- Analyze generated content quality
- Track user edits and corrections
- Identify common patterns
- Refine prompts based on feedback

### Quality Metrics
- User satisfaction ratings
- Edit frequency
- Save-to-library rate
- Export frequency
- Feature usage patterns
