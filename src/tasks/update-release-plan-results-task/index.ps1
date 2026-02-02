[CmdletBinding()]
param()

# Get the directory of this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Run the Node.js script
& node "$scriptDir\index.js"
