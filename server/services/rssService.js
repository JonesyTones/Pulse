import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import nlp from 'compromise';
import { resolveLocation } from './geoTagger.js';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// Strip HTML tags left over in RSS descriptions
function stripHtml(str) {
  return str ? String(str).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

// Derive a volume score (0–100) from pubDate recency — newer = higher
function recencyVolume(pubDateStr) {
  const ageMs = Date.now() - new Date(pubDateStr).getTime();
  const ageHours = ageMs / 3_600_000;
  // Linear decay: 0h = 95, 24h = 20
  return Math.max(20, Math.min(95, Math.round(95 - (ageHours / 24) * 75)));
}

// Granularity inferred from resolved location type
function typeToGranularity(locationType) {
  if (locationType === 'continent') return 'continent';
  if (locationType === 'city' || locationType === 'landmark') return 'region';
  return 'country';
}

/**
 * Factory that returns an async fetch function for a given RSS feed.
 * The returned function is called by poller.js on each 60-second cycle.
 */
export function createRssSource({ feedUrl, sourceKey }) {
  return async function fetchRss() {
    const response = await axios.get(feedUrl, {
      timeout: 10_000,
      headers: { 'User-Agent': 'PULSE-intelligence-platform/1.0' },
      responseType: 'text',
    });

    const parsed = parser.parse(response.data);
    const channel = parsed?.rss?.channel ?? parsed?.feed ?? {};
    const rawItems = channel.item ?? channel.entry ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    const normalized = [];

    for (const item of items) {
      const title       = stripHtml(item.title ?? '');
      const description = stripHtml(item.description ?? item.summary ?? item['media:description'] ?? '');
      const rawText     = `${title} ${description}`;
      const link        = item.link?.['#text'] ?? item.link ?? item.guid?.['#text'] ?? item.guid ?? '';
      const pubDate     = item.pubDate ?? item.updated ?? item.published ?? new Date().toISOString();

      if (!title) continue;

      // NER pass: extract place candidates via compromise
      const doc = nlp(rawText);
      const nerCandidates = doc.places().json().map((p) => p.text);

      const location = resolveLocation(nerCandidates, rawText);

      // Items with no location still flow through — they appear in feeds
      // but have no lat/lng so MapContainer won't render a pin for them
      const base = {
        id:          `${sourceKey}-${Date.now()}-${normalized.length}`,
        source:      sourceKey,
        topic:       title.length > 80 ? title.slice(0, 77) + '...' : title,
        region:      '',
        volume:      recencyVolume(pubDate),
        granularity: location ? typeToGranularity(location.type) : 'country',
        timestamp:   new Date(pubDate).toISOString(),
        url:         String(link),
        metadata: {
          description: description.slice(0, 300),
        },
      };

      if (location) {
        base.lat    = location.lat;
        base.lng    = location.lng;
        base.region = location.name;
        base.metadata.matchedVia = location.matchedVia;
      }

      normalized.push(base);
    }

    return normalized;
  };
}
