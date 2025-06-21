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

function parseAIContent(aiContent: string): { ascii: string; quote: string } {
  const lines = aiContent.split('\n');
  let ascii = '';
  let quote = '';
  
  for (const line of lines) {
    if (line.startsWith('ASCII_ART:')) {
      ascii = line.replace('ASCII_ART:', '').trim();
    } else if (line.startsWith('QUOTE:')) {
      quote = line.replace('QUOTE:', '').trim();
    }
  }
  
  return { ascii, quote };
}

function generateASCIIArt(): string {
  // Check if AI-generated content is available
  const aiContent = process.env.AI_GENERATED_CONTENT;
  if (aiContent) {
    const { ascii } = parseAIContent(aiContent);
    if (ascii) return ascii;
  }
  
  // Fallback to hardcoded options
  const asciiArts = [
    `dev(on) • daily fresh 🥟`,
    `[ dev • dad • dumpling ]`,
    `~ coding adventures daily ~`
  ];
  
  return asciiArts[Math.floor(Math.random() * asciiArts.length)];
}

function generateQuote(): string {
  // Check if AI-generated content is available
  const aiContent = process.env.AI_GENERATED_CONTENT;
  if (aiContent) {
    const { quote } = parseAIContent(aiContent);
    if (quote) return quote;
  }
  
  // Fallback fantasy quotes
  const quotes = [
    "All we have to decide is what to do with the time that is given us. — Gandalf, The Fellowship of the Ring",
    "The most important step a man can take. It's not the first one, is it? It's the next one. — Dalinar, Oathbringer",
    "It's the questions we can't answer that teach us the most. They teach us how to think. — Patrick Rothfuss, The Wise Man's Fear",
    "Even the smallest person can change the course of the future. — Galadriel, The Fellowship of the Ring",
    "Life before death, strength before weakness, journey before destination. — The First Ideal, The Way of Kings"
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