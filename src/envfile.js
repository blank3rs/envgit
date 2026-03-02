import { readFileSync, writeFileSync, existsSync } from 'fs';

// ─── Section label mappings (prefix → section name) ──────────────────────────
const SECTION_LABELS = {
  // ── App / Runtime ──────────────────────────────────────────────────────────
  NODE:                   'App / Runtime',
  APP:                    'App / Config',
  SERVER:                 'App / Server',
  SERVICE:                'App / Service',
  WORKER:                 'App / Worker',

  // ── Frontend Frameworks ────────────────────────────────────────────────────
  NEXT:                   'Next.js',
  NEXT_PUBLIC:            'Next.js / Public (client-side)',
  NUXT:                   'Nuxt',
  NUXT_PUBLIC:            'Nuxt / Public (client-side)',
  VITE:                   'Vite',
  VITE_APP:               'Vite / Public (client-side)',
  REACT:                  'React',
  REACT_APP:              'React / Public (client-side)',
  GATSBY:                 'Gatsby',
  SVELTE:                 'SvelteKit',
  PUBLIC:                 'Public (client-side)',

  // ── Databases ──────────────────────────────────────────────────────────────
  DB:                     'Database',
  DATABASE:               'Database',
  POSTGRES:               'Database / PostgreSQL',
  POSTGRESQL:             'Database / PostgreSQL',
  PG:                     'Database / PostgreSQL',
  PGHOST:                 'Database / PostgreSQL',
  PGPORT:                 'Database / PostgreSQL',
  PGUSER:                 'Database / PostgreSQL',
  PGPASSWORD:             'Database / PostgreSQL',
  PGDATABASE:             'Database / PostgreSQL',
  MYSQL:                  'Database / MySQL',
  MARIADB:                'Database / MariaDB',
  MONGO:                  'Database / MongoDB',
  MONGODB:                'Database / MongoDB',
  SQLITE:                 'Database / SQLite',
  COCKROACH:              'Database / CockroachDB',
  COCKROACHDB:            'Database / CockroachDB',
  NEON:                   'Database / Neon',
  PLANETSCALE:            'Database / PlanetScale',
  TURSO:                  'Database / Turso',
  SUPABASE:               'Supabase',
  XATA:                   'Database / Xata',
  CONVEX:                 'Database / Convex',

  // ── Cache / Queues ─────────────────────────────────────────────────────────
  REDIS:                  'Cache / Redis',
  UPSTASH:                'Cache / Upstash Redis',
  MEMCACHED:              'Cache / Memcached',
  KAFKA:                  'Queue / Kafka',
  RABBITMQ:               'Queue / RabbitMQ',
  SQS:                    'Queue / AWS SQS',
  BULL:                   'Queue / Bull',
  INNGEST:                'Queue / Inngest',
  TRIGGER:                'Queue / Trigger.dev',
  QSTASH:                 'Queue / QStash',

  // ── Auth ───────────────────────────────────────────────────────────────────
  AUTH:                   'Auth',
  AUTH0:                  'Auth / Auth0',
  CLERK:                  'Auth / Clerk',
  NEXTAUTH:               'Auth / NextAuth',
  NEXT_AUTH:              'Auth / NextAuth',
  LUCIA:                  'Auth / Lucia',
  BETTER_AUTH:            'Auth / Better Auth',
  SUPABASE_AUTH:          'Auth / Supabase Auth',
  FIREBASE_AUTH:          'Auth / Firebase Auth',
  COGNITO:                'Auth / AWS Cognito',
  OKTA:                   'Auth / Okta',
  WORKOS:                 'Auth / WorkOS',
  PROPELAUTH:             'Auth / PropelAuth',
  STYTCH:                 'Auth / Stytch',
  MAGIC:                  'Auth / Magic',
  OAUTH:                  'Auth / OAuth',
  JWT:                    'Auth / JWT',
  SESSION:                'Auth / Session',
  COOKIE:                 'Auth / Cookie',
  CSRF:                   'Auth / CSRF',
  TOTP:                   'Auth / 2FA',
  MFA:                    'Auth / 2FA',

  // ── AWS ────────────────────────────────────────────────────────────────────
  AWS:                    'AWS',
  S3:                     'AWS / S3',
  EC2:                    'AWS / EC2',
  ECS:                    'AWS / ECS',
  EKS:                    'AWS / EKS',
  LAMBDA:                 'AWS / Lambda',
  CLOUDFRONT:             'AWS / CloudFront',
  CLOUDWATCH:             'AWS / CloudWatch',
  COGNITO:                'AWS / Cognito',
  DYNAMODB:               'AWS / DynamoDB',
  SES:                    'AWS / SES',
  SNS:                    'AWS / SNS',
  SQS:                    'AWS / SQS',
  ROUTE53:                'AWS / Route 53',
  ECR:                    'AWS / ECR',
  SECRETS:                'AWS / Secrets Manager',

  // ── Google Cloud ───────────────────────────────────────────────────────────
  GCP:                    'Google Cloud',
  GOOGLE:                 'Google',
  GOOGLE_CLOUD:           'Google Cloud',
  FIREBASE:               'Firebase',
  FIRESTORE:              'Firebase / Firestore',
  GCS:                    'Google Cloud / Storage',
  BIGQUERY:               'Google Cloud / BigQuery',
  PUBSUB:                 'Google Cloud / Pub/Sub',
  GCLOUD:                 'Google Cloud',

  // ── Azure ──────────────────────────────────────────────────────────────────
  AZURE:                  'Azure',
  AZURE_AD:               'Azure / Active Directory',
  COSMOS:                 'Azure / Cosmos DB',
  COSMOSDB:               'Azure / Cosmos DB',
  BLOB:                   'Azure / Blob Storage',

  // ── AI / LLMs ──────────────────────────────────────────────────────────────
  OPENAI:                 'AI / OpenAI',
  ANTHROPIC:              'AI / Anthropic',
  GEMINI:                 'AI / Google Gemini',
  COHERE:                 'AI / Cohere',
  REPLICATE:              'AI / Replicate',
  HUGGINGFACE:            'AI / HuggingFace',
  HF:                     'AI / HuggingFace',
  TOGETHER:               'AI / Together AI',
  GROQ:                   'AI / Groq',
  MISTRAL:                'AI / Mistral',
  PERPLEXITY:             'AI / Perplexity',
  FIREWORKS:              'AI / Fireworks AI',
  ANYSCALE:               'AI / Anyscale',
  AI21:                   'AI / AI21 Labs',
  STABILITY:              'AI / Stability AI',
  DEEPINFRA:              'AI / DeepInfra',
  ELEVENLABS:             'AI / ElevenLabs',
  ASSEMBLYAI:             'AI / AssemblyAI',
  DEEPGRAM:               'AI / Deepgram',

  // ── Vector DBs ─────────────────────────────────────────────────────────────
  PINECONE:               'Vector DB / Pinecone',
  WEAVIATE:               'Vector DB / Weaviate',
  QDRANT:                 'Vector DB / Qdrant',
  CHROMA:                 'Vector DB / Chroma',
  MILVUS:                 'Vector DB / Milvus',

  // ── Payments ───────────────────────────────────────────────────────────────
  STRIPE:                 'Payments / Stripe',
  PAYPAL:                 'Payments / PayPal',
  BRAINTREE:              'Payments / Braintree',
  SQUARE:                 'Payments / Square',
  LEMON:                  'Payments / Lemon Squeezy',
  LEMONSQUEEZY:           'Payments / Lemon Squeezy',
  PADDLE:                 'Payments / Paddle',
  COINBASE:               'Payments / Coinbase Commerce',
  RAZORPAY:               'Payments / Razorpay',

  // ── Email ──────────────────────────────────────────────────────────────────
  SMTP:                   'Email / SMTP',
  MAIL:                   'Email',
  EMAIL:                  'Email',
  SENDGRID:               'Email / SendGrid',
  RESEND:                 'Email / Resend',
  MAILGUN:                'Email / Mailgun',
  POSTMARK:               'Email / Postmark',
  MAILCHIMP:              'Email / Mailchimp',
  MANDRILL:               'Email / Mandrill',
  SES:                    'Email / AWS SES',
  SPARKPOST:              'Email / SparkPost',
  CONVERTKIT:             'Email / ConvertKit',
  LOOPS:                  'Email / Loops',

  // ── SMS / Communications ───────────────────────────────────────────────────
  TWILIO:                 'SMS / Twilio',
  VONAGE:                 'SMS / Vonage',
  MESSAGEBIRD:            'SMS / MessageBird',
  TELNYX:                 'SMS / Telnyx',
  SINCH:                  'SMS / Sinch',
  BANDWIDTH:              'SMS / Bandwidth',

  // ── Search ─────────────────────────────────────────────────────────────────
  ALGOLIA:                'Search / Algolia',
  MEILISEARCH:            'Search / Meilisearch',
  TYPESENSE:              'Search / Typesense',
  ELASTICSEARCH:          'Search / Elasticsearch',
  OPENSEARCH:             'Search / OpenSearch',

  // ── Storage / CDN ──────────────────────────────────────────────────────────
  CLOUDINARY:             'Storage / Cloudinary',
  IMAGEKIT:               'Storage / ImageKit',
  UPLOADTHING:            'Storage / UploadThing',
  BUNNY:                  'Storage / Bunny CDN',
  BACKBLAZE:              'Storage / Backblaze B2',
  R2:                     'Storage / Cloudflare R2',
  TIGRIS:                 'Storage / Tigris',

  // ── Observability ──────────────────────────────────────────────────────────
  SENTRY:                 'Observability / Sentry',
  DATADOG:                'Observability / Datadog',
  NEWRELIC:               'Observability / New Relic',
  NEW_RELIC:              'Observability / New Relic',
  GRAFANA:                'Observability / Grafana',
  PROMETHEUS:             'Observability / Prometheus',
  LOGTAIL:                'Observability / Logtail',
  AXIOM:                  'Observability / Axiom',
  BETTERSTACK:            'Observability / Better Stack',
  LOGFLARE:               'Observability / Logflare',
  HIGHLIGHT:              'Observability / Highlight',
  BASELIME:               'Observability / Baselime',

  // ── Analytics ──────────────────────────────────────────────────────────────
  POSTHOG:                'Analytics / PostHog',
  SEGMENT:                'Analytics / Segment',
  MIXPANEL:               'Analytics / Mixpanel',
  AMPLITUDE:              'Analytics / Amplitude',
  HEAP:                   'Analytics / Heap',
  HOTJAR:                 'Analytics / Hotjar',
  GA:                     'Analytics / Google Analytics',
  GOOGLE_ANALYTICS:       'Analytics / Google Analytics',
  PLAUSIBLE:              'Analytics / Plausible',
  FATHOM:                 'Analytics / Fathom',
  PIRSCH:                 'Analytics / Pirsch',
  UMAMI:                  'Analytics / Umami',
  JUNE:                   'Analytics / June',
  OPENPANEL:              'Analytics / OpenPanel',

  // ── Feature Flags ──────────────────────────────────────────────────────────
  LAUNCHDARKLY:           'Feature Flags / LaunchDarkly',
  GROWTHBOOK:             'Feature Flags / GrowthBook',
  FLAGSMITH:              'Feature Flags / Flagsmith',
  STATSIG:                'Feature Flags / Statsig',
  UNLEASH:                'Feature Flags / Unleash',
  HYPERTUNE:              'Feature Flags / Hypertune',

  // ── CMS ────────────────────────────────────────────────────────────────────
  CONTENTFUL:             'CMS / Contentful',
  SANITY:                 'CMS / Sanity',
  STRAPI:                 'CMS / Strapi',
  DIRECTUS:               'CMS / Directus',
  PAYLOAD:                'CMS / Payload',
  PRISMIC:                'CMS / Prismic',
  GHOST:                  'CMS / Ghost',
  STORYBLOK:              'CMS / Storyblok',
  BUILDER:                'CMS / Builder.io',

  // ── Hosting / Deploy ───────────────────────────────────────────────────────
  VERCEL:                 'Hosting / Vercel',
  NETLIFY:                'Hosting / Netlify',
  RAILWAY:                'Hosting / Railway',
  RENDER:                 'Hosting / Render',
  FLY:                    'Hosting / Fly.io',
  COOLIFY:                'Hosting / Coolify',
  DOKKU:                  'Hosting / Dokku',
  HEROKU:                 'Hosting / Heroku',
  DENO:                   'Hosting / Deno Deploy',
  CLOUDFLARE:             'Hosting / Cloudflare',

  // ── Social / OAuth Providers ───────────────────────────────────────────────
  GITHUB:                 'OAuth / GitHub',
  GITLAB:                 'OAuth / GitLab',
  TWITTER:                'OAuth / Twitter / X',
  TWITTER_X:              'OAuth / Twitter / X',
  X:                      'OAuth / Twitter / X',
  FACEBOOK:               'OAuth / Facebook',
  INSTAGRAM:              'OAuth / Instagram',
  LINKEDIN:               'OAuth / LinkedIn',
  DISCORD:                'OAuth / Discord',
  SPOTIFY:                'OAuth / Spotify',
  APPLE:                  'OAuth / Apple',
  MICROSOFT:              'OAuth / Microsoft',

  // ── Collaboration / Productivity ───────────────────────────────────────────
  SLACK:                  'Integrations / Slack',
  NOTION:                 'Integrations / Notion',
  LINEAR:                 'Integrations / Linear',
  JIRA:                   'Integrations / Jira',
  AIRTABLE:               'Integrations / Airtable',
  ZAPIER:                 'Integrations / Zapier',
  MAKE:                   'Integrations / Make',

  // ── Maps / Location ────────────────────────────────────────────────────────
  MAPBOX:                 'Maps / Mapbox',
  GOOGLE_MAPS:            'Maps / Google Maps',
  MAPS:                   'Maps / Google Maps',
  HERE:                   'Maps / HERE',
  IPINFO:                 'Maps / IPinfo',
  MAXMIND:                'Maps / MaxMind',

  // ── Crypto / Web3 ──────────────────────────────────────────────────────────
  ALCHEMY:                'Web3 / Alchemy',
  INFURA:                 'Web3 / Infura',
  MORALIS:                'Web3 / Moralis',
  THIRDWEB:               'Web3 / Thirdweb',
  WALLET:                 'Web3 / Wallet',

  // ── Testing / Dev Tools ────────────────────────────────────────────────────
  PLAYWRIGHT:             'Testing / Playwright',
  CYPRESS:                'Testing / Cypress',
  BROWSERSTACK:           'Testing / BrowserStack',
  SAUCE:                  'Testing / Sauce Labs',
  STORYBOOK:              'Dev / Storybook',
  CHROMATIC:              'Dev / Chromatic',
};

