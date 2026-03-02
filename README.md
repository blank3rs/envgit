# envgit

Encrypted per-project environment variable manager. Commit your secrets safely — encrypted at rest, decrypted only on machines that have the key.

```bash
npm install -g @akshxy/envgit
```

---

## Why

`.env` files get committed by accident. Sharing secrets over Slack or email is a disaster waiting to happen. `envgit` fixes both:

- Secrets are encrypted with **AES-256-GCM** and live in `.envgit/` — safe to commit
- The key lives on **your machine only** (`~/.config/envgit/keys/`) — never touches the repo
- Teammates just run `envgit keygen --set <key>` after cloning — no manual file management
- `envgit unpack dev` writes a clean, **beautifully formatted `.env`** grouped by service

---

## Quick start

```bash
# 1. Initialize in your project
envgit init

# 2. Set variables
envgit set API_KEY=abc123 DB_URL=postgres://localhost/mydb

# 3. Or load from an existing .env file
envgit set -f .env.local

# 4. Commit the encrypted store — key never included
git add .envgit/
git commit -m "chore: add encrypted env"

# 5. Write .env locally whenever you need it
envgit unpack dev
```

---

## Team workflow

```bash
# ── Developer A (project owner) ──────────────────────────
envgit init
envgit set DB_URL=postgres://... OPENAI_API_KEY=sk-...
git add .envgit/ && git commit -m "chore: encrypted env"

envgit keygen --show
# Prints your key — send it to teammates via 1Password, Bitwarden, etc.

# ── Developer B (teammate, after cloning) ─────────────────
envgit keygen --set <key-from-teammate>
# Key is saved to ~/.config/envgit/keys/<project-id>.key automatically
# No file paths to think about — it just works

envgit verify        # confirm the key works
envgit unpack dev    # writes .env
```

---

## Formatted `.env` output

When you run `envgit unpack`, the `.env` is written with sections grouped by service — no more chaotic unsorted files:

```bash
# ──────────────────────────────────────────────────
#  envgit — encrypted environment manager
#  Project : myapp
#  Env     : dev
#  Edit    : envgit set KEY=VALUE --env dev
# ──────────────────────────────────────────────────

# ── App / Config ────────────────────────────────
NODE_ENV=development
PORT=3000

# ── AI / Anthropic ──────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ── AI / OpenAI ─────────────────────────────────
OPENAI_API_KEY=sk-...

# ── Auth / Clerk ────────────────────────────────
CLERK_SECRET_KEY=sk_test_...

# ── Auth / NextAuth ─────────────────────────────
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# ── AWS ─────────────────────────────────────────
AWS_ACCESS_KEY_ID=AKIA...
AWS_REGION=us-east-1
AWS_SECRET_ACCESS_KEY=...

# ── Cache / Redis ───────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Database / PostgreSQL ───────────────────────
DATABASE_URL=postgres://localhost/mydb

# ── Next.js / Public (client-side) ──────────────
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ── Payments / Stripe ───────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Supabase ────────────────────────────────────
SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://xyz.supabase.co
```

Supports 100+ services out of the box: OpenAI, Anthropic, Groq, Stripe, Supabase, Clerk, Auth0, NextAuth, AWS, GCP, Azure, Redis, Upstash, Resend, SendGrid, Twilio, Sentry, Datadog, PostHog, Segment, Algolia, Pinecone, Cloudinary, and many more.

---

## Commands

### Key management

| Command | Description |
|---------|-------------|
| `envgit init` | Initialize project, generate key, save to `~/.config/envgit/keys/` |
| `envgit keygen` | Generate a new key for the current project |
| `envgit keygen --show` | Print current key to share with teammates |
| `envgit keygen --set <key>` | Save a teammate's key for the current project |
| `envgit rotate-key` | Generate new key and re-encrypt all environments |
| `envgit verify` | Confirm all environments decrypt with the current key |

### Variables

| Command | Description |
|---------|-------------|
| `envgit set KEY=VALUE ...` | Set one or more variables |
| `envgit set -f .env` | Import all variables from a `.env` file |
| `envgit set -f .env --env prod` | Import into a specific environment |
| `envgit get KEY` | Print a single value |
| `envgit delete KEY` | Remove a variable |
| `envgit rename OLD NEW` | Rename a variable |
| `envgit list` | List all keys in the active environment |
| `envgit list --show-values` | List keys and their values |

### Environments

| Command | Description |
|---------|-------------|
| `envgit envs` | List all environments with variable counts |
| `envgit add-env <name>` | Create a new environment |
| `envgit unpack <env>` | Decrypt and write a formatted `.env` file |
| `envgit copy KEY --from dev --to prod` | Copy a variable between environments |
| `envgit diff dev prod` | Show what's different between two environments |
| `envgit diff dev prod --show-values` | Include values in the diff |

### Export & run

| Command | Description |
|---------|-------------|
| `envgit export` | Print `KEY=VALUE` lines to stdout (pipeable) |
| `envgit export --format json` | Print as JSON |
| `envgit export --format shell` | Print as `export KEY="VALUE"` (eval-able) |
| `envgit export --env prod` | Export a specific environment |
| `envgit run -- node server.js` | Run a command with env vars injected, nothing written to disk |
| `envgit import --file .env.local` | Encrypt an existing `.env` file |

### Status

| Command | Description |
|---------|-------------|
| `envgit status` | Show project root, active env, key location, `.env` state |

---

## `--env` flag

Most commands default to the active environment. Pass `--env` to target any environment explicitly:

```bash
envgit set STRIPE_KEY=sk_live_... --env prod
envgit list --env staging
envgit export --env prod --format json | jq .
envgit run --env prod -- node scripts/migrate.js
```

---

## CI / CD

Set `ENVGIT_KEY` instead of using a key file:

```bash
# GitHub Actions
- name: Decrypt env
  env:
    ENVGIT_KEY: ${{ secrets.ENVGIT_KEY }}
  run: envgit export --env prod --format shell >> $GITHUB_ENV
```

```bash
# Local one-liner
ENVGIT_KEY=$(cat ~/.config/envgit/keys/<id>.key) envgit run -- node server.js
```

---

## Security

- **AES-256-GCM** — authenticated encryption, any tampering is detected
- **32 bytes of entropy** from the OS cryptographic RNG (`crypto.randomBytes`)
- **Fresh random IV per write** — encrypting the same value twice produces different ciphertext
- **Key stored at `~/.config/envgit/keys/`** — never in the repo, never in `.env`
- **File permissions enforced** — key files are locked to `0600`, errors if too permissive
- **Key bytes zeroized** from memory immediately after use
- **No plaintext ever written** except when you explicitly run `envgit unpack`
