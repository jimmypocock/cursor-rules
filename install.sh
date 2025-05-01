#!/usr/bin/env bash

# Cursor Rules Installation Script
# This script installs the standardized cursor rules into your project

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo -e "${RED}Error: git is not installed${NC}"
  exit 1
fi

# Default repository URL
REPO_URL="https://github.com/jimmypocock/cursor-rules.git"

# Parse command line arguments
CUSTOM_REPO=false
TARGET_DIR="$(pwd)"
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --repo) REPO_URL="$2"; CUSTOM_REPO=true; shift ;;
    --target) TARGET_DIR="$2"; shift ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --repo URL     Specify a custom repository URL (default: $REPO_URL)"
      echo "  --target DIR   Specify target directory (default: current directory)"
      echo "  --help         Show this help message"
      exit 0
      ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

# Create temporary directory for cloning
TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}Cloning cursor rules repository...${NC}"

# Clone the repository to temp directory
if ! git clone "$REPO_URL" "$TEMP_DIR"; then
  echo -e "${RED}Failed to clone repository${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Create .cursor directory if it doesn't exist
if [ ! -d "$TARGET_DIR/.cursor" ]; then
  mkdir -p "$TARGET_DIR/.cursor"
fi

# Create rules directory if it doesn't exist
if [ ! -d "$TARGET_DIR/.cursor/rules" ]; then
  mkdir -p "$TARGET_DIR/.cursor/rules"
fi

# Copy rules files to the target project
echo -e "${GREEN}Installing cursor rules...${NC}"
cp -r "$TEMP_DIR/.cursor/rules/"* "$TARGET_DIR/.cursor/rules/"

# Check if the project has a package.json file
if [ -f "$TARGET_DIR/package.json" ]; then
  # Check project type to determine which rules to use
  HAS_NEXTJS=$(grep -i "next" "$TARGET_DIR/package.json" || echo "")
  HAS_REACT_NATIVE=$(grep -i "react-native" "$TARGET_DIR/package.json" || echo "")
  HAS_AWS_SDK=$(grep -i "aws-sdk" "$TARGET_DIR/package.json" || echo "")
  HAS_DYNAMODB=$(grep -i "dynamodb" "$TARGET_DIR/package.json" || echo "")

  echo -e "${GREEN}Detected project dependencies:${NC}"
  if [ ! -z "$HAS_NEXTJS" ]; then
    echo -e "- ${YELLOW}Next.js${NC}"
  fi
  if [ ! -z "$HAS_REACT_NATIVE" ]; then
    echo -e "- ${YELLOW}React Native${NC}"
  fi
  if [ ! -z "$HAS_AWS_SDK" ]; then
    echo -e "- ${YELLOW}AWS SDK${NC}"
  fi
  if [ ! -z "$HAS_DYNAMODB" ]; then
    echo -e "- ${YELLOW}DynamoDB${NC}"
  fi
fi

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo -e "${GREEN}Installation complete!${NC}"
echo -e "Cursor rules have been installed to ${YELLOW}$TARGET_DIR/.cursor/rules/${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Open your project in Cursor IDE"
echo "2. Cursor will automatically detect and use these rules"
echo "3. Customize the rules in .cursor/rules/ to match your project's specific needs"
echo ""
echo -e "${GREEN}Happy coding!${NC}"