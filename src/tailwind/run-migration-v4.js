#!/usr/bin/env node

/**
 * Tailwind CSS v4 Migration Runner
 * 
 * This script automatically updates Tailwind CSS v3 classes to their v4 equivalents
 * throughout the codebase.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMigratedClass } from './migration-v4.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const srcDir = path.join(projectRoot, 'src');

// Extensions we'll process
const extensions = ['.tsx', '.jsx', '.ts', '.js'];

// Count of changes made
let changesCount = 0;
let filesChanged = 0;

/**
 * Updates Tailwind classes in a given file content
 */
function updateFileContent(content) {
  // Find all class attributes in the content
  const classRegex = /className\s*=\s*["']([^"']+)["']/g;
  let match;
  let updated = content;
  let fileChanged = false;
  
  while ((match = classRegex.exec(content)) !== null) {
    const [fullMatch, classesStr] = match;
    const classes = classesStr.split(/\s+/);
    
    const updatedClasses = classes.map(cls => {
      const migration = getMigratedClass(cls);
      if (migration) {
        changesCount++;
        console.log(`  - Replacing ${migration.original} → ${migration.updated}`);
        return migration.updated;
      }
      return cls;
    });
    
    const updatedClassesStr = updatedClasses.join(' ');
    if (updatedClassesStr !== classesStr) {
      fileChanged = true;
      // Replace only this specific class attribute instance
      updated = updated.replace(
        fullMatch,
        `className="${updatedClassesStr}"`
      );
    }
  }
  
  return { content: updated, changed: fileChanged };
}

/**
 * Process all files recursively in a directory
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other specific directories
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && !entry.name.startsWith('.')) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      console.log(`Processing ${fullPath}`);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const { content: updatedContent, changed } = updateFileContent(content);
      
      if (changed) {
        filesChanged++;
        fs.writeFileSync(fullPath, updatedContent);
        console.log(`✅ Updated ${fullPath}`);
      }
    }
  }
}

// Run the migration
console.log('Starting Tailwind CSS v4 migration...');
processDirectory(srcDir);
console.log(`\nMigration complete!`);
console.log(`Made ${changesCount} class replacements in ${filesChanged} files.`);
