/**
 * @file cli-seed-duas.ts
 * @package @islamic/database
 * @description CLI script to execute the Duas ingestion pipeline and generate
 *              the production seed file `supabase/seed_duas.sql`.
 */

import * as path from 'node:path';
import { runDuaImportPipeline } from './import-duas.js';

function main() {
  const rootDir = path.resolve(__dirname, '../../../..');
  const outputSqlPath = path.join(rootDir, 'supabase', 'seed_duas.sql');

  console.log('Starting Duas & Adhkar Ingestion Pipeline...');
  console.log(`Target SQL Seed: ${outputSqlPath}`);

  const result = runDuaImportPipeline({
    outputSqlPath
  });

  console.log('\n--- Duas Pipeline Execution Summary ---');
  console.log(`Status:              ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Total Sources:       ${result.totalSources}`);
  console.log(`Total Categories:    ${result.totalCategories}`);
  console.log(`Total Duas:          ${result.totalDuas}`);
  console.log(`Dataset Checksum:    ${result.datasetChecksum}`);
  console.log(`Seed File Size:      ${result.generatedSeedBytes?.toLocaleString()} bytes`);
  console.log('\nExecution Timings:');
  console.log(`  Source Reading:    ${result.timings.sourceReadMs.toFixed(2)} ms`);
  console.log(`  Dataset Validation:${result.timings.validationMs.toFixed(2)} ms`);
  console.log(`  SQL Generation:    ${result.timings.sqlGenerationMs.toFixed(2)} ms`);
  console.log(`  Total Time:        ${result.timings.totalMs.toFixed(2)} ms`);
}

// When invoked directly from CLI
if (process.argv[1]?.endsWith('cli-seed-duas.ts') || process.argv[1]?.endsWith('cli-seed-duas.js') || process.argv[1]?.includes('cli-seed-duas')) {
  main();
}
