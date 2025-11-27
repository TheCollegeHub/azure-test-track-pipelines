import * as tl from 'azure-pipelines-task-lib/task';
import { createTestRunByExecution } from "@thecollege/azure-test-track";

async function run() {
    try {
        const releasePlanName: string = tl.getInput('releasePlanName', true)!;
        const testResultsFile: string = tl.getInput('testResultsFilePath', true)!;
        const testRunName: string = tl.getInput('testRunName', true)!;
        const reportType: string = tl.getInput('reportType', true)!;
        const useTestInfo: string = tl.getInput('useTestInfo', true)!;
        
        tl.debug(`Processing test results from: ${testResultsFile} to apply in ${releasePlanName} named ${testRunName}`);

        const testSettings = {
            resultFilePath: testResultsFile,
            planName: releasePlanName,
            testRunName: testRunName,
            reportType: reportType,
            useTestInfo: useTestInfo
        }

        await createTestRunByExecution(testSettings);
       
        tl.setResult(tl.TaskResult.Succeeded, `Test results updated successfully. ${testRunName} create in Test Runs.`);
    } catch (error: any) {
        tl.setResult(tl.TaskResult.Failed, `Failed to update Release Plan: ${error.message}`);
    }
}

run();
