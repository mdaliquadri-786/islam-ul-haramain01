/**
 * @file cli-seed-hadith.ts
 * @package @islamic/database
 * @description Standalone CLI runner with explicit micro-benchmarking for Hadith seed generation.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { runHadithImportPipeline } from './import-hadith.js';

export function runBenchmarkedHadithPipeline(targetSeedPath: string) {
  console.log('=== START HADITH PIPELINE BENCHMARK ===');
  const t0 = performance.now();

  const workspaceRoot = path.resolve(__dirname, '../../../..');
  const dataDir = path.resolve(__dirname, '../../data/hadith');

  console.log('Workspace Root:', workspaceRoot);
  console.log('Data Directory:', dataDir);
  console.log('Target Seed Path:', targetSeedPath);

  const result = runHadithImportPipeline({
    dataDir,
    outputSqlPath: targetSeedPath
  });

  const totalMs = (performance.now() - t0).toFixed(2);

  console.log('\n--- EXECUTION PHASE TIMINGS ---');
  console.log(`Source Read: ${result.timings.sourceReadMs.toFixed(2)} ms`);
  console.log(`Validation: ${result.timings.validationMs.toFixed(2)} ms`);
  console.log(`SQL Generation: ${result.timings.sqlGenerationMs.toFixed(2)} ms`);
  console.log(`Total Pipeline: ${totalMs} ms`);

  console.log('\n--- DATASET INTEGRITY & SUMMARIES ---');
  console.log(`Total Scholars/Authors: ${result.totalScholars}`);
  console.log(`Total Canonical Collections: ${result.totalCollections}`);
  console.log(`Total Books/Chapters: ${result.totalBooks}`);
  console.log(`Total Narrations: ${result.totalNarrations}`);
  console.log(`Total Authenticated Gradings: ${result.totalGradings}`);

  console.log('\n--- PER-COLLECTION DATASET HASHES ---');
  for (const [colId, summary] of Object.entries(result.summaries)) {
    console.log(`Collection: ${colId}`);
    console.log(`  Books: ${summary.totalBooks}`);
    console.log(`  Narrations: ${summary.totalNarrations}`);
    console.log(`  Gradings: ${summary.totalGradings}`);
    console.log(`  Dataset SHA-256: ${summary.datasetChecksum}`);
  }

  const stat = fs.statSync(targetSeedPath);
  console.log(`\nGenerated Seed File Size: ${stat.size} bytes (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log('Result Success: true');
  console.log('=== END HADITH PIPELINE BENCHMARK ===');
}

// When invoked directly from CLI
if (process.argv[1]?.endsWith('cli-seed-hadith.ts') || process.argv[1]?.endsWith('cli-seed-hadith.js')) {
  const defaultPath = path.resolve(process.cwd(), 'supabase/seed_hadith.sql');
  const target = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultPath;
  runBenchmarkedHadithPipeline(target);
}
