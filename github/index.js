// Preserves the query string (e.g. ?build=preview) that the meta-refresh
// fallback in index.html cannot carry. Externalized from an inline <script>
// so this page can ship a strict script-src CSP with no 'unsafe-inline'.
location.replace('travel_gateway.html' + location.search);
