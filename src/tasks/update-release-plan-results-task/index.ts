import * as tl from 'azure-pipelines-task-lib/task';
import { createTestRunByExecution } from "@thecollege/azure-test-track";

async function run() {
    try {
        const adoPersonalAccessTokenInput = tl.getInput('adoPersonalAccessToken', true);
        tl.debug('Checking for environment variables and inputs...');
        const adoOrganization = process.env.ADO_ORGANIZATION;
        const adoProject = process.env.ADO_PROJECT;
        const adoPersonalAccessToken = adoPersonalAccessTokenInput || process.env.ADO_PERSONAL_ACCESS_TOKEN || process.env.SECRET_ADO_PERSONAL_ACCESS_TOKEN;
        
        if (!adoOrganization) {
            throw new Error(`Missing required variable: ADO_ORGANIZATION. Please ensure this is set in your pipeline variables.`);
        }
        if (!adoProject) {
            throw new Error(`Missing required variable: ADO_PROJECT. Please ensure this is set in your pipeline variables.`);
        }
        if (!adoPersonalAccessToken) {
            throw new Error(`Missing required input: Personal Access Token. Please map your secret variable $(ADO_PERSONAL_ACCESS_TOKEN) in the task configuration.`);
        }
        
        process.env.ADO_ORGANIZATION = adoOrganization;
        process.env.ADO_PROJECT = adoProject;
        process.env.ADO_PERSONAL_ACCESS_TOKEN = adoPersonalAccessToken;
        
        tl.debug(`Environment variables set for library execution`);
        
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
