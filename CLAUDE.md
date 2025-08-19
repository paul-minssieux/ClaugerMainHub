# Claude.md - ClaugerMainHub Project Configuration

## 🎯 Project Overview

ClaugerMainHub is a sophisticated micro-frontend orchestration platform built with React/TypeScript, designed to provide a unified access point for all Clauger business applications while maintaining their technical and functional independence.

## 🔧 MCP Servers Configuration

This project uses Model Context Protocol (MCP) servers to enhance Claude's capabilities and provide seamless integration with various development tools.

### Available MCP Servers

#### 1. **Context7 MCP Server**
- **Purpose**: Provides up-to-date documentation for frameworks and libraries
- **Usage**: Access real-time documentation without leaving the development environment
- **Commands**:
  ```
  # Search documentation
  "Search React 18 hooks documentation"
  "Find TypeScript strict mode configuration"
  "Get Chakra UI theme customization guide"
  ```

#### 2. **GitHub MCP Server**
- **Purpose**: Direct integration with GitHub repository
- **Capabilities**:
  - Create/review pull requests
  - Manage issues and milestones
  - Access commit history
  - Trigger CI/CD workflows
- **Repository**: https://github.com/paul-minssieux/ClaugerMainHub
- **Commands**:
  ```
  # Issue management
  "Create issue for UC 1.1 - React/TypeScript setup"
  "List all open issues for Epic 1"
  "Update issue #123 with progress"
  
  # PR management
  "Create PR for feature/UC-1.1-setup-react-vite"
  "Review PR #45 and provide feedback"
  ```

#### 3. **Playwright MCP Server**
- **Purpose**: Browser automation for E2E testing
- **Features**:
  - Automated test generation
  - Visual regression testing
  - Cross-browser testing
  - Accessibility testing
- **Commands**:
  ```
  # Test creation
  "Create E2E test for sidebar navigation"
  "Generate visual regression test for dashboard"
  "Test authentication flow with Azure Entra ID"
  ```

#### 4. **Memory Server**
- **Purpose**: Persistent memory across conversations
- **Features**:
  - Auto-saves important project decisions
  - Recalls previous architectural choices
  - Maintains context for complex features
- **Trigger Keywords**: "remember", "recall", "note", "important"

## 🤖 Specialized Agents

### 1. **agent-architecte-claude-code.md**
- **Role**: System architecture and design decisions
- **Responsibilities**:
  - Micro-frontend architecture (Single-spa/Piral)
  - API design patterns
  - Database schema design
  - Performance optimization strategies
- **Activation**: "As the architect agent..."

### 2. **code-generator-agent.md**
- **Role**: Code generation following project standards
- **Responsibilities**:
  - React component generation
  - TypeScript interfaces
  - API endpoints
  - Database migrations
- **Standards**:
  ```typescript
  // Always use interfaces over types
  interface UserProps {
    id: string;
    name: string;
  }
  
  // Strict TypeScript configuration
  {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
  ```

### 3. **test-engineer-agent.md**
- **Role**: Comprehensive testing strategy
- **Responsibilities**:
  - Unit tests (Jest + Testing Library)
  - Integration tests
  - E2E tests (Playwright)
  - Performance testing
- **Coverage Requirements**:
  - Statements: > 80%
  - Branches: > 75%
  - Functions: > 80%
  - Lines: > 80%

### 4. **security-agent.md**
- **Role**: Security implementation and auditing
- **Focus Areas**:
  - Azure Entra ID OAuth2 integration
  - JWT token management
  - RBAC implementation
  - CSRF protection
  - Data encryption

### 5. **performance-agent.md**
- **Role**: Performance optimization
- **Metrics**:
  - Initial load < 3s on 4G
  - API response < 200ms (95 percentile)
  - Lighthouse score > 80
  - Bundle size < 500KB initial

### 6. **accessibility-agent.md**
- **Role**: WCAG 2.1 AA compliance
- **Responsibilities**:
  - Keyboard navigation
  - Screen reader support
  - ARIA attributes
  - Color contrast (4.5:1 minimum)

### 7. **documentation-agent.md**
- **Role**: Technical documentation
- **Outputs**:
  - API documentation
  - Component documentation
  - Architecture Decision Records (ADRs)
  - User guides

### 8. **i18n-agent.md**
- **Role**: Internationalization
- **Languages**: FR, EN, ES, IT
- **Responsibilities**:
  - Translation management
  - Date/time formatting
  - Number formatting
  - RTL support preparation

### 9. **integration-agent.md**
- **Role**: External system integration
- **Systems**:
  - Azure Entra ID
  - Viva Engage
  - Application Insights
  - Redis cache

### 10. **ci-cd-agent.md**
- **Role**: DevOps and deployment
- **Tools**:
  - GitHub Actions
  - Docker
  - Azure App Service/AKS
  - SonarQube

