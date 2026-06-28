import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Loaded via readFileSync instead of a JSON import assertion for broad
// Node version compatibility (import assertions require Node 18.20+/20.10+
// with varying flag requirements across versions).
const __dirname = dirname(fileURLToPath(import.meta.url));
const gazetteer = JSON.parse(
  readFileSync(join(__dirname, '../data', 'gazetteer.json'), 'utf-8')
);

// Build a flat lookup map: every alias + canonical name (lowercased) -> entry
const lookupMap = new Map();
for (const entry of gazetteer) {
  lookupMap.set(entry.name.toLowerCase(), entry);
  for (const alias of entry.aliases) {
    lookupMap.set(alias.toLowerCase(), entry);
  }
}

// Sort all keys longest-first so multi-word matches (e.g. "south korea")
// are checked before shorter substrings (e.g. "korea") win incorrectly
const sortedKeys = [...lookupMap.keys()].sort((a, b) => b.length - a.length);

function cleanCandidate(str) {
  return str
    .replace(/['â]s\b/gi, '')       // strip possessives
    .replace(/[.,!?;:]+$/g, '')     // strip trailing punctuation
    .trim()
    .toLowerCase();
}

/**
 * Look up a single NER-extracted candidate string directly.
 */
function lookupExact(candidate) {
  const cleaned = cleanCandidate(candidate);
  return lookupMap.get(cleaned) || null;
}

/**
 * Scan raw text for any gazetteer key as a substring match.
 * Used as the fallback pass when NER finds nothing.
 */
function lookupInText(text) {
  const lower = text.toLowerCase();
  for (const key of sortedKeys) {
    // word-boundary check so "iran" doesn't match inside "irani-something-else"
    const pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) {
      return lookupMap.get(key);
    }
  }
  return null;
}

/**
 * Full geo-tag resolution for one article.
 * nerCandidates: array of strings already extracted by compromise's doc.places()
 * rawText: the original headline + description, used as fallback
 */
function resolveLocation(nerCandidates, rawText) {
  for (const candidate of nerCandidates) {
    const hit = lookupExact(candidate);
    if (hit) return { ...hit, matchedVia: 'ner', matchedText: candidate };
  }
  const fallbackHit = lookupInText(rawText);
  if (fallbackHit) return { ...fallbackHit, matchedVia: 'gazetteer-fallback' };
  return null;
}

export { resolveLocation, lookupExact, lookupInText };
