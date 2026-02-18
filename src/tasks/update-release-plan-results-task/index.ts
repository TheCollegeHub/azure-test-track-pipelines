import * as tl from 'azure-pipelines-task-lib/task';

// Set environment variables BEFORE importing the library
// so they are available when devops.js module loads
const adoPersonalAccessTokenInput = tl.getInput('adoPersonalAccessToken', true);
const adoOrganization = process.env.ADO_ORGANIZATION;
const adoProject = process.env.ADO_PROJECT;
const adoPersonalAccessToken = adoPersonalAccessTokenInput || process.env.ADO_PERSONAL_ACCESS_TOKEN || process.env.SECRET_ADO_PERSONAL_ACCESS_TOKEN;
const debug = process.env.DEBUG || 'false'

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
process.env.DEBUG = debug;

import { createTestRunByExecution } from "@thecollege/azure-test-track";

async function run() {
    try {
        tl.debug('=== TASK EXECUTION STARTED ===');
        tl.debug(`ADO_ORGANIZATION: ${process.env.ADO_ORGANIZATION}`);
        tl.debug(`ADO_PROJECT: ${process.env.ADO_PROJECT}`);
        tl.debug(`ADO_PERSONAL_ACCESS_TOKEN: ${process.env.ADO_PERSONAL_ACCESS_TOKEN?.substring(0, 3)}***${process.env.ADO_PERSONAL_ACCESS_TOKEN?.substring((process.env.ADO_PERSONAL_ACCESS_TOKEN?.length || 0) - 3)}`);
        tl.debug(`DEBUG mode: ${process.env.DEBUG}`);

        const releasePlanName: string | undefined = tl.getInput('releasePlanName', false) || undefined;
        const planIdInput: string | undefined = tl.getInput('planId', false) || undefined;
        const planId: number | undefined = planIdInput ? parseInt(planIdInput, 10) : undefined;
        const testResultsFile: string = tl.getInput('testResultsFilePath', true)!;
        const testRunName: string = tl.getInput('testRunName', true)!;
        const reportType: string = tl.getInput('reportType', true)!;
        const useTestInfoInput: string = tl.getInput('useTestInfo', true)!;
        const useTestInfo: boolean = useTestInfoInput === 'true' || useTestInfoInput === 'True';
        const configurationNameInput: string | undefined = tl.getInput('configurationName', false) || undefined;
        
        if (!releasePlanName && !planId) {
            throw new Error('Either releasePlanName or planId must be provided.');
        }
        
        if (planIdInput && isNaN(planId!)) {
            throw new Error(`Invalid planId: "${planIdInput}". Must be a valid number.`);
        }

        let configurationName: string | string[] | undefined = undefined;
        if (configurationNameInput) {
            const configArray = configurationNameInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
            configurationName = configArray.length === 1 ? configArray[0] : configArray;
        }
        
        const planIdentifier = planId || releasePlanName;
        tl.debug(`Processing test results from: ${testResultsFile} to apply in ${planIdentifier} named ${testRunName}`);

        const testSettings: any = {
            resultFilePath: testResultsFile,
            testRunName: testRunName,
            reportType: reportType,
            useTestInfo: useTestInfo
        };
        
        if (planId) {
            testSettings.planId = planId;
        } else if (releasePlanName) {
            testSettings.planName = releasePlanName;
        }
        
        if (configurationName) {
            testSettings.configurationName = configurationName;
        }
        console.log('Test Settings:', testSettings);
        
        try {
            tl.debug('Calling createTestRunByExecution...');
            await createTestRunByExecution(testSettings);
            tl.setResult(tl.TaskResult.Succeeded, `Test results updated successfully. ${testRunName} create in Test Runs.`);
        } catch (libraryError: any) {
            tl.debug(`Full error: ${JSON.stringify(libraryError)}`);
            if (libraryError.response) {
                tl.debug(`API Error Status: ${libraryError.response.status}`);
                tl.debug(`API Error Data: ${JSON.stringify(libraryError.response.data)}`);
            }
            throw libraryError;
        }
    } catch (error: any) {
        tl.setResult(tl.TaskResult.Failed, `Failed to update Release Plan: ${error.message}`);
    }
}

run();
