import * as tl from 'azure-pipelines-task-lib/task';
import { createTestRunByExecution } from "@thecollege/azure-test-track";

async function run() {
    try {
        // Get environment variables - note: Secret variables in Azure Pipelines are prefixed with SECRET_
        const adoPersonalAccessToken = process.env.SECRET_ADO_PERSONAL_ACCESS_TOKEN || process.env.ADO_PERSONAL_ACCESS_TOKEN;
        
        // Validate required environment variables
        if (!process.env.ADO_ORGANIZATION) {
            throw new Error(`Missing required environment variable: ADO_ORGANIZATION. Please ensure this is set in your pipeline variables.`);
        }
        if (!process.env.ADO_PROJECT) {
            throw new Error(`Missing required environment variable: ADO_PROJECT. Please ensure this is set in your pipeline variables.`);
        }
        if (!adoPersonalAccessToken) {
            throw new Error(`Missing required environment variable: ADO_PERSONAL_ACCESS_TOKEN (Secret). Please ensure this is set in your pipeline variables.`);
        }
        
        // Set environment variables for the library
        process.env.ADO_PERSONAL_ACCESS_TOKEN = adoPersonalAccessToken;
        
        tl.debug(`Environment variables validated: ADO_ORGANIZATION=${process.env.ADO_ORGANIZATION}`);
        tl.debug(`Environment variables validated: ADO_PROJECT=${process.env.ADO_PROJECT}`);
        
        const releasePlanName: string = tl.getInput('releasePlanName', true)!;
        const testResultsFile: string = tl.getInput('testResultsFilePath', true)!;
        const testRunName: string = tl.getInput('testRunName', true)!;
        const reportType: string = tl.getInput('reportType', true)!;
        const useTestInfoInput: string = tl.getInput('useTestInfo', true)!;
        const useTestInfo: boolean = useTestInfoInput === 'true' || useTestInfoInput === 'True';
        
        tl.debug(`Processing test results from: ${testResultsFile} to apply in ${releasePlanName} named ${testRunName}`);

        const testSettings = {
            resultFilePath: testResultsFile,
            planName: releasePlanName,
            testRunName: testRunName,
            reportType: reportType,
            useTestInfo: useTestInfo
        }
        console.log('Test Settings:', testSettings);
        await createTestRunByExecution(testSettings);
       
        tl.setResult(tl.TaskResult.Succeeded, `Test results updated successfully. ${testRunName} create in Test Runs.`);
    } catch (error: any) {
        tl.setResult(tl.TaskResult.Failed, `Failed to update Release Plan: ${error.message}`);
    }
}

run();
