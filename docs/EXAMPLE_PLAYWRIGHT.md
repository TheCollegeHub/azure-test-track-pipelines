# Example: Using with Playwright Tests

This example shows how to integrate the extension with a Playwright test project.

## Complete Workflow Example

### 1. Playwright Test Configuration

**playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Configure reporters - generate both formats for flexibility
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }]
  ],
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

### 2. Writing Tests with Test Case IDs

**Method A: Using Test Name (Traditional)**

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('TC_123456 - User can login with valid credentials', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');
  await page.click('#login-button');
  await expect(page.locator('.welcome-message')).toBeVisible();
});

test('TC_123457 - User cannot login with invalid credentials', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('#username', 'wronguser');
  await page.fill('#password', 'wrongpass');
  await page.click('#login-button');
  await expect(page.locator('.error-message')).toBeVisible();
});
```

**Method B: Using Annotations (Recommended - v1.5.0+)**

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('User can login with valid credentials', async ({ page }, testInfo) => {
  // Attach Test Case ID via annotation
  testInfo.annotations.push({
    type: 'TestCaseId',
    description: '123456'
  });
  
  await page.goto('https://example.com/login');
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');
  await page.click('#login-button');
  await expect(page.locator('.welcome-message')).toBeVisible();
});

test('User cannot login with invalid credentials', async ({ page }, testInfo) => {
  testInfo.annotations.push({
    type: 'TestCaseId',
    description: '123457'
  });
  
  await page.goto('https://example.com/login');
  await page.fill('#username', 'wronguser');
  await page.fill('#password', 'wrongpass');
  await page.click('#login-button');
  await expect(page.locator('.error-message')).toBeVisible();
});
```

**Method C: One Test, Multiple Test Cases**

```typescript
test('User profile management', async ({ page }, testInfo) => {
  // This test validates multiple Azure DevOps Test Cases
  testInfo.annotations.push(
    { type: 'TestCaseId', description: '123458' },  // TC: View profile
    { type: 'TestCaseId', description: '123459' },  // TC: Edit profile
    { type: 'TestCaseId', description: '123460' }   // TC: Save profile
  );
  
  await page.goto('https://example.com/profile');
  
  // Validates Test Case 123458: View profile
  await expect(page.locator('.profile-name')).toBeVisible();
  
  // Validates Test Case 123459: Edit profile
  await page.click('#edit-button');
  await page.fill('#name', 'New Name');
  
  // Validates Test Case 123460: Save profile
  await page.click('#save-button');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### 3. Azure DevOps Pipeline Configuration

**azure-pipelines.yml:**

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  testPlanName: 'Sprint 1 Test Plan'

stages:
  - stage: Test
    displayName: 'Run E2E Tests'
    jobs:
      - job: PlaywrightTests
        displayName: 'Playwright E2E Tests'
        steps:
          # 1. Checkout code
          - checkout: self

          # 2. Setup Node.js
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'
            displayName: 'Install Node.js'

          # 3. Install dependencies
          - script: |
              npm ci
              npx playwright install --with-deps
            displayName: 'Install dependencies'

          # 4. Run Playwright tests
          - script: |
              npx playwright test
            displayName: 'Run Playwright tests'
            continueOnError: true  # Continue even if tests fail

          # 5. Publish test results to Azure DevOps
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit-results.xml'
              failTaskOnFailedTests: false
            displayName: 'Publish test results'
            condition: succeededOrFailed()

          # 6. Update Azure Test Plan with results
          - task: UpdateReleasePlanResultsTask@1
            inputs:
              releasePlanName: '$(testPlanName)'
              testResultsFilePath: '$(System.DefaultWorkingDirectory)/test-results/junit-results.xml'
              testRunName: '[Build $(Build.BuildNumber)] E2E Test Run'
              reportType: 'junit'
              useTestInfo: true
            env:
              ADO_ORGANIZATION: $(ADO_ORGANIZATION)
              ADO_PROJECT: $(System.TeamProject)
              ADO_PERSONAL_ACCESS_TOKEN: $(ADO_PAT)
              ADO_COMPANY_EMAIL: $(ADO_EMAIL)
            displayName: 'Update Test Plan with results'
            condition: succeededOrFailed()

          # 7. Publish HTML report as artifact
          - task: PublishPipelineArtifact@1
            inputs:
              targetPath: 'playwright-report'
              artifactName: 'playwright-report'
            displayName: 'Publish Playwright HTML report'
            condition: succeededOrFailed()
```

### 4. Pipeline Variables (Library)

Create a Variable Group in Azure DevOps named `test-automation-config`:

| Variable Name | Value | Secret |
|---------------|-------|--------|
| ADO_ORGANIZATION | your-org-name | No |
| ADO_EMAIL | automation@company.com | No |
| ADO_PAT | ******* | Yes ✅ |

**How to create:**
1. Go to Azure DevOps → Pipelines → Library
2. Click "+ Variable group"
3. Name: `test-automation-config`
4. Add variables above
5. Make PAT variable secret
6. Save

**Link to pipeline:**
```yaml
variables:
  - group: test-automation-config
```

### 5. Alternative: Using Playwright JSON Reporter

