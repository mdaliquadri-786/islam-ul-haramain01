import fs from 'node:fs';
import path from 'node:path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.next', '.puro', '.git', 'build', '.dart_tool'].includes(file)) {
        results = results.concat(getFiles(full));
      }
    } else if (/\.(ts|tsx|js|mjs|dart|sql)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

const files = [...getFiles('apps'), ...getFiles('packages'), ...getFiles('supabase')];
console.log(`Total source/schema files inspected: ${files.length}`);

// 1. SQL Injection audit: Look for raw string concat into queries
let rawSqlIssues = [];
for (const f of files) {
  if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')) {
    const content = fs.readFileSync(f, 'utf8');
    if (/\.query\s*\(\s*`[^`]*\$\{/.test(content) || /\.execute\s*\(\s*`[^`]*\$\{/.test(content)) {
      rawSqlIssues.push(f);
    }
  }
}
console.log(`Raw SQL concatenation issues: ${rawSqlIssues.length}`);

// 2. Secret exposure audit
const secretPatterns = [
  /AIza[0-9A-Za-z-_]{35}/, // Google API Key
  /ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, // JWT
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /sk_live_[0-9a-zA-Z]{24}/,
  /ghp_[0-9a-zA-Z]{36}/
];

let secretIssues = [];
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  for (const pat of secretPatterns) {
    if (pat.test(content) && !f.includes('test') && !f.includes('example')) {
      secretIssues.push({ file: f, pattern: pat.toString() });
    }
  }
}
console.log(`Hardcoded production secret patterns detected: ${secretIssues.length}`);

// 3. Open Redirects audit
let redirectIssues = [];
for (const f of files) {
  if (f.includes('route.ts') || f.includes('page.tsx')) {
    const content = fs.readFileSync(f, 'utf8');
    if (/redirect\s*\(\s*(req|request|searchParams)/.test(content)) {
      redirectIssues.push(f);
    }
  }
}
console.log(`Unvalidated open redirects detected: ${redirectIssues.length}`);

// 4. SSRF audit: outbound fetch calls
let outboundFetches = [];
for (const f of files) {
  if (f.includes('apps/web/src') && (f.endsWith('.ts') || f.endsWith('.tsx'))) {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/fetch\s*\([^)]+\)/g);
    if (matches) {
      for (const m of matches) {
        // filter out internal api fetches or static urls
        if (!m.includes('/api/') && !m.includes('http://localhost') && !m.includes('process.env')) {
          outboundFetches.push({ file: f, call: m });
        }
      }
    }
  }
}
console.log(`Dynamic external outbound fetch calls: ${outboundFetches.length}`);
