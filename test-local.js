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

// Get the actual ADO personal access token from system environment
const adoToken = process.env.ADO_PERSONAL_ACCESS_TOKEN;
if (!adoToken || adoToken === 'get_from_env') {
    console.error('\n❌ ERROR: ADO_PERSONAL_ACCESS_TOKEN environment variable not set in your system!');
    console.error('\nThis is required for local testing. The pipeline will get it from the Variable Group.');
    console.error('\nTo set it, run:');
    console.error('  Windows: setx ADO_PERSONAL_ACCESS_TOKEN "your_pat_token_here"');
    console.error('  Then restart PowerShell');
    console.error('\nOr set it temporarily for this session:');
    console.error('  $env:ADO_PERSONAL_ACCESS_TOKEN = "your_pat_token_here"');
    process.exit(1);
}

// Simulate Azure Pipelines task inputs
process.env.INPUT_RELEASEPLANNAME = process.env.INPUT_RELEASEPLANNAME || 'My Test Plan';
process.env.INPUT_TESTRESULTSFILEPATH = process.env.INPUT_TESTRESULTSFILEPATH || './test-results/results.xml';
process.env.INPUT_TESTRUNNAME = process.env.INPUT_TESTRUNNAME || 'Local Test Run - ' + new Date().toISOString();
process.env.INPUT_REPORTTYPE = process.env.INPUT_REPORTTYPE || 'junit';
process.env.INPUT_USETESTINFO = process.env.INPUT_USETESTINFO || 'true';
// IMPORTANT: Set the actual token as the task input (simulates pipeline passing it)
process.env.INPUT_ADOPERSONALACCESSTOKEN = adoToken;

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
