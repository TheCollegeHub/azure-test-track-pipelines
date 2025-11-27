/**
 * Local test script for the Update Release Plan Results Task
 * 
 * This script simulates the Azure DevOps task environment locally.
 * 
 * Usage:
 * 1. Create a .env file with required environment variables
 * 2. Run: node test-local.js
 */

require('dotenv').config();

// Simulate Azure Pipelines task inputs
process.env.INPUT_RELEASEPLANNAME = process.env.INPUT_RELEASEPLANNAME || 'My Test Plan';
process.env.INPUT_TESTRESULTSFILEPATH = process.env.INPUT_TESTRESULTSFILEPATH || './test-results/results.xml';
process.env.INPUT_TESTRUNNAME = process.env.INPUT_TESTRUNNAME || 'Local Test Run - ' + new Date().toISOString();
process.env.INPUT_REPORTTYPE = process.env.INPUT_REPORTTYPE || 'junit';
process.env.INPUT_USETESTINFO = process.env.INPUT_USETESTINFO || 'true';

// Optional: Simulate BUILD_BUILDID if you want to associate with a build
// process.env.BUILD_BUILDID = '12345';

console.log('=================================');
console.log('Local Test Configuration');
console.log('=================================');
console.log('Organization:', process.env.ADO_ORGANIZATION);
console.log('Project:', process.env.ADO_PROJECT);
console.log('Release Plan:', process.env.INPUT_RELEASEPLANNAME);
console.log('Test Results File:', process.env.INPUT_TESTRESULTSFILEPATH);
console.log('Test Run Name:', process.env.INPUT_TESTRUNNAME);
console.log('Report Type:', process.env.INPUT_REPORTTYPE);
console.log('Use Test Info:', process.env.INPUT_USETESTINFO);
console.log('=================================\n');

// Run the task
require('./src/tasks/update-release-plan-results-task/index.js');
