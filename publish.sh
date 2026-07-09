#!/bin/bash
# Publish Shivam Traders to YOUR GitHub account
# Run once: chmod +x publish.sh && ./publish.sh

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "  Shivam Traders - Publish to GitHub"
echo "=========================================="

# Step 1: Login to GitHub (opens browser)
if ! gh auth status &>/dev/null; then
  echo ""
  echo "Step 1: Login to GitHub in browser..."
  gh auth login -h github.com -p https -w
fi

echo ""
echo "Logged in as: $(gh api user -q .login)"

# Step 2: Create repo (skip if exists)
REPO_NAME="Shivam-traders"
if gh repo view "subham0036/$REPO_NAME" &>/dev/null; then
  echo "Repo already exists: https://github.com/subham0036/$REPO_NAME"
else
  echo "Creating public repo: $REPO_NAME ..."
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  echo "Done!"
  exit 0
fi

# Step 3: Push if repo already existed
git push -u origin main
echo ""
echo "✅ Published: https://github.com/subham0036/Shivam-traders-"
echo "Send this link to your friend!"
