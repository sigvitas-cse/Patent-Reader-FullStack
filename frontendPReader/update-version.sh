#!/bin/bash
VERSION=$(node -p "require('./package.json').version")
echo "export const APP_VERSION = '$VERSION';" > src/version.js