const STANDALONE_LABELS = {
  PORT:           'App / Config',
  HOST:           'App / Config',
  NODE_ENV:       'App / Config',
  APP_ENV:        'App / Config',
  ENVIRONMENT:    'App / Config',
  BASE_URL:       'App / Config',
  API_URL:        'App / Config',
  SITE_URL:       'App / Config',
  FRONTEND_URL:   'App / Config',
  BACKEND_URL:    'App / Config',
  PUBLIC_URL:     'App / Config',
  LOG_LEVEL:      'App / Config',
  DEBUG:          'App / Config',
  TZ:             'App / Config',
  TIMEZONE:       'App / Config',
  LOCALE:         'App / Config',
  LANG:           'App / Config',
  SECRET:         'Secrets',
  SECRET_KEY:     'Secrets',
  ENCRYPTION_KEY: 'Secrets',
  API_KEY:        'API Keys',
  API_SECRET:     'API Keys',
  ACCESS_TOKEN:   'API Keys',
  PRIVATE_KEY:    'Secrets',
  PUBLIC_KEY:     'Secrets',
};

export function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

// Used internally for encryption — keeps insertion order, no formatting
export function stringifyEnv(vars) {
  const lines = Object.entries(vars).map(([k, v]) => {
    const needsQuotes = /[\s"'\\#]/.test(v) || v === '';
    const escaped = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `${k}=${needsQuotes ? `"${escaped}"` : v}`;
  });
  return lines.join('\n') + (lines.length ? '\n' : '');
}

function formatValue(v) {
  const needsQuotes = /[\s"'\\#]/.test(v) || v === '';
  const escaped = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return needsQuotes ? `"${escaped}"` : v;
}

function getSectionForKey(key) {
  if (STANDALONE_LABELS[key]) return STANDALONE_LABELS[key];

  // Try progressively shorter prefixes — longest match wins
  const parts = key.split('_');
  for (let len = parts.length - 1; len >= 1; len--) {
    const prefix = parts.slice(0, len).join('_');
    if (SECTION_LABELS[prefix]) return SECTION_LABELS[prefix];
  }

  return 'General';
}

function groupAndSort(vars) {
  const sections = {};

  for (const [key, value] of Object.entries(vars)) {
    const section = getSectionForKey(key);
    if (!sections[section]) sections[section] = [];
    sections[section].push([key, value]);
  }

  for (const section of Object.keys(sections)) {
    sections[section].sort(([a], [b]) => a.localeCompare(b));
  }

  // App/Config first, Secrets near top, General at bottom
  const priority = {
    'App / Config':  0,
    'App / Runtime': 1,
    'App / Server':  2,
    'Secrets':       3,
    'API Keys':      4,
    'General':       999,
  };

  return Object.entries(sections).sort(([a], [b]) => {
    const pa = priority[a] ?? 50;
    const pb = priority[b] ?? 50;
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });
}

export function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return parseEnv(readFileSync(filePath, 'utf8'));
}

export function writeEnvFile(filePath, vars, { envName, projectRoot } = {}) {
  const entries = Object.entries(vars);
  const projectName = projectRoot ? projectRoot.split('/').pop() : null;
  const lines = [];

  // Header
  if (envName) {
    const width = 50;
    const bar = '─'.repeat(width);
    lines.push(`# ${bar}`);
    lines.push(`#  envgit — encrypted environment manager`);
    if (projectName) lines.push(`#  Project : ${projectName}`);
    lines.push(`#  Env     : ${envName}`);
    lines.push(`#  Edit    : envgit set KEY=VALUE --env ${envName}`);
    lines.push(`# ${bar}`);
    lines.push('');
  }

  if (entries.length === 0) {
    writeFileSync(filePath, lines.join('\n'), 'utf8');
    return;
  }

  const grouped = groupAndSort(vars);
  for (const [section, sectionVars] of grouped) {
    lines.push(`# ── ${section} ${'─'.repeat(Math.max(0, 44 - section.length))}`);
    for (const [k, v] of sectionVars) {
      lines.push(`${k}=${formatValue(v)}`);
    }
    lines.push('');
  }

  writeFileSync(filePath, lines.join('\n'), 'utf8');
}
