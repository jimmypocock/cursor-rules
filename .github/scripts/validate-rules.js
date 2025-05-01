#!/usr/bin/env node

/**
 * Cursor Rules Validator
 *
 * This script validates that cursor rule files follow the expected format and structure.
 * It checks:
 * - Proper MDC format with frontmatter
 * - Valid globs pattern
 * - Required sections
 * - References to other rule files
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');
const chalk = require('chalk');

// Configuration
const RULES_DIR = path.resolve(process.cwd(), '.cursor/rules');
const REQUIRED_SECTIONS = ['Description', 'Globs'];

// Main validation function
async function validateRules() {
  console.log(chalk.blue('Validating Cursor rules...'));

  // Check if rules directory exists
  if (!fs.existsSync(RULES_DIR)) {
    console.error(chalk.red(`Error: Rules directory not found at ${RULES_DIR}`));
    process.exit(1);
  }

  // Find all MDC files
  const ruleFiles = globSync('**/*.mdc', { cwd: RULES_DIR });

  if (ruleFiles.length === 0) {
    console.warn(chalk.yellow('Warning: No rule files found'));
    process.exit(0);
  }

  console.log(chalk.green(`Found ${ruleFiles.length} rule files`));

  let hasErrors = false;
  const validFiles = [];
  const allRules = new Map();

  // First pass: collect all rules
  for (const file of ruleFiles) {
    const filePath = path.join(RULES_DIR, file);
    allRules.set(file, { path: filePath });
  }

  // Second pass: validate each rule file
  for (const file of ruleFiles) {
    const filePath = path.join(RULES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const result = validateRuleFile(file, content, allRules);

    if (result.valid) {
      validFiles.push(file);
      console.log(chalk.green(`✓ ${file}`));
    } else {
      hasErrors = true;
      console.error(chalk.red(`✗ ${file}`));
      for (const error of result.errors) {
        console.error(chalk.red(`  - ${error}`));
      }
    }
  }

  // Summary
  console.log('\n' + chalk.blue('Validation Summary:'));
  console.log(chalk.green(`✓ ${validFiles.length} valid files`));
  console.log(chalk.red(`✗ ${ruleFiles.length - validFiles.length} files with errors`));

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log(chalk.green('\nAll rules are valid!'));
  }
}

/**
 * Validates a single rule file
 */
function validateRuleFile(filename, content, allRules) {
  const errors = [];

  // Check if file has frontmatter
  if (!content.startsWith('---')) {
    errors.push('File does not start with frontmatter (---)')
  }

  // Check if frontmatter ends properly
  if (!content.includes('\n---\n')) {
    errors.push('Frontmatter is not properly closed (missing --- line)');
  }

  // Extract frontmatter
  let frontmatter = '';
  if (content.startsWith('---')) {
    const endOfFrontmatter = content.indexOf('\n---\n', 3);
    if (endOfFrontmatter !== -1) {
      frontmatter = content.substring(3, endOfFrontmatter).trim();
    }
  }

  // Check required frontmatter sections
  for (const section of REQUIRED_SECTIONS) {
    if (!frontmatter.includes(`${section}:`)) {
      errors.push(`Missing required frontmatter section: ${section}`);
    }
  }

  // Check for valid globs
  const globsMatch = frontmatter.match(/Globs:\s*(.+)(\n|$)/);
  if (globsMatch) {
    const globs = globsMatch[1].trim();
    if (!globs || globs === '') {
      errors.push('Globs section is empty');
    }
  }

  // Check references to other rule files
  const references = content.match(/@[\w-]+\.mdc/g) || [];
  for (const ref of references) {
    const referencedFile = ref.substring(1); // Remove @ symbol
    if (!allRules.has(referencedFile)) {
      errors.push(`References non-existent rule file: ${referencedFile}`);
    }
  }

  // Check for basic content sections
  const mainContent = content.split('\n---\n')[1] || '';
  if (!mainContent.includes('#')) {
    errors.push('Missing header sections (no # found)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Run validation
validateRules().catch(err => {
  console.error(chalk.red('Error during validation:'), err);
  process.exit(1);
});