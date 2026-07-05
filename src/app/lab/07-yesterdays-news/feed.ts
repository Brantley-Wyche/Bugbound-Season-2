import { getHeadlines, type Headline } from './store';

// The wire read goes through a feed cache so the front page stays cheap even
// when traffic spikes.
let feedCache: Headline[] | null = null;

export async function getWireFeed(): Promise<Headline[]> {
  if (!feedCache) {
    feedCache = getHeadlines();
  }
  return feedCache;
}
