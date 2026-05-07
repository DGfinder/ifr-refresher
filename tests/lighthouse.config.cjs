module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3101/", "http://localhost:3101/study", "http://localhost:3101/quiz"],
      startServerCommand: "npm run start -- --port 3101",
      startServerReadyPattern: "Ready|started server|Local:",
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.85 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
