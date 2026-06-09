import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const FEATURES = [
  "drill",
  "flashcards",
  "home",
  "programs",
  "progress",
  "quiz",
  "study",
];

const barrelBoundaryMessage = (feature) =>
  `Cross-feature deep imports are forbidden. Import from "@/features/${feature}" (the barrel) only. See docs/architecture/project-structure.md.`;

const perFeatureRules = FEATURES.map((feature) => ({
  files: [`src/features/${feature}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: FEATURES.filter((other) => other !== feature).map(
          (other) => ({
            group: [`@/features/${other}/*`, `@/features/${other}/*/**`],
            message: barrelBoundaryMessage(other),
          })
        ),
      },
    ],
  },
}));

const outsideFeaturesRule = {
  files: ["src/**/*.{ts,tsx}"],
  ignores: FEATURES.map((f) => `src/features/${f}/**`),
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: FEATURES.map((feature) => ({
          group: [`@/features/${feature}/*`, `@/features/${feature}/*/**`],
          message: barrelBoundaryMessage(feature),
        })),
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...perFeatureRules,
  outsideFeaturesRule,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore generated service worker
    "public/**",
  ]),
]);

export default eslintConfig;
