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
const azure_test_track_1 = require("@thecollege/azure-test-track");
async function run() {
    try {
        const requiredEnvVars = ['ADO_ORGANIZATION', 'ADO_PROJECT', 'ADO_PERSONAL_ACCESS_TOKEN'];
        const missingEnvVars = [];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                missingEnvVars.push(envVar);
            }
        }
        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}. Please ensure these are set in your pipeline variables.`);
        }
        tl.debug(`Environment variables validated: ADO_ORGANIZATION=${process.env.ADO_ORGANIZATION}`);
        tl.debug(`Environment variables validated: ADO_PROJECT=${process.env.ADO_PROJECT}`);
        const releasePlanName = tl.getInput('releasePlanName', true);
        const testResultsFile = tl.getInput('testResultsFilePath', true);
        const testRunName = tl.getInput('testRunName', true);
        const reportType = tl.getInput('reportType', true);
        const useTestInfoInput = tl.getInput('useTestInfo', true);
        const useTestInfo = useTestInfoInput === 'true' || useTestInfoInput === 'True';
        tl.debug(`Processing test results from: ${testResultsFile} to apply in ${releasePlanName} named ${testRunName}`);
        const testSettings = {
            resultFilePath: testResultsFile,
            planName: releasePlanName,
            testRunName: testRunName,
            reportType: reportType,
            useTestInfo: useTestInfo
        };
        console.log('Test Settings:', testSettings);
        await (0, azure_test_track_1.createTestRunByExecution)(testSettings);
        tl.setResult(tl.TaskResult.Succeeded, `Test results updated successfully. ${testRunName} create in Test Runs.`);
    }
    catch (error) {
        tl.setResult(tl.TaskResult.Failed, `Failed to update Release Plan: ${error.message}`);
    }
}
run();
