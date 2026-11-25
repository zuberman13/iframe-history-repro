# AST-31696 repro site

A static site that mimics the customer's Grafana setup: a menu page that loads
dashboards in an iframe. Both pages rewrite their own address with
`history.replaceState`, the way the customer's menu and Grafana do.

Temporary test material for AST-31696. Not part of the app; do not commit.

## Files

- `index.html` / `menu.js`: the menu page. On load and when a dashboard is picked it
  rewrites its URL to `?kiosk=1&open=/dashboard.html?name=…&orgId=2&from=now/d&to=now/d&timezone=browser`.
  On reload it restores the dashboard named in `open=`.
- `dashboard.html` / `dashboard.js`: the dashboard. Loads with `?name=…&kiosk=1`, then after
  one second adds `orgId=2&from=now-6h&to=now&timezone=browser&refresh=1m` with
  `replaceState`. Buttons trigger a further `replaceState` and a `pushState`.
  If it is ever loaded as the whole page, it shows a red **BUG REPRODUCED** banner.

## Hosting

Any static host the test device can reach works. Quickest, from this folder on a Mac on
the same network:

```sh
python3 -m http.server 8080
```

Then open `http://<mac-ip>:8080/` on the device. The customer uses HTTPS through the
tunnel; if plain HTTP does not reproduce, host the folder on an internal HTTPS server,
ideally one reached through the tunnel.

## Test steps

Run in Safari first (expected to pass), then in Workspace ONE Web with and without the fix.

1. Clear tabs and history in Workspace ONE Web.
2. Open the menu page. Its log shows a `menu replaceState` entry.
3. Tap a dashboard. Within a second the log shows `dashboard replaceState` with the added parameters.
4. Check the address bar: it should show the menu URL with `open=`.
5. Tap the browser's refresh button.
6. Repeat 3–5, then also try: tap the address bar and press Go; switch tabs or background
   the app and come back; tap the dashboard's two buttons before refreshing.

**Pass:** the menu page reloads with the same dashboard open in the frame.
**Bug:** the whole page becomes the dashboard (red banner), and its URL carries the
dashboard's own parameters instead of the menu's.

With the custom build's `[AST-31696]` logging, send the console logs after a failing run.
