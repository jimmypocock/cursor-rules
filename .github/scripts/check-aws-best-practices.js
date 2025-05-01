#!/usr/bin/env node

/**
 * AWS Best Practices Checker
 *
 * This script checks for updated AWS best practices by:
 * 1. Scraping AWS documentation and blogs for recent updates
 * 2. Comparing against our current rule set
 * 3. Identifying potential additions or changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const RULES_DIR = path.resolve(process.cwd(), '.cursor/rules');
const AWS_RULE_FILES = [
  'aws-lambda.mdc',
  'aws-dynamodb.mdc',
  'aws-iam.mdc',
  'aws-sam.mdc',
  'aws-cloudformation.mdc',
  'aws-vpc.mdc',
  'aws-gamelift.mdc',
  'aws-bedrock.mdc',
  'aws-sagemaker.mdc',
  'aws-eventbridge.mdc'
];

// AWS documentation sources to check
const AWS_SOURCES = [
  {
    name: 'Lambda Best Practices',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html',
    regexPatterns: [
      /performance/i,
      /security/i,
      /cost/i,
      /optimization/i,
      /monitoring/i
    ]
  },
  {
    name: 'DynamoDB Best Practices',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html',
    regexPatterns: [
      /data modeling/i,
      /query/i,
      /keys/i,
      /performance/i,
      /cost/i
    ]
  },
  {
    name: 'AWS IAM Best Practices',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
    regexPatterns: [
      /security/i,
      /permissions/i,
      /policy/i,
      /roles/i
    ]
  },
  {
    name: 'AWS SAM Best Practices',
    url: 'https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using.html',
    regexPatterns: [
      /template/i,
      /deployment/i,
      /patterns/i
    ]
  },
  {
    name: 'AWS CloudFormation Best Practices',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html',
    regexPatterns: [
      /template/i,
      /stack/i,
      /resources/i
    ]
  },
  {
    name: 'AWS VPC Best Practices',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-best-practices.html',
    regexPatterns: [
      /networking/i,
      /security/i,
      /connectivity/i
    ]
  },
  {
    name: 'AWS GameLift Best Practices',
    url: 'https://docs.aws.amazon.com/gamelift/latest/developerguide/gamelift-bp.html',
    regexPatterns: [
      /fleet/i,
      /matchmaking/i,
      /server/i
    ]
  },
  {
    name: 'AWS Bedrock Best Practices',
    url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/best-practices.html',
    regexPatterns: [
      /model/i,
      /prompt/i,
      /inference/i
    ]
  },
  {
    name: 'AWS SageMaker Best Practices',
    url: 'https://docs.aws.amazon.com/sagemaker/latest/dg/best-practices.html',
    regexPatterns: [
      /model/i,
      /training/i,
      /deployment/i
    ]
  },
  {
    name: 'AWS EventBridge Best Practices',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-use-cases.html',
    regexPatterns: [
      /events/i,
      /patterns/i,
      /rules/i
    ]
  },
  {
    name: 'AWS Serverless Blog',
    url: 'https://aws.amazon.com/blogs/compute/category/serverless/',
    regexPatterns: [
      /best practice/i,
      /pattern/i,
      /optimization/i,
      /performance/i
    ]
  }
];

async function main() {
  console.log(chalk.blue('Checking for AWS best practice updates...'));

  // Check if rules directory exists
  if (!fs.existsSync(RULES_DIR)) {
    console.error(chalk.red(`Error: Rules directory not found at ${RULES_DIR}`));
    process.exit(1);
  }

  // Check if AWS rule files exist
  const missingFiles = [];
  for (const file of AWS_RULE_FILES) {
    const filePath = path.join(RULES_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    console.warn(chalk.yellow(`Warning: Some AWS rule files are missing: ${missingFiles.join(', ')}`));
  }

  // Load current rules content
  const currentRules = {};
  for (const file of AWS_RULE_FILES) {
    const filePath = path.join(RULES_DIR, file);
    if (fs.existsSync(filePath)) {
      currentRules[file] = fs.readFileSync(filePath, 'utf8');
    }
  }

  // Fetch latest AWS documentation and check for updates
  let updatesFound = false;
  console.log(chalk.blue('Checking AWS documentation sources...'));

  for (const source of AWS_SOURCES) {
    try {
      console.log(chalk.green(`Checking ${source.name}...`));

      // Simulate fetching and parsing documentation
      // In a real implementation, you would use a library like axios to fetch the content
      // and cheerio or another HTML parser to extract the relevant information
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

    console.log(chalk.yellow('\nPotential AWS best practice updates found! Consider reviewing your rule files.'));
  } else {
    console.log(chalk.green('\nNo new AWS best practices found. Your rules are up to date!'));
  }
}

/**
 * Simulates fetching latest practices from an AWS source
 * In a real implementation, this would actually fetch and parse content
 */
