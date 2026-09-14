# AJSU Travel Applications Suite

Three browser-based tools for preparing travel reimbursement estimates: mileage,
lodging, and per diem. Each is a single self-contained HTML file that runs
offline, with no server, no account, and no installation.

These produce **planning estimates** to help someone prepare a claim. They are
not an approval, an authorization, or an official record.

---

## What's included

| App | Purpose |
|---|---|
| **`tata`** | Mileage and per diem estimator for a state or municipal travel policy, with a monthly mileage log tracker. |
| **`tito`** | Three-sheet travel packet: travel request and authorization, per diem worksheet, and booking and expense reconciliation. |
| **`toto`** | National estimator using federal GSA per diem rates, with city and ZIP rate lookup, a route distance sheet, and a daily mileage tracker. |

`travel_gateway.html` is a portal that presents all three and launches any of
them in its own tab.

---

## Using it

Open any of `tata.html`, `tito.html`, `toto.html`, or `travel_gateway.html`
directly in a current browser. Double-clicking the file works; a web server is
not required.

**These pages work with no network connection.** Every dependency, including
fonts, is bundled in the file or alongside it, so the tools calculate and print
with the network disconnected.

PDFs come from your browser's own print dialog: choose Print and then Save as
PDF. There is no upload step and no server-side rendering.

### Your data stays on your device

**Nothing you enter leaves your device.** These tools make no analytics,
telemetry, or form-submission calls, so trip details, names, and amounts are
never transmitted anywhere.

Some fields are remembered between visits using your browser's local storage so
you do not have to retype them. That data lives only in that browser on that
device, is never sent anywhere, and clearing your browser data removes it
permanently. There is no server-side copy and no way to recover it.

---

## Rate data and currency

Rates are embedded when the application is built, and they follow **two separate
calendars**:

- **Mileage rates** change on **January 1** (calendar year).
- **Per diem rates** change on **October 1**, the start of the federal fiscal
  year.

October through December therefore uses both at once. This build carries FY2026
per diem rates and CY2026 mileage rates. Between those dates a build's figures
can fall behind the published ones, so **confirm the current rates with the
issuing authority before submitting a claim.**

Per diem calculations follow the Federal Travel Regulation, 41 CFR 301-11.
Meals and incidental expenses are always shown separately, never combined, and
first and last travel days are prorated.

---

## Disclaimers

**No approval authority.** Output from these tools is not supervisor approval,
pre-authorization, or certification of any travel claim. What you are actually
reimbursed is governed by your employer's travel policy and requires
appropriate authorization.

**Not affiliated with any government agency.** Rate data comes from publicly
available publications. These tools are not endorsed by, affiliated with, or
operated by the U.S. General Services Administration, the Internal Revenue
Service, the Department of Defense, the Defense Travel Management Office, or any
other government entity.

**Verify before you file.** Confirm any figure against your own policy and the
current published rates before relying on it.

---

## Building from source

Each app ships as a generated HTML file built from a `.jsx` source of the same
name. Edit the `.jsx`, never the `.html`, because the HTML is generated output
and a hand edit is lost on the next build.

```bash
python build_previews.py    # build the preview pages from the sources
npm run test:all            # the release gate; must pass before anything ships
python promote.py           # runs the gate, then writes the shipping pages
python build_deploy.py      # assemble the publishable payload
```

The build needs Node with `@babel/core`, `@babel/preset-react`, and `esbuild`
resolvable, with `NODE_PATH` pointing at them. `python build_previews.py` prints
what to do if they are missing.

Browser end-to-end tests need Playwright installed separately and are not part
of `test:all`.

---

## Browser support

Any current version of Chrome, Edge, Firefox, or Safari. The pages use no
framework CDN and no build step at run time.

Printing is tuned for US Letter. Page counts are pinned by automated tests, so
the printed documents paginate the same way across builds.

---

## License

No license has been chosen yet. Until one is added, all rights are reserved and
this code is published for reference only.
