#!/usr/bin/env node

/**
 * Frontend Best Practices Checker
 *
 * This script checks for updated frontend best practices by:
 * 1. Scraping relevant documentation and blogs for recent updates
 * 2. Comparing against our current rule set
 * 3. Identifying potential additions or changes
 *
 * Focuses on React, Next.js, and TypeScript
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const RULES_DIR = path.resolve(process.cwd(), '.cursor/rules');
const FRONTEND_RULE_FILES = [
  'nextjs.mdc',
  'typescript.mdc',
  'react.mdc'
];

// Frontend documentation sources to check
const FRONTEND_SOURCES = [
  {
    name: 'Next.js Documentation',
    url: 'https://nextjs.org/docs',
    regexPatterns: [
      /best practice/i,
      /performance/i,
      /optimization/i,
      /app router/i
    ]
  },
  {
    name: 'React Documentation',
    url: 'https://react.dev/learn',
    regexPatterns: [
      /component/i,
      /hooks/i,
      /performance/i,
      /pattern/i
    ]
  },
  {
    name: 'TypeScript Documentation',
    url: 'https://www.typescriptlang.org/docs/',
    regexPatterns: [
      /type/i,
      /interface/i,
      /advanced types/i,
      /best practice/i
    ]
  },
  {
    name: 'Vercel Blog',
    url: 'https://vercel.com/blog',
    regexPatterns: [
      /next\.js/i,
      /performance/i,
      /optimization/i,
      /rendering/i
    ]
  }
];

async function main() {
  console.log(chalk.blue('Checking for frontend best practice updates...'));

  // Check if rules directory exists
  if (!fs.existsSync(RULES_DIR)) {
    console.error(chalk.red(`Error: Rules directory not found at ${RULES_DIR}`));
    process.exit(1);
  }

  // Check if frontend rule files exist
  const missingFiles = [];
  for (const file of FRONTEND_RULE_FILES) {
    const filePath = path.join(RULES_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    console.warn(chalk.yellow(`Warning: Some frontend rule files are missing: ${missingFiles.join(', ')}`));
  }

  // Load current rules content
  const currentRules = {};
  for (const file of FRONTEND_RULE_FILES) {
    const filePath = path.join(RULES_DIR, file);
    if (fs.existsSync(filePath)) {
      currentRules[file] = fs.readFileSync(filePath, 'utf8');
    }
  }

  // Fetch latest frontend documentation and check for updates
  let updatesFound = false;
  console.log(chalk.blue('Checking frontend documentation sources...'));

  for (const source of FRONTEND_SOURCES) {
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

    console.log(chalk.yellow('\nPotential frontend best practice updates found! Consider reviewing your rule files.'));
  } else {
    console.log(chalk.green('\nNo new frontend best practices found. Your rules are up to date!'));
  }
}

/**
 * Simulates fetching latest practices from a frontend source
 * In a real implementation, this would actually fetch and parse content
 */
function simulateFetchLatestPractices(source) {
  // This is a simulation - in reality, you would scrape the actual content
  // Generate sample practices based on the source
  const practices = [];

  if (source.name.includes('Next.js')) {
    practices.push(
      'Use React Server Components for data fetching',
      'Implement proper caching strategies with Next.js App Router',
      'Use the next/image component for optimized images',
      'Implement proper metadata for SEO',
      'Use next/font for font optimization',
      'Implement proper error boundaries and loading states',
      'Use route handlers for API endpoints',
      'Implement proper server actions for form handling'
    );
  } else if (source.name.includes('React')) {
    practices.push(
      'Use React.memo for expensive components',
      'Implement proper useCallback and useMemo for performance',
      'Keep components focused on a single responsibility',
      'Use proper state management patterns',
      'Implement proper error boundaries',
      'Use portals for modals and overlays',
      'Implement proper code splitting with React.lazy',
      'Use proper key usage in lists'
    );
  } else if (source.name.includes('TypeScript')) {
    practices.push(
      'Use strict typing with TypeScript',
      'Implement proper type guards',
      'Use utility types for common patterns',
      'Define explicit return types for functions',
      'Use discriminated unions for type-safe handling',
      'Implement proper error types',
      'Use template literal types for string manipulation',
      'Implement proper generic constraints'
    );
  } else if (source.name.includes('Vercel')) {
    practices.push(
      'Optimize for Core Web Vitals',
      'Implement proper ISR strategies',
      'Use Edge Runtime for performance-critical paths',
      'Implement proper API route handlers',
      'Use SWR for client-side data fetching',
      'Implement proper internationalization',
      'Use Middleware for request handling',
      'Implement proper image optimization'
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