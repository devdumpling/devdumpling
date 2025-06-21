#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Daily Profile Generator
 * Generates markdown content for both GitHub profile and web app
 */

interface ProfileContent {
  date: string;
  ascii: string;
  quote: string;
  theme: string;
}

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

function generateASCIIArt(): string {
  const asciiArts = [
    `dev(on) • daily fresh 🥟`,
    `[ dev • dad • dumpling ]`,
    `~ coding adventures daily ~`
  ];
  
  return asciiArts[Math.floor(Math.random() * asciiArts.length)];
}

function generateQuote(): string {
  const quotes = [
    "Code is like humor. When you have to explain it, it's bad. — Cory House",
    "The best error message is the one that never shows up. — Thomas Fuchs",
    "Experience is the name everyone gives to their mistakes. — Oscar Wilde",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
    "First, solve the problem. Then, write the code. — John Johnson",
    "Debugging is twice as hard as writing the code in the first place. — Brian Kernighan",
    "The only way to learn a new programming language is by writing programs in it. — Dennis Ritchie"
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function generateTheme(): string {
  const themes = ['minimal', 'tech', 'creative', 'professional'];
  return themes[Math.floor(Math.random() * themes.length)];
}

function generateProfileContent(): ProfileContent {
  return {
    date: getCurrentDate(),
    ascii: generateASCIIArt(),
    quote: generateQuote(),
    theme: generateTheme()
  };
}

function loadBaseTemplate(): string {
  const templatePath = join(process.cwd(), 'docs', 'base.md');
  return readFileSync(templatePath, 'utf8');
}

function createDailyContent(content: ProfileContent): string {
  return `*${content.ascii}*

> ${content.quote}

*Auto-updated daily • ${content.date}*

---`;
}

function createMarkdown(content: ProfileContent): string {
  const baseTemplate = loadBaseTemplate();
  const dailyContent = createDailyContent(content);
  
  return baseTemplate.replace('{{DAILY_CONTENT}}', dailyContent);
}

function ensureDirectoryExists(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function writeToHistory(content: string, date: string): void {
  const historyDir = join(process.cwd(), 'history');
  ensureDirectoryExists(historyDir);
  
  const historyFile = join(historyDir, `${date}.md`);
  writeFileSync(historyFile, content, 'utf8');
  console.log(`📁 Archived to history: ${historyFile}`);
}

function writeReadme(content: string): void {
  const readmePath = join(process.cwd(), 'README.md');
  writeFileSync(readmePath, content, 'utf8');
  console.log(`📝 Generated README.md`);
}

function writeContentFile(content: string): void {
  const contentDir = join(process.cwd(), 'content');
  ensureDirectoryExists(contentDir);
  
  const contentFile = join(contentDir, 'profile.md');
  writeFileSync(contentFile, content, 'utf8');
  console.log(`📄 Generated content/profile.md for Astro site`);
}

function main(): void {
  console.log('🥟 Starting daily profile generation...');
  
  const content = generateProfileContent();
  const markdown = createMarkdown(content);
  
  // Write to all target locations
  writeReadme(markdown);
  writeContentFile(markdown);
  writeToHistory(markdown, content.date);
  
  console.log(`✅ Profile generation complete for ${content.date}!`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}