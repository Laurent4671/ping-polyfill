# ping-polyfill

Deterministic, non-blocking, and privacy-friendly polyfill for the HTML5 a[ping] attribute.
Prioritizes navigator.sendBeacon, falls back to fetch(keepalive), respects referrerpolicy, and uses no cookies or storage.


# Usage

IIFE (auto-init):
<script src="dist/ping-polyfill.iife.js" defer></script>
<a href="https://example.org" ping="/ping">Visit</a>


# Quick test

Open Developer Tools → Network tab, click the link above, and observe POST requests to /ping.
Navigation remains non-blocking.


# License

MIT
