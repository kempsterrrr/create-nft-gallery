#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('create-nft-gallery')
  .description('Create a new NFT gallery application for Arweave Name System (ArNS) domains')
  .argument('[project-name]', 'Name of the project')
  .option('--domain <ar-domain>', 'Specify ArNS domain')
  .option('--variant <variant>', 'Specify the variant to use (e.g., manifold)')
  .action(async (projectName, options) => {
    try {
      // Get project name and variant
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project named?',
          default: projectName || 'nft-gallery',
          when: !projectName
        },
        {
          type: 'list',
          name: 'variant',
          message: 'Which variant would you like to use?',
          choices: ['manifold', 'metaplex'], // Added metaplex as an option
          default: options.variant || 'manifold'
        }
      ]);

      const finalProjectName = projectName || answers.projectName;
      const variant = answers.variant;

      // Get ArNS domain
      const domainAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'domain',
          message: 'What is your ArNS domain?',
          default: options.domain || 'mygallery'
        }
      ]);

      const finalDomain = domainAnswer.domain;

      // Create project directory
      const projectPath = path.join(process.cwd(), finalProjectName);
      await fs.ensureDir(projectPath);

      // Copy base template files
      const baseTemplatePath = path.join(__dirname, '..', 'templates', 'base');
      await fs.copy(baseTemplatePath, projectPath);

      // Overlay variant files
      const variantTemplatePath = path.join(__dirname, '..', 'templates', 'variants', variant);
      await fs.copy(variantTemplatePath, projectPath, { overwrite: true });

      // Merge package.json files
      const basePackageJson = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json.ejs'), 'utf-8'));
      
      // Check if variant has a package.json
      let variantPackageJson = { dependencies: {}, devDependencies: {}, scripts: {} };
      const variantPackageJsonPath = path.join(variantTemplatePath, 'package.json.ejs');
      if (await fs.pathExists(variantPackageJsonPath)) {
        variantPackageJson = JSON.parse(await fs.readFile(variantPackageJsonPath, 'utf-8'));
      }
      
      // Merge dependencies while preserving scripts and other fields
      const mergedPackageJson = {
        name: basePackageJson.name,
        version: basePackageJson.version,
        private: basePackageJson.private,
        type: basePackageJson.type,
        scripts: {
          ...basePackageJson.scripts,
          ...variantPackageJson.scripts
        },
        dependencies: {
          ...basePackageJson.dependencies,
          ...variantPackageJson.dependencies
        },
        devDependencies: {
          ...basePackageJson.devDependencies,
          ...variantPackageJson.devDependencies
        }
      };

      // Write merged package.json
      await fs.writeFile(
        path.join(projectPath, 'package.json.ejs'),
        JSON.stringify(mergedPackageJson, null, 2)
      );

      // Get environment variables
      const envAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'NFT_CONTRACT_ADDRESS',
          message: 'Enter your NFT contract address (optional):',
          default: ''
        },
        {
          type: 'input',
          name: 'RPC_ENDPOINT',
          message: 'Enter your RPC endpoint URL (optional):',
          default: ''
        }
      ]);

      // Create .env file
      const envContent = `# Environment variables for ${finalProjectName}
ARNS_NAME=${finalDomain}
NFT_CONTRACT_ADDRESS=${envAnswers.NFT_CONTRACT_ADDRESS}
RPC_ENDPOINT=${envAnswers.RPC_ENDPOINT}
DEPLOY_KEY="a base64 of your arweave wallet key"
`;
      await fs.writeFile(path.join(projectPath, '.env'), envContent);

      // Process template files
      const templateFiles = await fs.readdir(projectPath, { recursive: true });
      for (const file of templateFiles) {
        if (file.endsWith('.ejs')) {
          const filePath = path.join(projectPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const rendered = ejs.render(content, {
            name: finalProjectName,
            domain: finalDomain,
            includeManifold: variant === 'manifold',
            ARNS_NAME: finalDomain,
            ...envAnswers
          });
          // Preserve the original file extension when removing .ejs
          const newFilePath = filePath.replace(/\.ejs$/, '');
          await fs.writeFile(newFilePath, rendered);
          await fs.remove(filePath);
        }
      }

      // Install dependencies
      console.log('\nInstalling dependencies...');
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' });

      // Initialize git repository
      try {
        execSync('git init', { cwd: projectPath });
        execSync('git add .', { cwd: projectPath });
        execSync('git commit -m "Initial commit"', { cwd: projectPath });
      } catch (error) {
        console.log('Git initialization skipped');
      }

      console.log(`\n🎉 Created ${finalProjectName} as an NFT gallery on ${finalDomain} using the ${variant} variant`);
      console.log('\nNext steps:');
      console.log(`  cd ${finalProjectName}`);
      console.log('  npm run dev');

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse(); 