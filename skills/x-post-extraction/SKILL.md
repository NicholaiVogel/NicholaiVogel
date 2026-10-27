---
name: x-post-extraction
description: Use when reading public X (Twitter) posts or profiles without logging in. Fetches post text, media, quoted posts, profile stats and timelines through public endpoints.
version: 0.2.0
license: MIT
metadata:
  tags: [Social, X, Twitter, Scraping]
---

# X Post and Profile Extraction

Read public X/Twitter posts, profiles and timelines without logging in. Use it when someone shares an x.com URL. Generic URL extractors usually come back empty for X, because the site is JavaScript-only and blocks scrapers.

## When to Use

- Someone shares an x.com or twitter.com post URL or profile URL ("check this out: x.com/<handle>")
- Any task that needs a post's text, timestamp or media, or an account's bio, stats or recent posts
- Cross-checking claims that circulate as X posts
- Checking whether an account is real, affiliated or an impersonator (see references/account-authenticity-triage.md)

## Pick the route by URL shape

- `/status/<ID>` URL: a single post. `https://api.fxtwitter.com/2/status/<ID>` is the most reliable first call. It returns `status.text`, `status.raw_text.facets` (entries with `type: url` hold the expanded links), `status.media.all` and `status.quote`. The syndication endpoint (Procedure A) is the fallback.
- Bare `x.com/<handle>` URL: a profile. Use the fxtwitter API (Procedure B). Go straight there; opening x.com in an automated browser usually returns a 403.
- The official X API (for example the `xurl` CLI) is the paid, authenticated route. Use it only when the free routes miss something, such as keyword search.

## Acting on a shared post

- People often send the instruction and the link as separate messages ("install this", "save this", then a bare x.com URL). Read the intent from the neighbouring message and act on the post's subject, not just the post.
- Many posts are pointers: the real artifact is a linked GitHub repo, Hugging Face dataset or product page. Follow the expanded URL from `raw_text.facets` (or the URL in `text`) and inspect the source (README, license, file list, pricing page) before summarizing or installing anything.
- Treat numbers in a post as claims by the poster or vendor. Cross-check them against the linked repo, its issues or official docs, and say which numbers are self-reported.

## Procedure A: single post (syndication)

1. Extract the post ID: `https://x.com/<user>/status/<ID>?s=20` gives the number after `/status/`.

2. Fetch:

```bash
curl -sL --max-time 25 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" \
  "https://cdn.syndication.twimg.com/tweet-result?id=<ID>&lang=en&token=0"
```

   Alternative with the same shape as Procedure B: `https://api.fxtwitter.com/2/status/<ID>` (returns `status.text`, `status.quote`, media).

3. Parse. Key fields:
   - `text`: the post body (not `full_text`, which is often empty in this API)
   - `user.screen_name`, `created_at`: attribution
   - `photos[].url` or `mediaDetails[].media_url_https`: image URLs on `pbs.twimg.com/media/...`
   - `quoted_tweet`: the nested quoted post; parse it recursively

4. Download images with plain curl (`pbs.twimg.com` is public):

```bash
curl -sL "https://pbs.twimg.com/media/<FILE>.jpg" -o post_image.jpg
```

5. If an image carries data (tables, screenshots, charts), view it or OCR it. Images have no alt text. Without a vision model, use `tesseract`.

6. Video posts (the real content often sits in the quoted post): fxtwitter returns `status.quote.media.all[]` with `type: video` and a direct `video.twimg.com/...mp4` URL. To use a video as a visual reference, download it, sample frames and tile them into contact sheets so one image covers several moments:

```bash
curl -sL "<mp4 url>" -o ref.mp4
mkdir -p frames
ffmpeg -v error -i ref.mp4 -vf "fps=1/2,scale=1280:-1" frames/f_%03d.jpg
# 2x2 sheet from four frames
ffmpeg -v error -i f1.jpg -i f2.jpg -i f3.jpg -i f4.jpg \
  -filter_complex "[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[o]" -map "[o]" sheet.jpg
```

   Check the post text too: a post can quote a second post whose video is the actual reference.

## Procedure B: profile and timeline (fxtwitter)

1. Profile metadata:

```bash
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
curl -sL --max-time 20 -A "$UA" https://api.fxtwitter.com/<handle>
```

   `user` holds `name`, `description`, `joined`, `followers`, `following`, `tweets`, `website.url`, `verification` and `id`.

2. Recent posts, newest first, 20 per page:

```bash
curl -sL -A "$UA" "https://api.fxtwitter.com/2/profile/<handle>/statuses?count=40" -o p1.json
# next page: append &cursor=<p1.json .cursor.bottom>
```

   Each result has `text`, `created_at`, `likes`, `reposts`, `replies`, `views`, `replying_to` (self-replies are thread parts), `quote` (a nested post with `author`) and `media.all`. Loop on `cursor.bottom` until the count matches the profile's `tweets` or results run out. Write pages to a scratch folder and parse them in code; don't eyeball raw JSON.

3. Summarize: account age, stats, bio and website link, then the posts grouped (threads collapsed), then anything off-pattern (links to chains or wallets, giveaways, quote-replies from unknown accounts).

## Pitfalls

- Public accounts and posts only. Protected, deleted or restricted content comes back empty. The only fallback is a logged-in browser session or the paid API, used with the account owner's permission.
- The syndication profile timeline (`syndication.twitter.com/srv/timeline-profile/screen-name/<handle>`) can return `hasResults: true` with an empty `timeline.entries`. An empty list there doesn't mean the account has no posts. Use fxtwitter for profiles.
- Syndication is undocumented: retry with a different user agent if it returns 400. `token=0` is accepted for public posts.
- Media URLs: use `mediaDetails[].media_url_https`. `entities.media[].expanded_url` points at the x.com page, not the file.
- Delete downloaded JSON and images when done.

## Verification

- JSON parses and `text` is non-empty: success.
- Empty `text` on a known-public post: try a different user agent, then fxtwitter, then a logged-in session.
- Posts are self-reports: cross-check benchmark and stats claims against an official source before treating them as fact.

## References

- references/account-authenticity-triage.md: deciding whether an account using someone's brand (or any brand) is real, and what to hand over when it isn't.
