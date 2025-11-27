
<p align="center">
  <img src="https://github.com/TheCollegeHub/azure-test-track-pipelines/blob/main/images/extension-logo.png" width="400" style="height: auto; display: block; margin: 0 auto;">
</p>

# Azure Test Track Pipelines


An Azure DevOps Pipelines Extension that updates release plans with test results using the `@thecollege/azure-test-track` package.

## 🚀 Quick Start

**Top guides:**
1. 📖 **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture overview
2. ⚡ **[GETTING STARTED - EXAMPLE_PLAYWRIGHT.md](docs/EXAMPLE_PLAYWRIGHT.md)** - Get started in 5 minutes

**Ready to test locally?** See **[LOCAL TESTING.md](docs/LOCAL_TESTING.md)** for detailed local testing guide.

## Overview

This extension provides a custom task that reads test result files (JUnit XML, Cucumber JSON, or Playwright JSON) and automatically creates test runs in Azure DevOps Test Plans.

## Features

- ✅ Support for multiple test result formats:
  - JUnit XML
  - Cucumber JSON
  - Playwright JSON
- ✅ Automatic test run creation in Azure DevOps
- ✅ Integration with Azure Test Plans
- ✅ Support for `test.info()` annotations (property-based Test Case ID extraction)

## Task Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `releasePlanName` | string | Yes | - | The name of the release plan to update |
| `testResultsFilePath` | string | Yes | `./test-results/results.xml` | Path to the test results file |
| `testRunName` | string | Yes | - | The name of the Test Run to be created |
| `reportType` | string | Yes | `junit` | Report type: `junit`, `playwright-json`, or `cucumber-json` |
| `useTestInfo` | boolean | No | `true` | Extract Test Case IDs from properties/annotations |

## Environment Variables Required

The task requires these environment variables to be set in your Azure DevOps environment:

- `ADO_ORGANIZATION`: Your Azure DevOps organization name
- `ADO_PROJECT`: Your Azure DevOps project name
- `ADO_PERSONAL_ACCESS_TOKEN`: Personal access token with Test Management permissions
- `ADO_COMPANY_EMAIL`: Your Azure DevOps email

## Usage in Azure Pipeline

```yaml
steps:
  - task: UpdateReleasePlanResultsTask@1
    inputs:
      releasePlanName: 'My Release Plan'
      testResultsFilePath: './test-results/results.xml'
      testRunName: '[Regression] E2E Test Run'
      reportType: 'junit'
      useTestInfo: true
```

## How It Works

The task uses the `createTestRunByExecution` method from `@thecollege/azure-test-track` which:

1. Reads the test result file
2. Extracts Test Case IDs (from test names or properties/annotations)
3. Searches for the specified Test Plan
4. Retrieves Test Points associated with the test cases
5. Creates a Test Run in Azure DevOps
6. Updates test results for each test case
7. Marks the Test Run as completed


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
