# Local Testing Guide for Azure Test Track Pipelines Extension

This guide will help you test your Azure DevOps pipeline extension locally before publishing it.

## Prerequisites

1. **Azure DevOps Setup**:
   - An Azure DevOps organization and project
   - A Test Plan created in Azure Test Plans
   - Test Cases with IDs that match your test results
   - A Personal Access Token (PAT) with "Test Management" permissions

2. **Node.js Environment**:
   - Node.js 16+ installed
   - npm installed

## Step-by-Step Local Testing

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@thecollege/azure-test-track` - The core library
- `azure-pipelines-task-lib` - Azure Pipelines task SDK
- `dotenv` - Environment variable management
- TypeScript and types

### 2. Configure Environment Variables

Create a `.env` file in the root of your project (copy from `.env.example`):

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and fill in your Azure DevOps details:

```env
# Required: Your Azure DevOps Configuration
ADO_ORGANIZATION=contoso                    # Your organization name from the URL
ADO_PROJECT=MyProject                        # Your project name
ADO_PERSONAL_ACCESS_TOKEN=xxxxxxxxxxxxxx    # Your PAT token
ADO_COMPANY_EMAIL=you@company.com           # Your email

# Task Parameters
INPUT_RELEASEPLANNAME=Sprint 1 Test Plan    # Name of your test plan
INPUT_TESTRESULTSFILEPATH=./test-results/results.xml
INPUT_TESTRUNNAME=Local Test Run
INPUT_REPORTTYPE=junit                       # junit, playwright-json, or cucumber-json
INPUT_USETESTINFO=true                       # Use properties/annotations for Test Case IDs
```

#### How to Get Your Personal Access Token (PAT):

1. Go to Azure DevOps: `https://dev.azure.com/{your-org}`
2. Click on your profile icon (top right) → Personal Access Tokens
3. Click "New Token"
4. Set:
   - **Name**: "Test Track Local Testing"
   - **Organization**: Select your organization
   - **Scopes**: 
     - ✅ Test Management (Read & Write)
     - ✅ Work Items (Read)
   - **Expiration**: Choose duration
5. Click "Create" and copy the token immediately

### 3. Prepare Test Data

#### Option A: Use Sample Data (Provided)

The project includes sample test results files:
- `test-results/results.xml` - JUnit XML format
- `test-results/results-playwright.json` - Playwright JSON format

**Important**: Update the Test Case IDs in these files to match actual Test Case IDs from your Azure DevOps Test Plan!

#### Option B: Use Your Own Test Results

Place your test results file in the `test-results/` directory or any location, then update the path in `.env`:

```env
INPUT_TESTRESULTSFILEPATH=./path/to/your/results.xml
```

### 4. Build the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

This will create `index.js` in `src/tasks/update-release-plan-results-task/`

### 5. Run Local Tests

#### Basic Test:
```bash
npm run test:local
```

#### Test with JUnit XML:
```bash
npm run test:junit
```

#### Test with Playwright JSON:
```bash
npm run test:playwright
```

### 6. Verify Results

After running the test, you should see:

**Console Output:**
```
=================================
Local Test Configuration
=================================
Organization: contoso
Project: MyProject
Release Plan: Sprint 1 Test Plan
Test Results File: ./test-results/results.xml
Test Run Name: Local Test Run
Report Type: junit
Use Test Info: true
=================================

[Processing test results...]
Test results updated successfully. Local Test Run create in Test Runs.
```

**In Azure DevOps:**
1. Go to Test Plans → Your Test Plan
2. Click on "Runs" tab
3. You should see a new Test Run with the name you specified
4. Test results should be populated with pass/fail status

## Understanding the Code Flow

### How the Task Works:

```
┌─────────────────────────┐
│  Pipeline Task Called   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Read Task Inputs        │
│ - releasePlanName       │
│ - testResultsFilePath   │
│ - testRunName           │
│ - reportType            │
│ - useTestInfo           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Call createTestRunBy    │
│ Execution() from        │
│ @thecollege/azure-      │
│ test-track              │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Library Processing:     │
│ 1. Parse test results   │
│ 2. Extract Test Case IDs│
│ 3. Find Test Plan       │
│ 4. Get Test Points      │
│ 5. Create Test Run      │
│ 6. Update Results       │
│ 7. Complete Test Run    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Task Completes         │
│  (Success/Failure)      │
└─────────────────────────┘
```

### Key Code Locations:

**Task Entry Point** (`src/tasks/update-release-plan-results-task/index.ts`):
```typescript
// 1. Read inputs from pipeline
const releasePlanName = tl.getInput('releasePlanName', true)!;
const testResultsFile = tl.getInput('testResultsFilePath', true)!;
// ...

// 2. Prepare settings object
const testSettings = {
    resultFilePath: testResultsFile,
    planName: releasePlanName,
    testRunName: testRunName,
    reportType: reportType,
    useTestInfo: useTestInfo
}

// 3. Call the library method
await createTestRunByExecution(testSettings);
```

## Common Issues and Solutions

### Issue 1: "Test Plan not found"
**Cause**: The plan name doesn't match exactly
**Solution**: 
- Verify the exact name in Azure Test Plans
- Names are case-sensitive
- Check for extra spaces

### Issue 2: "No Test Case IDs found"
**Cause**: Test Case IDs not properly formatted in results file
**Solution**:
- For traditional method: Test name must include `TC_123456`
- For property-based: Add `<property name="TestCaseId" value="123456"/>` in JUnit XML
- For Playwright: Use `testInfo.annotations.push({type: 'TestCaseId', description: '123456'})`

### Issue 3: "Authentication failed"
**Cause**: Invalid PAT or insufficient permissions
**Solution**:
- Regenerate PAT with correct permissions
- Ensure Test Management (Read & Write) is enabled
- Check token hasn't expired

### Issue 4: "Test Cases not in Test Plan"
**Cause**: Test Case IDs in results don't exist in the specified Test Plan
**Solution**:
- Verify Test Cases exist in Azure DevOps
- Add Test Cases to the Test Plan
- Check Test Case IDs match exactly

## Advanced Testing Scenarios

### Testing with Multiple Test Case IDs per Test

```xml
<testcase name="Complex Integration Test">
  <properties>
    <property name="TestCaseId" value="123456"/>
    <property name="TestCaseId" value="123457"/>
    <property name="TestCaseId" value="123458"/>
  </properties>
</testcase>
```

This single test will update results for all three Test Cases.

### Testing with Build Association

Add to your `.env`:
```env
BUILD_BUILDID=12345
```

The test run will be associated with this build ID in Azure DevOps.

### Testing Different Report Types

#### JUnit XML:
```bash
set INPUT_REPORTTYPE=junit
set INPUT_TESTRESULTSFILEPATH=./test-results/results.xml
npm run test:local
```

#### Playwright JSON:
```bash
set INPUT_REPORTTYPE=playwright-json
set INPUT_TESTRESULTSFILEPATH=./test-results/results-playwright.json
npm run test:local
```

#### Cucumber JSON:
```bash
set INPUT_REPORTTYPE=cucumber-json
set INPUT_TESTRESULTSFILEPATH=./test-results/cucumber-results.json
npm run test:local
```

## Next Steps

After successful local testing:

1. **Build the extension package**:
   ```bash
   tfx extension create --manifest-globs vss-extension.json
   ```

2. **Upload to Azure DevOps Marketplace** (or share privately)

3. **Install in your organization**

4. **Use in pipelines**:
   ```yaml
   - task: UpdateReleasePlanResultsTask@1
     inputs:
       releasePlanName: '$(TestPlanName)'
       testResultsFilePath: '$(System.DefaultWorkingDirectory)/test-results/results.xml'
       testRunName: '[Build $(Build.BuildNumber)] Test Run'
       reportType: 'junit'
       useTestInfo: true
   ```

## Debugging Tips

### Enable Debug Logging

In your `.env`, add:
```env
SYSTEM_DEBUG=true
```

### Test Specific Functions

Create a custom test script:
```javascript
const { createTestRunByExecution } = require('@thecollege/azure-test-track');

async function testSpecific() {
    const testSettings = {
        resultFilePath: './test-results/results.xml',
        planName: 'My Test Plan',
        testRunName: 'Debug Test Run',
        reportType: 'junit',
        useTestInfo: true
    };
    
    try {
        await createTestRunByExecution(testSettings);
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSpecific();
```

## Resources

- [@thecollege/azure-test-track npm package](https://www.npmjs.com/package/@thecollege/azure-test-track)
- [Azure Pipelines Task SDK](https://github.com/microsoft/azure-pipelines-task-lib)
- [Azure Test Plans Documentation](https://learn.microsoft.com/en-us/azure/devops/test/overview)

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify all environment variables are set correctly
3. Ensure Test Case IDs match between results and Azure DevOps
4. Check the PAT has correct permissions
5. Review the console output for detailed error messages