### 11. **agent-dev-widget-claude-code.md**
- **Role**: Widget development specialist
- **Responsibilities**:
  - Widget architecture
  - JSON Schema configuration
  - Marketplace integration
  - Widget versioning

### 12. **code-review-agent.md**
- **Role**: Code quality assurance
- **Checks**:
  - ESLint compliance
  - TypeScript strict mode
  - Security vulnerabilities
  - Performance implications

## 📁 Project Structure

```
ClaugerMainHub/
├── src/
│   ├── modules/          # Business modules
│   │   ├── auth/         # Authentication (UC 2.x)
│   │   ├── dashboard/    # Dashboards (UC 5.x)
│   │   ├── sidebar/      # Sidebar (UC 3.x)
│   │   ├── widgets/      # Widgets (UC 6.x)
│   │   └── micro-frontends/ # MF management (UC 4.x)
│   ├── shared/           # Shared code
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   ├── infrastructure/   # Infrastructure layer
│   │   ├── api/          # API clients
│   │   ├── cache/        # Redis integration
│   │   └── monitoring/   # Application Insights
│   └── tests/           # Global tests
├── docs/                # Documentation
│   ├── plans/           # Development plans
│   ├── architecture/    # ADRs
│   └── api/            # API documentation
└── scripts/            # Build and deployment scripts
```

## 🔄 Development Workflow

### 1. **Issue Creation**
```bash
# Use GitHub MCP to create issue
"Create issue for UC X.Y with template from guideUC.txt"

# Link to Epic
"Link issue to Epic N - [Epic Name]"
```

### 2. **Branch Creation**
```bash
# Naming convention
feature/UC-[X.Y]-[description-courte]
# Example: feature/UC-1.1-setup-react-vite
```

### 3. **Development**
```bash
# Use code generator agent
"Generate React component for sidebar navigation following UC 3.1"

# Use Context7 for documentation
"Find best practices for React 18 Suspense boundaries"
```

### 4. **Testing**
```bash
# Use test engineer agent with Playwright MCP
"Create E2E test for dashboard creation flow (UC 5.1)"

# Generate unit tests
"Generate unit tests for auth service with 80% coverage"
```

### 5. **Code Review**
```bash
# Use code review agent
"Review code in feature/UC-1.1 branch for quality issues"

# Security check
"Run security audit on authentication implementation"
```

### 6. **Documentation**
```bash
# Use documentation agent
"Generate API documentation for dashboard endpoints"

# Create ADR
"Create ADR for choosing Single-spa over Piral"
```


## 🚀 Quick Commands

### Project Setup
```bash
# Initial setup
"Set up project following UC 1.1 with React 18, TypeScript, and Vite"

# Install dependencies
"Configure all dependencies from CDC including Chakra UI and Redux Toolkit"
```

### Feature Development
```bash
# Sidebar development
"Implement sidebar with favorites section following UC 3.6-3.8"

# Dashboard creation
"Create dashboard management system following UC 5.1-5.3"
```

### Testing
```bash
# E2E test suite
"Create complete E2E test suite for authentication flow"

# Performance testing
"Run Lighthouse audit and suggest optimizations for 90+ score"
```

### Deployment
```bash
# Docker setup
"Create Dockerfile and docker-compose for development environment"

# CI/CD pipeline
"Set up GitHub Actions workflow for automated testing and deployment"
```

## 💡 Best Practices

1. **Always Reference UCs**: When implementing features, reference the specific UC number
2. **Use Agents**: Activate specialized agents for their domain expertise
3. **Leverage MCP Servers**: Use Context7 for documentation, GitHub for version control
4. **Test Everything**: Maintain >80% code coverage
5. **Document Decisions**: Create ADRs for significant architectural choices
6. **Performance First**: Check Lighthouse scores regularly
7. **Accessibility Always**: Validate WCAG compliance for every component

## 🔐 Security Considerations

- Never commit secrets or API keys
- Use environment variables for configuration
- Implement proper CORS policies
- Validate all user inputs
- Use prepared statements for database queries
- Regular security audits with npm audit

## 📝 Memory Triggers

When discussing important decisions or patterns, use these keywords to trigger the memory server:
- "Remember that..."
- "Important decision: ..."
- "Note for future: ..."
- "Architectural choice: ..."

This ensures continuity across development sessions and maintains project context.

## 🎨 UI/UX Standards

- **Design System**: Chakra UI with Clauger theme customization
- **Responsive Breakpoints**: 640px, 768px, 1024px, 1280px, 1920px
- **Animation Duration**: 300ms for transitions
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Loading States**: Always show loading indicators for async operations

## 📊 Monitoring and Analytics

- **Application Insights**: All errors and performance metrics
- **Custom Events**: User interactions and feature usage
- **Performance Budgets**: 
  - FCP < 1.5s
  - TTI < 3.5s
  - CLS < 0.1
  - FID < 100ms

---

**Remember**: This configuration is designed to maximize productivity and maintain high code quality throughout the ClaugerMainHub project. Use the MCP servers and agents to their full potential for efficient development.