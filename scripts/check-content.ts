import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// Stub Fase 0. Di Fase 2 ini jadi validator skema zod + daftar `status: draft`
// dari src/content/*.yaml (lihat docs/PLAN.md bagian "Alur kerja konten").

const ROOT = resolve(process.cwd());
const CONTENT_DIR = resolve(ROOT, 'src/content');

function listYamlFiles(dir: string): string[] {
  let found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      found = found.concat(listYamlFiles(full));
    } else if (/\.ya?ml$/i.test(entry)) {
      found.push(full);
    }
  }
  return found;
}

function countDrafts(files: string[]): number {
  let count = 0;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    // Fase 0: deteksi naif, cukup untuk reporting.
    const matches = text.match(/^\s*status:\s*draft\b/gm);
    if (matches) count += matches.length;
  }
  return count;
}

try {
  const files = listYamlFiles(CONTENT_DIR);
  const drafts = countDrafts(files);
  console.log(`check:content — ${files.length} YAML file(s), ${drafts} draft entry(ies)`);
  if (files.length === 0) {
    console.log('  (Fase 0: belum ada konten manasik; skema zod dibuat di Fase 2.)');
  } else {
    for (const file of files) {
      console.log(`  - ${relative(ROOT, file)}`);
    }
  }
} catch (err) {
  if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
    console.log('check:content — folder src/content/ belum ada.');
    process.exit(0);
  }
  throw err;
}
