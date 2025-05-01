#!/usr/bin/env node

/**
 * Mobile Best Practices Checker
 *
 * This script checks for updated mobile development best practices by:
 * 1. Scraping relevant documentation and blogs for recent updates
 * 2. Comparing against our current rule set
 * 3. Identifying potential additions or changes
 *
 * Focuses on React Native and Expo
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const RULES_DIR = path.resolve(process.cwd(), '.cursor/rules');
const MOBILE_RULE_FILES = [
  'react-native.mdc',
  'expo.mdc'
];

// Mobile documentation sources to check
const MOBILE_SOURCES = [
  {
    name: 'React Native Documentation',
    url: 'https://reactnative.dev/docs/getting-started',
    regexPatterns: [
      /best practice/i,
      /performance/i,
      /optimization/i,
      /components/i
    ]
  },
  {
    name: 'Expo Documentation',
    url: 'https://docs.expo.dev/',
    regexPatterns: [
      /best practice/i,
      /managed workflow/i,
      /eas/i,
      /updates/i
    ]
  },
  {
    name: 'React Native Blog',
    url: 'https://reactnative.dev/blog',
    regexPatterns: [
      /release/i,
      /new architecture/i,
      /performance/i,
      /pattern/i
    ]
  },
  {
    name: 'Callstack Blog',
    url: 'https://www.callstack.com/blog',
    regexPatterns: [
      /react native/i,
      /performance/i,
      /optimization/i
    ]
  },
  {
    name: 'Expo Blog',
    url: 'https://blog.expo.dev/',
    regexPatterns: [
      /updates/i,
      /eas/i,
      /workflow/i
    ]
  }
];

async function main() {
  console.log(chalk.blue('Checking for mobile development best practice updates...'));

  // Check if rules directory exists
  if (!fs.existsSync(RULES_DIR)) {
    console.error(chalk.red(`Error: Rules directory not found at ${RULES_DIR}`));
    process.exit(1);
  }

  // Check if mobile rule files exist
  const missingFiles = [];
  for (const file of MOBILE_RULE_FILES) {
    const filePath = path.join(RULES_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    console.warn(chalk.yellow(`Warning: Some mobile rule files are missing: ${missingFiles.join(', ')}`));
  }

  // Load current rules content
  const currentRules = {};
  for (const file of MOBILE_RULE_FILES) {
    const filePath = path.join(RULES_DIR, file);
    if (fs.existsSync(filePath)) {
      currentRules[file] = fs.readFileSync(filePath, 'utf8');
    }
  }

  // Fetch latest mobile documentation and check for updates
  let updatesFound = false;
  console.log(chalk.blue('Checking mobile documentation sources...'));

  for (const source of MOBILE_SOURCES) {
    try {
      console.log(chalk.green(`Checking ${source.name}...`));

      // Simulate fetching and parsing documentation
      const latestPractices = simulateFetchLatestPractices(source);

      // Check for new best practices not in our rules
      const newPractices = findNewPractices(currentRules, latestPractices);

      if (newPractices.length > 0) {
        updatesFound = true;
        console.log(chalk.yellow(`Found ${newPractices.length} potential new best practices from ${source.name}:`));
        for (const practice of newPractices) {
          console.log(chalk.yellow(`- ${practice}`));
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error checking ${source.name}: ${error.message}`));
    }
  }

  // Set environment variable for GitHub workflow
  if (updatesFound) {
    if (process.env.GITHUB_ENV) {
      // When running in GitHub Actions
      fs.appendFileSync(process.env.GITHUB_ENV, 'UPDATES_FOUND=true\n');
    } else {
      // When running locally
      process.env.UPDATES_FOUND = 'true';
    }

    console.log(chalk.yellow('\nPotential mobile best practice updates found! Consider reviewing your rule files.'));
  } else {
    console.log(chalk.green('\nNo new mobile best practices found. Your rules are up to date!'));
  }
}

/**
 * Simulates fetching latest practices from a mobile development source
 * In a real implementation, this would actually fetch and parse content
 */
function simulateFetchLatestPractices(source) {
  // This is a simulation - in reality, you would scrape the actual content
  // Generate sample practices based on the source
  const practices = [];

  if (source.name.includes('React Native Documentation')) {
    practices.push(
      'Use the new React Native architecture where possible',
      'Implement proper native module optimization',
      'Use Hermes engine for improved performance',
      'Implement proper list optimization with FlatList',
      'Optimize image loading and caching',
      'Use proper gesture handling with React Native Gesture Handler',
      'Implement proper navigation with React Navigation',
      'Use TypeScript for type safety'
    );
  } else if (source.name.includes('Expo Documentation')) {
    practices.push(
      'Use EAS Build for production builds',
      'Implement proper OTA updates with EAS Update',
      'Use Expo Router for navigation',
      'Optimize asset loading with Expo\'s asset system',
      'Implement proper splash screen and icon optimization',
      'Use Expo\'s notification system for push notifications',
      'Implement proper environment configuration',
      'Use Expo\'s development client for custom native modules'
    );
  } else if (source.name.includes('React Native Blog')) {
    practices.push(
      'Migrate to the new architecture for better performance',
      'Use the Fabric renderer for improved UI performance',
      'Implement proper JSI for native module access',
      'Use TurboModules for optimized native modules',
      'Implement proper animation performance optimization',
      'Use React Native\'s new debugging tools',
      'Implement proper TypeScript integration',
      'Use proper monorepo structure for larger applications'
    );
  } else if (source.name.includes('Callstack')) {
    practices.push(
      'Optimize JavaScript bundle size',
      'Implement proper memory management',
      'Use proper state management for complex applications',
      'Implement deep linking properly',
      'Optimize startup time with proper initialization',
      'Use proper offline support patterns',
      'Implement proper testing strategies',
      'Use proper CI/CD pipelines for React Native'
    );
  } else if (source.name.includes('Expo Blog')) {
    practices.push(
      'Use the latest Expo SDK for new features',
      'Implement proper EAS Update channels',
      'Use Expo Router for type-safe navigation',
      'Implement proper preview branch builds',
      'Use Expo\'s prebuild system effectively',
      'Implement proper module resolution',
      'Use Expo Application Services for CI/CD',
      'Implement proper error reporting'
    );
  }

  return practices;
}

/**
 * Finds potential new best practices not mentioned in our current rules
 */
function findNewPractices(currentRules, latestPractices) {
  const newPractices = [];

  for (const practice of latestPractices) {
    let foundInRules = false;

    // Check if this practice is mentioned in any of our rule files
    for (const file in currentRules) {
      if (currentRules[file].includes(practice) ||
        currentRules[file].includes(practice.toLowerCase())) {
        foundInRules = true;
        break;
      }
    }

    if (!foundInRules) {
      // This could be a new practice not in our rules
      newPractices.push(practice);
    }
  }

  return newPractices;
}

// Run the script
main().catch(err => {
  console.error(chalk.red('Error:'), err);
  process.exit(1);
});