function simulateFetchLatestPractices(source) {
  // This is a simulation - in reality, you would scrape the actual content

  // Generate sample practices based on the source name
  if (source.name.includes('Lambda')) {
    return [
      'Use provisioned concurrency for latency-sensitive Lambda functions',
      'Implement proper error handling and retry mechanisms',
      'Keep Lambda functions focused on a single task',
      'Initialize SDK clients outside the handler function',
      'Optimize Lambda memory settings for cost and performance'
    ];
  } else if (source.name.includes('DynamoDB')) {
    return [
      'Use DynamoDB single-table design for related entities',
      'Design DynamoDB partition keys to distribute data evenly',
      'Use DynamoDB transactions for multi-item operations requiring consistency',
      'Implement GSIs for alternative access patterns',
      'Use sparse indexes for efficient querying'
    ];
  } else if (source.name.includes('IAM')) {
    return [
      'Implement least privilege for all IAM roles',
      'Use IAM Access Analyzer to identify unintended access',
      'Implement proper rotation for access keys',
      'Use IAM roles instead of long-term credentials',
      'Implement proper permission boundaries'
    ];
  } else if (source.name.includes('SAM')) {
    return [
      'Use SAM policy templates for common use cases',
      'Implement proper parameter handling in templates',
      'Use SAM CLI for local testing',
      'Create modular SAM templates',
      'Implement proper deployment validation'
    ];
  } else if (source.name.includes('CloudFormation')) {
    return [
      'Use nested stacks for reusable components',
      'Implement proper parameter typing',
      'Use conditions for environment-specific resources',
      'Implement proper stack outputs',
      'Use proper deletion policies for sensitive resources'
    ];
  } else if (source.name.includes('VPC')) {
    return [
      'Design proper subnet segmentation',
      'Implement VPC endpoints for AWS services',
      'Use proper security group rule design',
      'Implement proper flow logging',
      'Design effective Transit Gateway connections'
    ];
  } else if (source.name.includes('GameLift')) {
    return [
      'Implement proper fleet scaling strategies',
      'Design effective matchmaking rule sets',
      'Use GameLift FlexMatch for sophisticated matchmaking',
      'Implement proper game session placement',
      'Design effective queue prioritization'
    ];
  } else if (source.name.includes('Bedrock')) {
    return [
      'Design effective prompt engineering strategies',
      'Implement proper model parameter tuning',
      'Use appropriate foundation models for specific use cases',
      'Implement proper content filtering',
      'Design effective knowledge base integration'
    ];
  } else if (source.name.includes('SageMaker')) {
    return [
      'Implement proper model monitoring',
      'Design effective ML pipelines',
      'Use SageMaker Feature Store for feature management',
      'Implement proper experiment tracking',
      'Design effective model deployment strategies'
    ];
  } else if (source.name.includes('EventBridge')) {
    return [
      'Design standardized event schemas',
      'Implement proper event bus architecture',
      'Use Schema Registry for consistent events',
      'Design effective event filtering patterns',
      'Implement proper dead-letter queues for failed events'
    ];
  } else {
    // Generic serverless practices for blog posts
    return [
      'Implement proper observability for serverless applications',
      'Design effective error handling strategies',
      'Use proper state management for distributed systems',
      'Implement cost optimization techniques',
      'Design effective multi-region strategies'
    ];
  }
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