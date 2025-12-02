# CI/CD Setup Guide

## GitHub Actions Workflow

This project uses GitHub Actions for Continuous Integration and Deployment.

### Workflow Triggers
- **Push to main/develop branches**: Runs full test suite
- **Pull Requests**: Runs tests to validate changes
- **Manual trigger**: Can be run manually from GitHub Actions tab

### Pipeline Stages

1. **🧪 Testing Stage**
   - Runs on Node.js 18.x and 20.x
   - Executes all unit and integration tests
   - Generates test coverage reports
   - Uploads coverage to Codecov (optional)

2. **🔒 Security Stage**
   - Runs npm audit for vulnerabilities
   - Checks both server and client dependencies
   - Fails on moderate+ severity issues

3. **🚀 Build & Deploy Stage** (main branch only)
   - Builds production-ready client
   - Creates deployment artifacts
   - Ready for deployment to production

### Status Badge

Add this to your main README.md:

```markdown
![CI/CD Pipeline](https://github.com/madhavJivani/Tijori/actions/workflows/ci.yml/badge.svg)
```

### Local Development

#### Pre-commit Hook
A pre-commit hook is installed that runs tests before each commit:
- Automatically runs `npm test` in server directory
- Prevents commits if tests fail
- Ensures code quality before pushing to GitHub

#### Running Tests Locally
```bash
# Server tests
cd server
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage

# Client build check
cd client
npm run build
```

### Branch Protection Rules

To enforce CI/CD, set up branch protection rules in GitHub:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Select: `test (18.x)`, `test (20.x)`, `security-scan`
   - ✅ Require pull request reviews
   - ✅ Dismiss stale reviews

### Environment Variables

For production deployment, add these secrets in GitHub:
- `DATABASE_URL`: Production database connection
- `JWT_SECRET`: JWT signing secret
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `AWS_SECRET_ACCESS_KEY`: AWS credentials
- Any other environment-specific variables

### Codecov Integration (Optional)

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Add `CODECOV_TOKEN` to GitHub secrets
4. Coverage reports will be automatically uploaded

### Troubleshooting

#### Tests Fail in CI but Pass Locally
- Check Node.js version compatibility
- Verify environment variables are set
- Ensure all dependencies are in package.json

#### Security Audit Failures
```bash
# Fix vulnerabilities
npm audit fix

# Check specific issues
npm audit --audit-level=moderate
```

#### Build Failures
- Check all imports/exports use ES modules syntax
- Verify all required dependencies are installed
- Test build locally before pushing
