import * as tl from 'azure-pipelines-task-lib/task';
import { createTestRunByExecution } from "@thecollege/azure-test-track";

// Capture console.error to ensure library errors appear in logs
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
    originalConsoleError(...args);
    tl.debug(`[LIBRARY ERROR] ${args.join(' ')}`);
};

const adoPersonalAccessTokenInput = tl.getInput('adoPersonalAccessToken', true);
tl.debug('Checking for environment variables and inputs...');
let adoOrganization = process.env.ADO_ORGANIZATION;
let adoProject = process.env.ADO_PROJECT;
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

// Set environment variables BEFORE importing the library
process.env.ADO_ORGANIZATION = adoOrganization;
process.env.ADO_PROJECT = adoProject;
process.env.ADO_PERSONAL_ACCESS_TOKEN = adoPersonalAccessToken;

tl.debug(`Environment variables set for library execution`);
tl.debug(`ADO_ORGANIZATION: ${process.env.ADO_ORGANIZATION}`);
tl.debug(`ADO_PROJECT: ${process.env.ADO_PROJECT}`);
tl.debug(`ADO_PERSONAL_ACCESS_TOKEN: ${process.env.ADO_PERSONAL_ACCESS_TOKEN.substring(0, 3)}***${process.env.ADO_PERSONAL_ACCESS_TOKEN.substring(process.env.ADO_PERSONAL_ACCESS_TOKEN.length - 3)}`);

async function run() {
    try {
        // Get plan name from environment variable first, then fall back to task input
        const planNameFromInput: string = tl.getInput('releasePlanName', true)!;
        const planNameToUse = process.env.TEST_PLAN_NAME || planNameFromInput;
        
        if (!planNameToUse) {
            throw new Error(`Missing required variable: TEST_PLAN_NAME or task input releasePlanName. Please ensure one is set.`);
        }
        
        process.env.TEST_PLAN_NAME = planNameToUse;
        
        const testResultsFile: string = tl.getInput('testResultsFilePath', true)!;
        const testRunName: string = tl.getInput('testRunName', true)!;
        const reportType: string = tl.getInput('reportType', true)!;
        const useTestInfoInput: string = tl.getInput('useTestInfo', true)!;
        const useTestInfo: boolean = useTestInfoInput === 'true' || useTestInfoInput === 'True';
        
        tl.debug(`Processing test results from: ${testResultsFile} to apply in ${planNameToUse} named ${testRunName}`);

        const testSettings = {
            resultFilePath: testResultsFile,
            planName: planNameToUse,
            testRunName: testRunName,
            reportType: reportType,
            useTestInfo: useTestInfo
        }
        console.log('Test Settings:', testSettings);
        tl.debug(`Plan Name from Environment: ${process.env.TEST_PLAN_NAME || 'not set'}`);
        tl.debug(`Plan Name from Input: ${planNameFromInput}`);
        tl.debug(`Final Plan Name Used: ${planNameToUse}`);
        tl.debug(`Test Run Name: ${testRunName}`);
        tl.debug(`Report Type: ${reportType}`);
        tl.debug(`Use Test Info: ${useTestInfo}`);
        tl.debug(`Test Results File Path: ${testResultsFile}`);
        
        try {
            tl.debug('Calling createTestRunByExecution...');
            console.log('📡 Calling library with:', JSON.stringify(testSettings, null, 2));
            await createTestRunByExecution(testSettings);
            tl.setResult(tl.TaskResult.Succeeded, `Test results updated successfully. ${testRunName} created in Test Runs.`);
        } catch (libraryError: any) {
            console.error('❌ Library Error:', libraryError);
            console.error('Error message:', libraryError?.message);
            console.error('Error code:', libraryError?.code);
            
            tl.debug(`Full error object: ${JSON.stringify(libraryError)}`);
            tl.debug(`Error message: ${libraryError?.message}`);
            if (libraryError.response) {
                tl.debug(`API Error Status: ${libraryError.response.status}`);
                tl.debug(`API Error StatusText: ${libraryError.response.statusText}`);
                tl.debug(`API Error Data: ${JSON.stringify(libraryError.response.data)}`);
            }
            throw libraryError;
        }
    } catch (error: any) {
        tl.setResult(tl.TaskResult.Failed, `Failed to update Release Plan: ${error.message}`);
    }
}

run();
