#!/usr/bin/env bash
# Run tests in watch mode.
# Usage: ./test.sh

cd "$(dirname "$0")/frontend" && npm run test:watch
