# ADR 002: Use Hash-Based Routing

## Status

Accepted

## Context

PayNow Requests is designed to work on static hosting platforms like GitHub Pages. The application needs client-side routing to support:

1. Home page for creating requests (`/`)
2. View page for shared requests (`/request/:encodedData`)

### Static Hosting Constraints

GitHub Pages and similar platforms have limitations:
- No server-side routing configuration
- All paths must resolve to `index.html`
- SPA refresh issues with non-root paths

## Decision

Use React Router's **hash-based routing** (`BrowserRouter` with hash-based paths or `HashRouter`).

### Implementation

```typescript
import { BrowserRouter } from 'react-router-dom';

// URL format: https://example.com/#/request/{encodedData}
<Routes>
  <Route path="/" element={<CreateRequest />} />
  <Route path="/request/:encodedData" element={<ViewRequest />} />
</Routes>
```

## Benefits

1. **Static Hosting Compatible**: Works on GitHub Pages, Netlify, Vercel without configuration
2. **Refresh-Safe**: Direct URL access works correctly
3. **Simple Deployment**: Single `index.html` serves all routes
4. **Cross-Platform**: Works with any static file server

## Drawbacks

1. **URL Aesthetics`: Hash in URL is less clean
2. **SEO Impact**: Search engines may treat hash routes differently
3. **Anchor Linking**: Cannot use traditional page anchors

## Mitigations

1. **URL Aesthetics**: Accept as trade-off for zero-config deployment
2. **SEO**: Application is not SEO-dependent; it's a utility tool
3. **Anchor Linking**: Not needed for this application

## Alternatives Considered

### Alternative 1: Memory Router
- **Pros**: No URL pollution
- **Cons**: Breaks shareability, back button, refresh
- **Rejected**: Shareability is core feature

### Alternative 2: History API with Server Rewrites
- **Pros**: Clean URLs
- **Cons**: Requires server configuration, not compatible with basic static hosting
- **Rejected**: Adds deployment complexity

### Alternative 3: Query Parameter Routing
- **Pros**: Familiar pattern
- **Cons**: Less clean for multi-level routes
- **Rejected**: Hash routing provides better semantic structure
