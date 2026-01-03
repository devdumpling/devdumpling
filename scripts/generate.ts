#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Daily Profile Generator
 * Generates markdown content for both GitHub profile and web app
 * Uses date-based content and GitHub contribution stats
 */

interface GitHubStats {
  currentStreak: number;
  thisWeek: number;
  yearTotal: number;
}

interface ProfileContent {
  date: string;
  dayGreeting: string;
  seasonalMessage: string;
  specialDate: string | null;
  stats: GitHubStats | null;
}

// ============================================================================
// Date-based Content Generation
// ============================================================================

function getCurrentDateUTC(): Date {
  return new Date();
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDayOfWeek(date: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getUTCDay()];
}

function getSeason(date: Date): "winter" | "spring" | "summer" | "fall" {
  const month = date.getUTCMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

function getDayGreeting(date: Date): string {
  const greetings: Record<string, string> = {
    Monday: "Starting the week with fresh code",
    Tuesday: "Building momentum",
    Wednesday: "Midweek milestones",
    Thursday: "Pushing through to Friday",
    Friday: "Finishing strong",
    Saturday: "Weekend projects",
    Sunday: "Resting and planning ahead",
  };
  return greetings[getDayOfWeek(date)];
}

function getSeasonalPrefix(season: string): string {
  const prefixes: Record<string, string> = {
    winter: "Winter coding",
    spring: "Spring coding",
    summer: "Summer coding",
    fall: "Fall coding",
  };
  return prefixes[season];
}

function getSpecialDate(date: Date): string | null {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const mmdd = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

  const specialDates: Record<string, string> = {
    "01-01": "Happy New Year!",
    "02-14": "Happy Valentine's Day",
    "03-14": "Happy Pi Day! 3.14159...",
    "04-01": "April Fools - trust no code today",
    "05-04": "May the Fourth be with you",
    "07-04": "Happy Independence Day",
    "10-31": "Happy Halloween",
    "12-25": "Merry Christmas",
    "12-31": "Happy New Year's Eve!",
  };

  return specialDates[mmdd] || null;
}

function generateDateContent(date: Date): {
  dayGreeting: string;
  seasonalMessage: string;
  specialDate: string | null;
} {
  const season = getSeason(date);
  return {
    dayGreeting: getDayGreeting(date),
    seasonalMessage: getSeasonalPrefix(season),
    specialDate: getSpecialDate(date),
  };
}

// ============================================================================
// GitHub Stats Integration
// ============================================================================

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: ContributionDay[];
          }>;
        };
      };
    };
  };
}

async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not available, skipping stats");
    return null;
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as GraphQLResponse;
    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      console.error("Could not fetch contribution calendar");
      return null;
    }

    // Flatten all contribution days
    const allDays = calendar.weeks.flatMap((w) => w.contributionDays);

    // Calculate current streak
    const currentStreak = calculateCurrentStreak(allDays);

    // Calculate this week's contributions (last 7 days)
    const thisWeek = allDays
      .slice(-7)
      .reduce((sum, d) => sum + d.contributionCount, 0);

    return {
      currentStreak,
      thisWeek,
      yearTotal: calendar.totalContributions,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub stats:", error);
    return null;
  }
}

function calculateCurrentStreak(days: ContributionDay[]): number {
  // Sort by date descending (most recent first)
  const sortedDays = [...days].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;

  // Skip today if it has no contributions yet (day isn't over)
  const today = new Date().toISOString().split("T")[0];
  let startIndex = 0;
  if (sortedDays[0]?.date === today && sortedDays[0]?.contributionCount === 0) {
    startIndex = 1;
  }

  // Count consecutive days with contributions
  for (let i = startIndex; i < sortedDays.length; i++) {
    if (sortedDays[i].contributionCount > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function formatStats(stats: GitHubStats): string {
  return `| Stat | Value |
|------|-------|
| Current Streak | ${stats.currentStreak} days |
| This Week | ${stats.thisWeek} contributions |
| Year Total | ${stats.yearTotal} contributions |`;
}

// ============================================================================
// Content Generation
// ============================================================================

async function generateProfileContent(): Promise<ProfileContent> {
  const date = getCurrentDateUTC();
  const dateContent = generateDateContent(date);
  const stats = await fetchGitHubStats("devdumpling");

  return {
    date: formatDate(date),
    ...dateContent,
    stats,
  };
}

function createDailyContent(content: ProfileContent): string {
  const parts: string[] = [];

  // Day greeting with seasonal context
  parts.push(`*${content.seasonalMessage} | ${content.dayGreeting}*`);

  // Special date message if applicable
  if (content.specialDate) {
    parts.push("");
    parts.push(`> ${content.specialDate}`);
  }

  // GitHub stats
  if (content.stats) {
    parts.push("");
    parts.push(formatStats(content.stats));
  }

  parts.push("");
  parts.push("---");

  return parts.join("\n");
}

// ============================================================================
// File Operations
// ============================================================================

function loadBaseTemplate(): string {
  const templatePath = join(process.cwd(), "docs", "base.md");
  return readFileSync(templatePath, "utf8");
}

function createMarkdown(content: ProfileContent): string {
  const baseTemplate = loadBaseTemplate();
  const dailyContent = createDailyContent(content);
  return baseTemplate
    .replace("{{DAILY_CONTENT}}", dailyContent)
    .replace("{{TIMESTAMP}}", `*Auto-updated daily | ${content.date}*`);
}

function ensureDirectoryExists(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function writeToHistory(content: string, date: string): void {
  const historyDir = join(process.cwd(), "history");
  ensureDirectoryExists(historyDir);

  const historyFile = join(historyDir, `${date}.md`);
  writeFileSync(historyFile, content, "utf8");
  console.log(`Archived to history: ${historyFile}`);
}

function writeReadme(content: string): void {
  const readmePath = join(process.cwd(), "README.md");
  writeFileSync(readmePath, content, "utf8");
  console.log(`Generated README.md`);
}

function writeContentFile(content: string): void {
  const contentDir = join(process.cwd(), "content");
  ensureDirectoryExists(contentDir);

  const contentFile = join(contentDir, "profile.md");
  writeFileSync(contentFile, content, "utf8");
  console.log(`Generated content/profile.md for Astro site`);
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log("Starting daily profile generation...");

  const content = await generateProfileContent();
  const markdown = createMarkdown(content);

  // Write to all target locations
  writeReadme(markdown);
  writeContentFile(markdown);
  writeToHistory(markdown, content.date);

  console.log(`Profile generation complete for ${content.date}!`);
}

// Run if called directly
main().catch(console.error);
