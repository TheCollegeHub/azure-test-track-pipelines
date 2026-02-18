"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tl = __importStar(require("azure-pipelines-task-lib/task"));
// Set environment variables BEFORE importing the library
// so they are available when devops.js module loads
const adoPersonalAccessTokenInput = tl.getInput('adoPersonalAccessToken', true);
const adoOrganization = process.env.ADO_ORGANIZATION;
const adoProject = process.env.ADO_PROJECT;
const adoPersonalAccessToken = adoPersonalAccessTokenInput || process.env.ADO_PERSONAL_ACCESS_TOKEN || process.env.SECRET_ADO_PERSONAL_ACCESS_TOKEN;
const debug = process.env.DEBUG || 'false';
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
const azure_test_track_1 = require("@thecollege/azure-test-track");
async function run() {
    try {
        tl.debug('=== TASK EXECUTION STARTED ===');
        tl.debug(`ADO_ORGANIZATION: ${process.env.ADO_ORGANIZATION}`);
        tl.debug(`ADO_PROJECT: ${process.env.ADO_PROJECT}`);
        tl.debug(`ADO_PERSONAL_ACCESS_TOKEN: ${process.env.ADO_PERSONAL_ACCESS_TOKEN?.substring(0, 3)}***${process.env.ADO_PERSONAL_ACCESS_TOKEN?.substring((process.env.ADO_PERSONAL_ACCESS_TOKEN?.length || 0) - 3)}`);
        tl.debug(`DEBUG mode: ${process.env.DEBUG}`);
        const releasePlanName = tl.getInput('releasePlanName', false) || undefined;
        const planIdInput = tl.getInput('planId', false) || undefined;
        const planId = planIdInput ? parseInt(planIdInput, 10) : undefined;
        const testResultsFile = tl.getInput('testResultsFilePath', true);
        const testRunName = tl.getInput('testRunName', true);
        const reportType = tl.getInput('reportType', true);
        const useTestInfoInput = tl.getInput('useTestInfo', true);
        const useTestInfo = useTestInfoInput === 'true' || useTestInfoInput === 'True';
        const configurationNameInput = tl.getInput('configurationName', false) || undefined;
        if (!releasePlanName && !planId) {
            throw new Error('Either releasePlanName or planId must be provided.');
        }
        if (planIdInput && isNaN(planId)) {
            throw new Error(`Invalid planId: "${planIdInput}". Must be a valid number.`);
        }
        let configurationName = undefined;
        if (configurationNameInput) {
            const configArray = configurationNameInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
            configurationName = configArray.length === 1 ? configArray[0] : configArray;
        }
        const planIdentifier = planId || releasePlanName;
        tl.debug(`Processing test results from: ${testResultsFile} to apply in ${planIdentifier} named ${testRunName}`);
        const testSettings = {
            resultFilePath: testResultsFile,
            testRunName: testRunName,
            reportType: reportType,
            useTestInfo: useTestInfo
        };
        if (planId) {
            testSettings.planId = planId;
        }
        else if (releasePlanName) {
            testSettings.planName = releasePlanName;
        }
        if (configurationName) {
            testSettings.configurationName = configurationName;
        }
        console.log('Test Settings:', testSettings);
        try {
            tl.debug('Calling createTestRunByExecution...');
            await (0, azure_test_track_1.createTestRunByExecution)(testSettings);
            tl.setResult(tl.TaskResult.Succeeded, `Test results updated successfully. ${testRunName} create in Test Runs.`);
        }
        catch (libraryError) {
            tl.debug(`Full error: ${JSON.stringify(libraryError)}`);
            if (libraryError.response) {
                tl.debug(`API Error Status: ${libraryError.response.status}`);
                tl.debug(`API Error Data: ${JSON.stringify(libraryError.response.data)}`);
            }
            throw libraryError;
        }
    }
    catch (error) {
        tl.setResult(tl.TaskResult.Failed, `Failed to update Release Plan: ${error.message}`);
    }
}
run();
