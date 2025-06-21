#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs';
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
    `
╭─────────────────────────────────────╮
│  Welcome to DevDumpling's Profile!  │
│           🥟 Daily Fresh 🥟         │
╰─────────────────────────────────────╯`,
    `
    ___                ___                     
   /   \\   _____   __/   \\ _   _ _ __ ___  _ __
  / /\\ / / _ \\ \\ / /\\ /\\ /| | | | '_ \` _ \\| '_ \\
 / /_/ /|  __/\\ V / /_/ / | |_| | | | | | | |_) |
/___,'   \\___| \\_/ ___,'   \\__,_|_| |_| |_| .__/
                                          |_|   `,
    `
╔══════════════════════════════════════╗
║     🚀 Coding Adventures Daily 🚀    ║
║        Fresh Code, Fresh Ideas       ║
╚══════════════════════════════════════╝`
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

function createMarkdown(content: ProfileContent): string {
  return `# Hi, I'm Dev(on) 👋

*Generated on ${content.date}*

## I'm a Dad, a software dev, and a... well, Dev!

\`\`\`ts
const dev = {
  pronouns: ["they", "them", "he", "him"],
  currentRole: "Principal Engineer @ Amino",
  hobbies: ["Fantasy Books", "RPGs", "Bouldering"],
};
\`\`\`

🚀 nurturing web architecture  
🌳 doing the dad thing  
📖 staying curious

\`\`\`
${content.ascii}
\`\`\`

## 💭 Today's Quote

> ${content.quote}

## Tech I like

### \`langs\`

- JS/TS
- Rust
- Go

### \`frameworks\`

> Lately I'm inspired by [Alex Russell's blog](https://infrequently.org/2024/01/performance-inequality-gap-2024/#the-budget%2C-2024) and am indulging myself in lighter-weight alternatives to React and Next, especially for primarily content-driven apps. Here are some of the frameworks I'm inspired by:

- [Astro](https://astro.build/)
- [Qwik, QwikCity](https://qwik.dev/)
- [Fresh, Preact](https://fresh.deno.dev/)
- [Solid](https://www.solidjs.com/)
- [rwsdk](https://rwsdk.com/)
- [Nuxt](https://nuxt.com/)
- [Enhance](https://enhance.dev/)
- [FAST](https://fast.design/)
- [React, Next](https://nextjs.org/)

### \`tools\`

- [Deno](https://deno.com/)
- [vite](https://vite.dev/)
- [node](https://nodejs.org/)
- [turborepo](https://turbo.build/repo/docs)

## 📊 GitHub Stats

![Dev's GitHub stats](https://github-readme-stats.vercel.app/api?username=devdumpling&show_icons=true&theme=${content.theme})

## Influences

- [John Cleese: A cheerful guide to creativity](https://www.designbetter.co/podcast/john-cleese)
- [Cal Newport: Deep Work](https://www.shortform.com/summary/deep-work-summary-cal-newport)
- [James Clear: Atomic Habits](https://www.quickread.com/book-summary/atomic-habits-97)
- [Bret Victor - Inventing on Principle](https://www.youtube.com/watch?v=PUv66718DII)
- [Alex Russell - All of his blog posts](https://infrequently.org/)
- [Oliver Burkeman: Four Thousand Weeks](https://www.amazon.com/Four-Thousand-Weeks-Management-Mortals/dp/0374159122)

---

*This profile is automatically updated daily. Last update: ${content.date}*
`;
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