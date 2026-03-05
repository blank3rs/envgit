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
- Onboard a teammate: `envgit share` → copy the output → send via Signal/iMessage → they run `envgit join`
- `envgit unpack` writes a clean, **beautifully formatted `.env`** grouped by service

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

# 5. Switch env and write .env locally
envgit use dev
envgit unpack
```

---

## Team workflow

```bash
# ── Developer A (project owner) ──────────────────────────
envgit init
envgit set DB_URL=postgres://... OPENAI_API_KEY=sk-...
git add .envgit/ && git commit -m "chore: encrypted env"

envgit share
# ✓ Key encrypted. Send the command below to your teammate via Signal, iMessage, email — anywhere.
#
#   envgit join <blob> --code <passphrase>
#
# Copy that one line and send it. Nothing was uploaded anywhere.

# ── Developer B (teammate, after cloning) ─────────────────
envgit join <blob> --code <passphrase>
# ✓ Key saved to ~/.config/envgit/keys/<project-id>.key

envgit verify        # confirm the key works
envgit unpack        # writes .env (picks up active env)
```

**No server involved.** The blob is AES-256-GCM encrypted — useless without the passphrase. Send both parts via any channel you trust.

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
| `envgit share` | Encrypt key locally, print a blob + passphrase to send to a teammate |
| `envgit join <blob> --code <passphrase>` | Save a key from `envgit share` output |
| `envgit rotate-key` | Generate new key and re-encrypt all environments, then run `envgit share` |
| `envgit verify` | Confirm all environments decrypt with the current key |

### Variables

All variable commands are **interactive** — run them without arguments to get a fuzzy search picker.

| Command | Description |
|---------|-------------|
| `envgit set KEY=VALUE ...` | Set one or more variables |
| `envgit set -f .env` | Import all variables from a `.env` file |
| `envgit set -f .env --env prod` | Import into a specific environment |
| `envgit get KEY` | Print a single value |
| `envgit delete KEY` | Remove a variable |
| `envgit rename OLD NEW` | Rename a variable |
| `envgit copy KEY --from dev --to prod` | Copy a variable between environments |
| `envgit list` | List all keys in the active environment |
| `envgit list --show-values` | List keys and their values |

### Environments

| Command | Description |
|---------|-------------|
| `envgit envs` | List all environments with variable counts |
| `envgit use <env>` | Switch active environment (like `git checkout`) |
| `envgit add-env <name>` | Create a new environment |
| `envgit unpack [env]` | Decrypt and write a formatted `.env` file |
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

### Utilities

| Command | Description |
|---------|-------------|
| `envgit status` | Show project root, active env, key location, `.env` state |
| `envgit doctor` | Check everything — key, envs, git safety — in one shot |
| `envgit audit` | Show which keys are missing across environments |
| `envgit scan` | Scan codebase for hardcoded secrets using patterns and entropy analysis |
| `envgit template` | Generate a `.env.example` with all keys, no values |
| `envgit fix` | Post-upgrade repair: migrate config, fix permissions, update `.gitignore` |

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
- **No server** — `envgit share` encrypts your key locally with a one-time passphrase. Nothing is uploaded anywhere. You send the blob yourself via any channel you trust.

---

## Threat model

**What envgit protects against**

| Threat | Protection |
|--------|-----------|
| `.env` accidentally committed to git | Encrypted files are safe to commit — plaintext never touches the repo |
| Secrets shared over Slack, email, chat | `envgit share` outputs an AES-256-GCM blob — useless without the passphrase. Send both parts, split across channels if paranoid. |
| Teammate's machine is compromised | Key is per-machine — compromise one machine, not all |
| Secrets hardcoded in source | `envgit scan` detects these using pattern matching and entropy analysis |

**What envgit does NOT protect against**

- A compromised machine where the key file is readable — if your machine is owned, the key is accessible
- Secrets that have already been committed in plaintext to git history — use `git filter-repo` to scrub those
- An attacker who intercepts both the relay token AND the passphrase at the same time — treat the passphrase like a password

---

## How it works

```
Your machine                                         Teammate's machine
────────────────                                     ──────────────────────

project.key (32 bytes)
    │
    ▼
encrypt with
one-time passphrase
    │
    ▼
envgit share prints:
  envgit join <blob> --code <passphrase>
    │
    │   ← you send this line via Signal, iMessage, email, etc. →
    │
    ▼                                                envgit join <blob> --code <passphrase>
                                                         │
                                                         ▼
                                                     decrypt blob with passphrase
                                                         │
                                                         ▼
                                                     key saved to
                                                     ~/.config/envgit/keys/
```

No server. No upload. The blob is AES-256-GCM encrypted — without the passphrase it is indistinguishable from random noise.

---

## Crypto decisions

**Why AES-256-GCM?**
GCM is an authenticated encryption mode — it detects tampering. If anyone modifies the ciphertext (even one byte), decryption fails loudly rather than silently returning corrupt data. This matters for secrets: you want to know immediately if something has been tampered with.

**Why 32 bytes of entropy?**
NIST recommends 128-bit minimum for symmetric keys. envgit uses 256-bit (32 bytes) from `crypto.randomBytes`, which reads from the OS CSPRNG. This is the same source used by OpenSSL and Node's TLS stack.

**Why a fresh IV per write?**
AES-GCM requires a unique IV per (key, message) pair. Reusing an IV with the same key catastrophically breaks confidentiality — an attacker can XOR two ciphertexts to cancel out the keystream. envgit generates a new random IV on every write, making this impossible.

**Why zeroize key bytes after use?**
Node.js buffers live in V8's heap. Without explicit zeroization, key bytes can persist in memory until GC runs — and could potentially be read from a core dump or swap file. envgit calls `buffer.fill(0)` immediately after the crypto operation completes.

