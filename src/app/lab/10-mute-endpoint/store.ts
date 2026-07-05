interface FeedbackStore {
  praise: number;
  gripes: number;
}

const g = globalThis as unknown as { __s2Feedback?: FeedbackStore };
if (!g.__s2Feedback) {
  g.__s2Feedback = { praise: 12, gripes: 4 };
}
const store = g.__s2Feedback;

export function getStats() {
  return {
    praise: store.praise,
    gripes: store.gripes,
    total: store.praise + store.gripes,
  };
}

export function addFeedback(kind: 'praise' | 'gripe') {
  if (kind === 'praise') store.praise += 1;
  else store.gripes += 1;
  return getStats();
}
