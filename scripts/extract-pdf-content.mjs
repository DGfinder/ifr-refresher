#!/usr/bin/env node
import { existsSync, mkdirSync } from 'node:fs';
import { delimiter, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { convert } from '@opendataloader/pdf';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultOutputDir = resolve(repoRoot, 'docs/content/extracted');
const defaultInputs = [
  'docs/content/IFR-Cheat-Sheet (1).pdf',
  'docs/content/multipart-ac-64b-02-ac-91-35-and-ac-172-05-radiotelephony-manual-for-flight-operations.pdf',
];
const javaCandidates = [
  'java',
  '/opt/homebrew/opt/openjdk@21/bin/java',
  '/usr/local/opt/openjdk@21/bin/java',
  '/opt/homebrew/opt/openjdk/bin/java',
  '/usr/local/opt/openjdk/bin/java',
];

function printUsage() {
  console.log(`Usage:
  npm run content:extract-pdf
  npm run content:extract-pdf -- --output-dir docs/content/extracted path/to/source.pdf [...]

Converts IFR source PDFs to Markdown + JSON using @opendataloader/pdf.
Java 11+ must be installed because the Node package shells out to the bundled Java CLI.

Defaults:
  output-dir: ${defaultOutputDir}
  inputs:
${defaultInputs.map((input) => `    - ${input}`).join('\n')}
`);
}

function parseArgs(argv) {
  let outputDir = defaultOutputDir;
  const inputs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      return { help: true };
    }
    if (arg === '--output-dir') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--output-dir requires a value');
      }
      outputDir = resolve(repoRoot, value);
      index += 1;
      continue;
    }
    inputs.push(resolve(repoRoot, arg));
  }

  return {
    help: false,
    outputDir,
    inputs: inputs.length > 0 ? inputs : defaultInputs.map((input) => resolve(repoRoot, input)),
  };
}

function parseJavaMajorVersion(versionOutput) {
  const match = versionOutput.match(/version \"(?<version>\d+(?:\.\d+)?)/);
  if (!match?.groups?.version) {
    return null;
  }

  const [first, second] = match.groups.version.split('.').map(Number);
  return first === 1 ? second : first;
}

function prependJavaToPath(javaCommand) {
  if (javaCommand === 'java') {
    return;
  }

  const javaBinDir = dirname(javaCommand);
  const currentPath = process.env.PATH ?? '';
  const pathEntries = currentPath.split(delimiter);
  if (!pathEntries.includes(javaBinDir)) {
    process.env.PATH = [javaBinDir, currentPath].filter(Boolean).join(delimiter);
  }
}

function assertJavaAvailable() {
  const attempts = [];

  for (const javaCommand of javaCandidates) {
    if (javaCommand !== 'java' && !existsSync(javaCommand)) {
      continue;
    }

    const result = spawnSync(javaCommand, ['-version'], { encoding: 'utf8' });
    const detail = result.stderr || result.stdout || 'java -version failed';
    attempts.push(`${javaCommand}: ${detail.trim()}`);

    if (result.status !== 0) {
      continue;
    }

    const majorVersion = parseJavaMajorVersion(detail);
    if (majorVersion !== null && majorVersion >= 11) {
      prependJavaToPath(javaCommand);
      return;
    }
  }

  throw new Error(
    `Java 11+ is required before PDF extraction can run. Install a JDK, then retry.\n${attempts.at(-1) ?? 'No Java runtime found.'}`,
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  assertJavaAvailable();

  for (const input of args.inputs) {
    if (!existsSync(input)) {
      throw new Error(`PDF input not found: ${input}`);
    }
  }

  mkdirSync(args.outputDir, { recursive: true });

  console.log(`Extracting ${args.inputs.length} PDF(s) to ${args.outputDir}`);
  await convert(args.inputs, {
    outputDir: args.outputDir,
    format: 'markdown,json',
    imageOutput: 'off',
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
