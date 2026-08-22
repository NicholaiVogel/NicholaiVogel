# Cloudflare Pages Deployment

Use this reference when the user explicitly asks to deploy an Astro site. The default is a manual Cloudflare Pages deployment with a verified build artifact and a real public-route check.

## Inspect the Project Contract

1. Read `package.json`, `README*`, `AGENTS.md`, `astro.config.*`, and `wrangler.*` with `read_file`.
2. Use Wrangler 4.68 or newer for the full runtime behavior expected by the reference projects, and keep the documented compatibility date in the project’s config when one is already present.
3. Prefer the documented deploy script if it exists. Do not replace the project’s existing contract with a guessed command.
4. For Astro plus Bun, use `bun run build`, never `bun build`.
5. For a Pages site, the Wrangler config uses `pages_build_output_dir: "./dist"`. Do not add `account_id` or ratelimit configuration to a Pages config unless the repository’s documented contract requires a different runtime.
6. Set the account outside the public config with `CLOUDFLARE_ACCOUNT_ID` when the command needs it.

## Build and Inspect Locally

Invoke through the `terminal` tool:

```bash
bun run build
test -f dist/<route>/index.html
python3 -m http.server 4177 -d dist
```

Use the project’s documented preview command when it has one. `bun preview` is the common Astro preview command in the reference projects. Stop a stale preview process before retrying if the documented local port is occupied.

## Authenticate

Invoke through the `terminal` tool:

```bash
wrangler --version
wrangler whoami
```

If Wrangler is not authenticated, stop and ask the user to run `wrangler login` or provide the documented `CLOUDFLARE_API_TOKEN` setup. Never request or type a secret into the chat.

## Deploy

Prefer the project’s documented command, for example:

```bash
bun run deploy
```

If there is no deploy script, use the explicit Pages command:

```bash
wrangler pages deploy ./dist --project-name <pages-project> --branch main 2>&1 | tee /tmp/pages-deploy.log
```

If the Pages project does not exist, create it and deploy it:

```bash
CLOUDFLARE_ACCOUNT_ID=<account_id> wrangler pages project create <pages-project> --production-branch main
CLOUDFLARE_ACCOUNT_ID=<account_id> wrangler pages deploy ./dist --project-name <pages-project> --branch main
```

Capture the output in a log when using the explicit command. A truncated or stale deploy result is not proof of publication.

## Validate the Public Site

Use the browser or `terminal` tool. For a deterministic HTML check, invoke through `terminal`:

```bash
curl -L -sS -A 'Mozilla/5.0' -o /tmp/pages_check.html \
  -w '%{http_code} %{content_type} %{size_download}\n' \
  'https://example.com/<route>/'
grep -q '<title>Expected Title</title>' /tmp/pages_check.html
```

Check the custom domain and the raw `*.pages.dev` URL when both exist. A custom domain can be fronted by another Worker or proxy and show stale content even when the Pages deployment is correct. Validate the exact route, not just the homepage.

## Deployment Pitfalls

- A build passing proves only that Astro produced output, not that the public route serves it.
- Multiple Cloudflare accounts can make a successful deploy appear missing.
- Do not put secrets in `wrangler.jsonc`, source, logs, or final reports. Use `wrangler secret put <SECRET_NAME>` when a project needs a secret.
- CSS assets can retain a stable hash across deploys; if a client shows stale CSS, verify the raw Pages hostname, inspect the response, use the documented cache-busting approach, or purge the relevant cache.
- Decorative offsets, `clamp()`, and `nowrap` can create mobile overflow or clipped copy even when desktop looks correct.
- Do not claim “deployed” without the actual URL and a successful public-route check.
