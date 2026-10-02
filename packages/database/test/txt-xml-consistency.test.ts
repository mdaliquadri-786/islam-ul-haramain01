/**
 * @file txt-xml-consistency.test.ts
 * @package @islamic/database
 * @description Verifies exact text equivalence between Tanzil TXT and XML representations.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

function unescapeXml(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseXmlTranslations(xmlContent: string): Map<string, string> {
  const map = new Map<string, string>();
  const suraRegex = /<sura\s+index="(\d+)"[^>]*>([\s\S]*?)<\/sura>/g;
  let suraMatch: RegExpExecArray | null;

  while ((suraMatch = suraRegex.exec(xmlContent)) !== null) {
    const sIndex = parseInt(suraMatch[1], 10);
    const ayaRegex = /<aya\s+index="(\d+)"\s+text="([^"]*)"\s*\/>/g;
    let ayaMatch: RegExpExecArray | null;

    while ((ayaMatch = ayaRegex.exec(suraMatch[2])) !== null) {
      const aIndex = parseInt(ayaMatch[1], 10);
      const text = unescapeXml(ayaMatch[2]);
      map.set(`${sIndex}:${aIndex}`, text);
    }
  }

  return map;
}

function parseTxtTranslations(txtContent: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = txtContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const firstPipe = trimmed.indexOf('|');
    if (firstPipe === -1) continue;
    const secondPipe = trimmed.indexOf('|', firstPipe + 1);
    if (secondPipe === -1) continue;

    const s = parseInt(trimmed.slice(0, firstPipe), 10);
    const a = parseInt(trimmed.slice(firstPipe + 1, secondPipe), 10);
    const text = trimmed.slice(secondPipe + 1);

    map.set(`${s}:${a}`, text);
  }

  return map;
}

describe('Tanzil TXT vs XML Source Text Consistency', () => {
  function resolveExisting(relPaths: string[]): string {
    for (const p of relPaths) {
      const resolved = path.resolve(process.cwd(), p);
      if (fs.existsSync(resolved)) return resolved;
    }
    return path.resolve(process.cwd(), relPaths[0]);
  }

  const enXmlPath = resolveExisting(['scratch/en.sahih.xml', '../../scratch/en.sahih.xml']);
  const urXmlPath = resolveExisting(['scratch/ur.jalandhry.xml', '../../scratch/ur.jalandhry.xml']);
  const enTxtPath = resolveExisting([
    'data/quran/translations/en.sahih.txt',
    'packages/database/data/quran/translations/en.sahih.txt'
  ]);
  const urTxtPath = resolveExisting([
    'data/quran/translations/ur.jalandhry.txt',
    'packages/database/data/quran/translations/ur.jalandhry.txt'
  ]);

  it('should prove exact text equivalence between TXT and XML for Saheeh International (en.sahih)', (t) => {
    if (!fs.existsSync(enXmlPath)) {
      t.skip('en.sahih.xml not present in scratch; skipping XML cross-comparison.');
      return;
    }

    const txtContent = fs.readFileSync(enTxtPath, 'utf8');
    const xmlContent = fs.readFileSync(enXmlPath, 'utf8');

    const txtMap = parseTxtTranslations(txtContent);
    const xmlMap = parseXmlTranslations(xmlContent);

    assert.strictEqual(txtMap.size, 6236, 'TXT must have exactly 6,236 Ayahs');
    assert.strictEqual(xmlMap.size, 6236, 'XML must have exactly 6,236 Ayahs');

    let mismatches = 0;
    for (const [key, txtText] of txtMap.entries()) {
      const xmlText = xmlMap.get(key);
      if (txtText !== xmlText) {
        mismatches++;
      }
    }

    assert.strictEqual(mismatches, 0, 'Zero text mismatches between unescaped XML and TXT for en.sahih');
  });

  it('should prove exact text equivalence between TXT and XML for Jalandhari (ur.jalandhry)', (t) => {
    if (!fs.existsSync(urXmlPath)) {
      t.skip('ur.jalandhry.xml not present in scratch; skipping XML cross-comparison.');
      return;
    }

    const txtContent = fs.readFileSync(urTxtPath, 'utf8');
    const xmlContent = fs.readFileSync(urXmlPath, 'utf8');

    const txtMap = parseTxtTranslations(txtContent);
    const xmlMap = parseXmlTranslations(xmlContent);

    assert.strictEqual(txtMap.size, 6236, 'TXT must have exactly 6,236 Ayahs');
    assert.strictEqual(xmlMap.size, 6236, 'XML must have exactly 6,236 Ayahs');

    let mismatches = 0;
    for (const [key, txtText] of txtMap.entries()) {
      const xmlText = xmlMap.get(key);
      if (txtText !== xmlText) {
        mismatches++;
      }
    }

    assert.strictEqual(mismatches, 0, 'Zero text mismatches between unescaped XML and TXT for ur.jalandhry');
  });
});
