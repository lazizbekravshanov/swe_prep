/**
 * System prompt for system design interview mode.
 * Replaces the coding interview prompt when round type is 'system_design'.
 */

export interface SystemDesignProblem {
  title: string;
  description: string;
  scope_questions: string[];
  key_components: string[];
  scaling_challenges: string[];
  estimated_traffic: string;
  rubric: {
    requirements_gathering: string;
    high_level_design: string;
    detailed_design: string;
    scalability: string;
    trade_offs: string;
  };
}

export const SYSTEM_DESIGN_PROBLEMS: SystemDesignProblem[] = [
  {
    title: 'Design a URL Shortener',
    description: 'Design a service like bit.ly that takes long URLs and creates short aliases.',
    scope_questions: ['How many URLs per day?', 'How long should short URLs be?', 'Do URLs expire?', 'Should we track click analytics?'],
    key_components: ['URL generation service', 'Key-value store', 'Redirect service', 'Analytics pipeline'],
    scaling_challenges: ['Handling billions of redirects', 'Ensuring unique short codes', 'Geographic distribution'],
    estimated_traffic: '100M new URLs/day, 10B redirects/day',
    rubric: { requirements_gathering: 'Asks about read/write ratio, URL length, expiration', high_level_design: 'Load balancer → App server → Cache → DB', detailed_design: 'Base62 encoding, hash collision handling, database sharding', scalability: 'Cache layer, CDN for redirects, DB partitioning', trade_offs: 'Consistency vs availability for analytics' },
  },
  {
    title: 'Design a Chat System',
    description: 'Design a real-time messaging system like WhatsApp or Slack.',
    scope_questions: ['1-on-1 or group chats?', 'How many concurrent users?', 'Message history retention?', 'File sharing?'],
    key_components: ['WebSocket gateway', 'Message queue', 'User presence service', 'Message storage', 'Push notification service'],
    scaling_challenges: ['Millions of concurrent WebSocket connections', 'Message ordering guarantees', 'Offline message delivery'],
    estimated_traffic: '500M DAU, 50B messages/day',
    rubric: { requirements_gathering: 'Asks about group size, media support, read receipts', high_level_design: 'WebSocket server → Message broker → Storage', detailed_design: 'Message ID generation, fan-out on write vs read, group message delivery', scalability: 'Connection pooling, horizontal scaling of WS servers', trade_offs: 'Delivery guarantees vs latency' },
  },
  {
    title: 'Design a News Feed',
    description: 'Design a social media news feed like Facebook or Twitter.',
    scope_questions: ['How many users?', 'Real-time or near-real-time?', 'Ranking algorithm?', 'Media content?'],
    key_components: ['Feed generation service', 'Fan-out service', 'Ranking engine', 'Content cache', 'Media storage'],
    scaling_challenges: ['Celebrity problem (millions of followers)', 'Feed ranking latency', 'Content freshness'],
    estimated_traffic: '1B DAU, 10K posts/second',
    rubric: { requirements_gathering: 'Asks about follow graph, content types, ranking', high_level_design: 'Post service → Fan-out → Feed cache → Client', detailed_design: 'Fan-out on write vs read, hybrid approach for celebrities', scalability: 'Sharded feed cache, async fan-out', trade_offs: 'Fan-out on write (fast reads) vs on read (less storage)' },
  },
  {
    title: 'Design a Video Streaming Service',
    description: 'Design a platform like YouTube or Netflix for video upload and streaming.',
    scope_questions: ['Upload or stream only?', 'Live streaming?', 'How many concurrent viewers?', 'Video quality options?'],
    key_components: ['Video upload pipeline', 'Transcoding service', 'CDN', 'Recommendation engine', 'Metadata service'],
    scaling_challenges: ['Transcoding at scale', 'Global CDN distribution', 'Adaptive bitrate streaming'],
    estimated_traffic: '1B DAU, 500 hours uploaded per minute',
    rubric: { requirements_gathering: 'Asks about upload vs consume ratio, resolution, DRM', high_level_design: 'Upload → Transcode → CDN → Client', detailed_design: 'Chunk-based upload, DAG transcoding pipeline, HLS/DASH', scalability: 'CDN edge caching, parallel transcoding', trade_offs: 'Storage cost vs transcoding on-the-fly' },
  },
  {
    title: 'Design a Ride-Sharing Service',
    description: 'Design a platform like Uber or Lyft for matching riders with drivers.',
    scope_questions: ['Coverage area?', 'Real-time matching?', 'Surge pricing?', 'Ride pooling?'],
    key_components: ['Location service', 'Matching engine', 'Pricing service', 'Trip management', 'Payment system'],
    scaling_challenges: ['Real-time geospatial queries', 'Dynamic pricing under load', 'Driver-rider matching optimization'],
    estimated_traffic: '50M DAU, 15M rides/day',
    rubric: { requirements_gathering: 'Asks about geographic scope, ETA requirements, payment', high_level_design: 'Client → API → Matching → Location → Pricing', detailed_design: 'Geohashing for location, supply-demand matching algorithm', scalability: 'Regional sharding, location index partitioning', trade_offs: 'Match quality vs match speed' },
  },
  {
    title: 'Design a Rate Limiter',
    description: 'Design a distributed rate limiting system for an API gateway.',
    scope_questions: ['Per-user or per-IP?', 'Fixed window or sliding window?', 'Distributed or single-node?', 'Hard or soft limits?'],
    key_components: ['Rate limit rules engine', 'Counter store (Redis)', 'API gateway integration', 'Monitoring dashboard'],
    scaling_challenges: ['Distributed counting accuracy', 'Race conditions', 'Handling burst traffic'],
    estimated_traffic: '10M requests/second across 1000 API servers',
    rubric: { requirements_gathering: 'Asks about limit granularity, window type, response behavior', high_level_design: 'API Gateway → Rate Limiter → Redis → Backend', detailed_design: 'Token bucket vs sliding window log vs fixed window counter', scalability: 'Redis cluster, local caching with sync', trade_offs: 'Accuracy vs performance, memory vs precision' },
  },
  {
    title: 'Design a Search Engine',
    description: 'Design a web search engine like Google.',
    scope_questions: ['Web search or site search?', 'Real-time indexing?', 'Personalization?', 'Autocomplete?'],
    key_components: ['Web crawler', 'Indexer', 'Ranking engine', 'Query processor', 'Autocomplete service'],
    scaling_challenges: ['Indexing billions of pages', 'Sub-second query latency', 'Relevance ranking'],
    estimated_traffic: '8.5B searches/day',
    rubric: { requirements_gathering: 'Asks about index size, freshness, query types', high_level_design: 'Crawler → Indexer → Inverted Index → Query Engine', detailed_design: 'Inverted index structure, PageRank, TF-IDF', scalability: 'Sharded index, MapReduce for indexing', trade_offs: 'Index freshness vs crawl cost' },
  },
  {
    title: 'Design a Notification System',
    description: 'Design a multi-channel notification system (push, email, SMS, in-app).',
    scope_questions: ['Which channels?', 'Real-time or batched?', 'User preferences?', 'Rate limiting per user?'],
    key_components: ['Notification service', 'Message queue', 'Channel adapters', 'Preference store', 'Template engine'],
    scaling_challenges: ['Millions of notifications per second', 'Delivery guarantees', 'User preference management'],
    estimated_traffic: '10B notifications/day across 4 channels',
    rubric: { requirements_gathering: 'Asks about delivery guarantees, preference management', high_level_design: 'Event → Queue → Dispatcher → Channel Adapters', detailed_design: 'Priority queues, deduplication, retry logic', scalability: 'Per-channel worker pools, backpressure handling', trade_offs: 'Delivery speed vs delivery guarantee' },
  },
  {
    title: 'Design a Distributed Cache',
    description: 'Design a distributed caching system like Redis or Memcached.',
    scope_questions: ['Cache eviction policy?', 'Consistency requirements?', 'Data types?', 'Cluster size?'],
    key_components: ['Cache nodes', 'Consistent hashing ring', 'Replication manager', 'Client library', 'Health monitor'],
    scaling_challenges: ['Hot key problem', 'Cache stampede', 'Node failure handling'],
    estimated_traffic: '10M reads/second, 1M writes/second',
    rubric: { requirements_gathering: 'Asks about consistency model, eviction, persistence', high_level_design: 'Client → Consistent hash → Cache nodes → Replication', detailed_design: 'Consistent hashing, LRU eviction, write-behind caching', scalability: 'Virtual nodes, replication factor tuning', trade_offs: 'Consistency vs availability during partition' },
  },
  {
    title: 'Design an E-Commerce Platform',
    description: 'Design a large-scale e-commerce platform like Amazon.',
    scope_questions: ['Product catalog size?', 'Peak traffic (Black Friday)?', 'Payment processing?', 'Inventory management?'],
    key_components: ['Product catalog', 'Search service', 'Cart service', 'Order service', 'Payment gateway', 'Inventory manager'],
    scaling_challenges: ['Flash sale handling', 'Inventory consistency', 'Payment reliability'],
    estimated_traffic: '500M products, 100K orders/minute peak',
    rubric: { requirements_gathering: 'Asks about scale, payment methods, shipping', high_level_design: 'Microservices: catalog, cart, order, payment, shipping', detailed_design: 'Saga pattern for distributed transactions, event sourcing for orders', scalability: 'Database per service, CQRS for read-heavy catalog', trade_offs: 'Strong consistency for payments vs eventual for catalog' },
  },
];

