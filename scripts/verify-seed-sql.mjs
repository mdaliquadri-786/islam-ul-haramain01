import fs from 'node:fs';
import path from 'node:path';

const seedPath = path.resolve('supabase/seed_quran_translations.sql');
console.log('Inspecting seed file:', seedPath);

if (!fs.existsSync(seedPath)) {
  console.error('Seed file does not exist!');
  process.exit(1);
}

const content = fs.readFileSync(seedPath, 'utf8');
console.log('Seed file size:', content.length, 'bytes');

// Check header and transactional bounds
if (!content.startsWith('-- Seed: seed_quran_translations.sql')) {
  console.error('Seed file missing expected header!');
  process.exit(1);
}

if (!content.includes('BEGIN;') || !content.trim().endsWith('COMMIT;')) {
  console.error('Seed file missing valid transactional boundaries (BEGIN / COMMIT)!');
  process.exit(1);
}

// Count translation edition inserts
const editionInserts = (content.match(/INSERT INTO public\.quran_translation_editions/g) || []).length;
console.log('quran_translation_editions INSERT count:', editionInserts);

// Count translated ayah rows
const enRows = (content.match(/\('en\.sahih',/g) || []).length;
const urRows = (content.match(/\('ur\.jalandhry',/g) || []).length;
console.log('en.sahih inserted rows:', enRows);
console.log('ur.jalandhry inserted rows:', urRows);

// Check audit event
const hasAuditEvent = content.includes("p_action := 'QURAN_TRANSLATION_INGEST'");
console.log('Audit event record present:', hasAuditEvent);

// Verify exact row counts
if (enRows !== 6236 || urRows !== 6236) {
  console.error(`Row count mismatch! Expected 6236 each, got en: ${enRows}, ur: ${urRows}`);
  process.exit(1);
}

console.log('SUCCESS: Generated seed file is 100% complete and structurally sound.');
