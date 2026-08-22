# Astro Routing

Source basis: `https://docs.astro.build/en/guides/routing/`.

Astro websites in this skill must use Astro’s built-in file-based routing. Route ownership stays in `src/pages`; do not introduce React Router, Next Router, or another client-side routing system for ordinary site navigation.

## Routing Rules

- Every public page route belongs in `src/pages/` as an `.astro`, `.md`, or `.mdx` file.
- A file’s path and filename determine its URL. `src/pages/index.astro` maps to `/`; nested files map to nested routes.
- Use standard HTML `<a>` elements for navigation between routes. Astro does not provide a framework-specific `<Link>` component for this purpose.
- Use bracket parameters such as `src/pages/authors/[author].astro` for dynamic routes.
- In static output mode, dynamic pages must export `getStaticPaths()` with `params` values for every generated route, then read values through `Astro.params`.
- In SSR mode, a matching dynamic route can be generated on request; keep this choice tied to the project’s runtime requirements.
- Keep components, data, utilities, and tests outside `src/pages` or prefix non-route page files with `_` when they must live beside routes.
- Model the route map in `DESIGN-BRIEF.md` before implementation. Every launch route needs approved content, an explicit placeholder decision, or a documented out-of-scope decision.

## Procedure

1. List the route map in the brief, including static pages, collection routes, dynamic parameters, redirects, and legal routes.
2. Create the route tree under `src/pages` and keep reusable UI in `src/components` or layouts.
3. Use normal relative or site-aware `<a href="...">` links for internal navigation. Avoid router abstractions that hide the URL or duplicate Astro’s route ownership.
4. For static dynamic routes, implement and exercise `getStaticPaths()` and `Astro.params` with the content source that owns the records.
5. For SSR dynamic routes, verify the adapter and runtime contract before relying on request-time matching.
6. Run `bun run build`, then check the expected route artifacts under `dist` for static output. Inspect the actual links and destination routes in preview or the deployed URL.

## Pitfalls

- Putting a page in `src/components` and expecting Astro to create a route.
- Adding a React or Next-style `<Link>` component instead of an HTML anchor.
- Creating a dynamic static route without returning every required parameter from `getStaticPaths()`.
- Moving route ownership into client state, hash navigation, or a third-party router.
- Forgetting the configured `base` path when generating internal URLs for a site hosted below the domain root.
- Treating a successful component render as proof that every route builds and links correctly.

## Verification

Run `bun run build` through the `terminal` tool and verify that each expected static route has its corresponding `dist/<route>/index.html` artifact, or that the project’s documented SSR preview serves each dynamic route.