If you prefer to use Playwright JSON format instead of JUnit:

**azure-pipelines.yml** (modified task):
```yaml
- task: UpdateReleasePlanResultsTask@1
  inputs:
    releasePlanName: '$(testPlanName)'
    testResultsFilePath: '$(System.DefaultWorkingDirectory)/test-results/playwright-results.json'
    testRunName: '[Build $(Build.BuildNumber)] E2E Test Run'
    reportType: 'playwright-json'  # ← Changed to playwright-json
    useTestInfo: true
  env:
    ADO_ORGANIZATION: $(ADO_ORGANIZATION)
    ADO_PROJECT: $(System.TeamProject)
    ADO_PERSONAL_ACCESS_TOKEN: $(ADO_PAT)
    ADO_COMPANY_EMAIL: $(ADO_EMAIL)
  displayName: 'Update Test Plan with results'
  condition: succeededOrFailed()
```

## Complete Project Structure

```
your-project/
├── tests/
│   ├── login.spec.ts
│   ├── profile.spec.ts
│   └── checkout.spec.ts
│
├── playwright.config.ts
├── package.json
└── azure-pipelines.yml
```

**package.json:**
```json
{
  "name": "e2e-tests",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20.0.0"
  }
}
```

## Azure DevOps Test Plan Setup

Before running the pipeline, ensure your Azure Test Plan is set up:

### 1. Create Test Plan
1. Go to Test Plans in Azure DevOps
2. Click "New Test Plan"
3. Name: "Sprint 1 Test Plan"
4. Save

### 2. Create Test Suites
1. Open your Test Plan
2. Click "+ New suite" → "Static suite"
3. Create suites like:
   - Login Tests
   - Profile Tests
   - Checkout Tests

### 3. Create Test Cases
1. Select a suite
2. Click "+ New" → "New test case"
3. Fill in:
   - **Title**: User can login with valid credentials
   - **Steps**: (Optional - for manual testing)
   - Save and note the **Test Case ID** (e.g., 123456)

### 4. Add Test Cases to Suite
1. Drag test cases into appropriate suites
2. Your Test Plan structure should match your test files

**Example Structure:**
```
Sprint 1 Test Plan
├── Login Tests
│   ├── TC 123456: User can login with valid credentials
│   └── TC 123457: User cannot login with invalid credentials
├── Profile Tests
│   ├── TC 123458: View profile
│   ├── TC 123459: Edit profile
│   └── TC 123460: Save profile
└── Checkout Tests
    └── TC 123461: Complete purchase flow
```

### 5. Update Your Tests with IDs

Use the Test Case IDs in your Playwright tests:

```typescript
// tests/login.spec.ts
test('User can login', async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: 'TestCaseId', description: '123456' });
  // test code...
});

test('Cannot login with invalid creds', async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: 'TestCaseId', description: '123457' });
  // test code...
});
```

## Expected Results

After pipeline runs successfully:

### In Azure Pipelines:
- ✅ Build completes
- ✅ Test results published
- ✅ Artifacts available (Playwright HTML report)

### In Azure Test Plans:
1. Navigate to Test Plans → "Sprint 1 Test Plan" → Runs
2. See new Test Run:
   - **Name**: [Build 20231127.1] E2E Test Run
   - **Status**: Completed
   - **Build**: #20231127.1 (linked)
   - **Results**: 
     - TC 123456: ✅ Passed (2.5s)
     - TC 123457: ✅ Passed (1.8s)
     - TC 123458: ✅ Passed (3.2s)

### Test Case Details:
- Click any Test Case → "Test results" tab
- See execution history with pass/fail status
- See associated automation (if using annotations)

## Troubleshooting

### Tests run but Test Run not created

**Check:**
- Pipeline variables are set correctly
- PAT has "Test Management (Read & Write)" permissions
- Test Plan name matches exactly (case-sensitive)
- Test Case IDs in tests match IDs in Azure DevOps

### Some tests not appearing in Test Run

**Reason:** Test Case IDs don't match or test cases not in Test Plan

**Solution:**
1. Verify Test Case IDs:
   ```typescript
   testInfo.annotations.push({ type: 'TestCaseId', description: '123456' });
   ```
2. Check test cases are added to Test Plan
3. Ensure test case IDs are strings, not numbers

### "Test Plan not found" error

**Solution:**
- Check `releasePlanName` variable
- Verify Test Plan exists in the project
- Test Plan name is case-sensitive

## Best Practices

1. **Use Annotations**: Prefer `testInfo.annotations` over test name patterns
2. **Variable Groups**: Store credentials in Variable Groups, not in pipeline YAML
3. **Continue on Error**: Use `continueOnError: true` for test step so Test Plan updates even if tests fail
4. **Meaningful Names**: Use descriptive Test Run names with build number
5. **Test Case Naming**: Keep Test Case titles clear and match test purposes

## Summary

This setup provides:
- ✅ Automated test execution in pipeline
- ✅ Test results published to Azure DevOps
- ✅ Test Plans automatically updated
- ✅ Test history and trends tracked
- ✅ Build association for traceability

Your QA team can now track automated test results directly in Azure Test Plans! 🎉