export function buildSystemDesignPrompt(params: {
  problem: SystemDesignProblem;
  company?: string;
  candidateLevel?: string;
}): string {
  const { problem, company, candidateLevel = 'mid' } = params;

  return `You are Alex, a senior engineer conducting a system design interview.${company ? ` You work at ${company}.` : ''}

## SYSTEM DESIGN MODE

There is NO code editor. The candidate has a whiteboard/diagram canvas. You CANNOT see their diagram — ask them to describe what they've drawn.

## THE PROBLEM

${problem.title}: ${problem.description}

Estimated traffic: ${problem.estimated_traffic}

## INTERVIEW PROTOCOL (45 minutes)

### Phase 1 — Requirements (5 min)
Present the problem. Let the candidate ask clarifying questions:
${problem.scope_questions.map((q) => `- ${q}`).join('\n')}
Don't answer all at once — let them drive.

### Phase 2 — High-Level Design (10 min)
"Can you draw the main components and how they interact?"
Expected components: ${problem.key_components.join(', ')}
Ask them to walk you through the data flow.

### Phase 3 — Deep Dive (15 min)
Pick 1-2 components to dive into:
"How would you design the ${problem.key_components[0]} in detail?"
"What database would you use and why?"
"Walk me through what happens when a user does X."

### Phase 4 — Scaling (10 min)
${problem.scaling_challenges.map((c) => `- "How would you handle: ${c}?"`).join('\n')}

### Phase 5 — Trade-offs (5 min)
"What are the main trade-offs in your design?"
"What would you change if you had more time?"

## RUBRIC (internal)
- Requirements: ${problem.rubric.requirements_gathering}
- High-level: ${problem.rubric.high_level_design}
- Detail: ${problem.rubric.detailed_design}
- Scale: ${problem.rubric.scalability}
- Trade-offs: ${problem.rubric.trade_offs}

## VOICE RULES
- Max 3 sentences per response during deep dive
- Ask the candidate to DESCRIBE their diagram: "Walk me through what you have on the whiteboard"
- Use verbal cues: "Mmhmm", "Interesting", "What about..."
- Don't lecture — ask questions that guide them to the right design
- Candidate level: ${candidateLevel}

Remember: you are speaking out loud. Be concise and natural.`;
}
