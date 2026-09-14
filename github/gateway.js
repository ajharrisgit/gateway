// Externalized from an inline <script> in travel_gateway.html so this page
// can ship a strict script-src CSP with no 'unsafe-inline'. The onclick=""
// attributes that used to call switchApp/showPolicy/hidePolicy directly were
// removed for the same reason -- an inline event-handler attribute is inline
// script as far as a CSP is concerned -- and replaced with the delegated
// listeners below, keyed off data-app / data-policy attributes.

// The gateway serves the deployable builds by default. Adding ?build=preview
// to the URL swaps in the preview_*.html bundles so the same page doubles as
// the dev and test harness without a second copy of this file to keep in sync.
var usePreview = new URLSearchParams(location.search).get('build') === 'preview';
var currentApp = 'tata';

function srcFor(app) {
  return (usePreview ? 'preview_' + app : app) + '.html';
}

function switchApp(app, btn) {
  currentApp = app;
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var src = srcFor(app);
  document.getElementById('app-frame').src = src;
  document.getElementById('direct-link').href = src;
}

document.querySelectorAll('.tab-btn[data-app]').forEach(function (btn) {
  btn.addEventListener('click', function () { switchApp(btn.dataset.app, btn); });
});

if (usePreview) {
  document.title = 'AJSU Travel Gateway (preview builds)';
  switchApp('tata', document.querySelector('.tab-btn[data-app="tata"]'));
}

// Terms, Privacy and Disclaimer. The same three documents, under the same three
// names, ship in every app in the suite. Only the paragraph naming what is stored
// differs, because the gateway itself stores nothing and each app stores its own.
//
// Every claim here has to be true of the deployed page. Two rules are easy to break:
//   - Say "nothing you enter leaves your device", not "no data is transmitted".
//     Every asset this page uses is bundled and served from this same site, so
//     unlike an app that still fetched fonts or a library from a CDN, this page
//     makes no request to any other host at all.
//   - Rate currency is stated as the two calendars the rates actually follow,
//     never as a fixed month. A hardcoded "current as of" date is wrong the day
//     after it is written and cannot be checked by anything in the test suite.
var POLICY_DOCS = {
  terms: { title: 'Terms of Service', body: [
    ['What this is', 'The AJSU Travel Applications Suite is a set of travel reimbursement planning tools maintained by AJSU. Using it means you accept these terms.'],
    ['Permitted use', 'These tools are for internal planning. Do not represent their output as a government document, as an approved claim, or as a record of one.'],
    ['Your responsibility', "You are responsible for checking every figure against your agency's travel policy before you submit a claim, and for confirming the rates against the issuing authority."],
    ['No warranty', 'These applications are provided as is, with no express or implied warranty, including any warranty of accuracy, completeness, or fitness for a particular purpose.'],
    ['Limitation of liability', 'AJSU is not liable for any error or omission in an estimate, or for any claim, loss, or damage arising from use of these tools.'],
    ['Changes', 'These terms may change when the applications are rebuilt. The rate data each build carries is named in the Disclaimer.'],
    ['Contact', 'Direct questions about these applications to the AJSU development team.'],
  ]},
  privacy: { title: 'Privacy Notice', body: [
    ['Nothing you enter leaves your device', 'These applications send no analytics, no telemetry, and no form submissions. What you type stays in your browser.'],
    ['What is stored, and where', "This gateway stores nothing. Each application opened from it keeps its own entries in your browser's local storage on this device, and each one's Privacy Notice names exactly what it keeps."],
    ['How to remove it', "Clearing your browser's site data for this page removes everything the applications have stored. There is no copy on a server and no backup, so removing it is permanent. Export anything you want to keep first."],
    ['Requests this page makes', 'Every file this page uses -- its interface library, its typefaces, and its icons -- is bundled with it and served from this same site. It makes no request to any other host.'],
    ['What not to put here', 'Enter only what a travel reimbursement needs. Do not use these tools to hold sensitive personal information beyond that.'],
  ]},
  disclaimer: { title: 'Disclaimer', body: [
    ['Planning estimates only', 'These tools produce estimates for travel reimbursement planning. They do not produce travel vouchers, authorization documents, or agency records, and their output is not a reimbursement determination.'],
    ['No approval authority', "Output from these tools is not supervisor approval, pre-authorization, or certification of any travel claim. What you are actually reimbursed is governed by your agency's travel policy and requires appropriate authorization."],
    ['Not affiliated with any government agency', 'Rate data comes from publicly available publications. These tools are not endorsed by, affiliated with, or operated by the U.S. General Services Administration, the Internal Revenue Service, the Department of Defense, the Defense Travel Management Office, the State of Colorado, or any other government entity.'],
    ['Rate currency', 'Rates are embedded when the applications are built, and they follow two separate calendars. Mileage rates change on January 1. Per diem rates change on October 1, the start of the federal fiscal year. These builds carry FY2026 per diem rates and CY2026 mileage rates, so between those dates their figures can fall behind the published ones. Confirm the current rates with the issuing authority before you submit a claim.'],
    ['Basis of calculation', 'Calculations follow the Federal Travel Regulation at 41 CFR 301-11. Meals and incidental expenses are stated separately throughout, and first and last travel days are prorated.'],
  ]},
};

var policyOverlay = document.getElementById('policy-overlay');
// Remembered so closing returns focus where it came from. Without it the
// modal opened with focus still on the footer button behind it, and closing
// dropped focus to the top of the document.
var policyOpener = null;

function showPolicy(key) {
  var doc = POLICY_DOCS[key];
  if (!doc) return;
  document.getElementById('policy-title').textContent = doc.title;
  var body = document.getElementById('policy-body');
  // Built as text nodes rather than innerHTML so the copy is never parsed as markup.
  body.textContent = '';
  doc.body.forEach(function (pair) {
    var p = document.createElement('p');
    var b = document.createElement('strong');
    b.textContent = pair[0] + '.';
    p.appendChild(b);
    p.appendChild(document.createTextNode(' ' + pair[1]));
    body.appendChild(p);
  });
  policyOpener = document.activeElement;
  policyOverlay.classList.add('open');
  policyOverlay.querySelector('#policy-actions button').focus();
}

function hidePolicy() {
  policyOverlay.classList.remove('open');
  if (policyOpener) { policyOpener.focus(); policyOpener = null; }
}

document.querySelectorAll('.policy-bar [data-policy]').forEach(function (btn) {
  btn.addEventListener('click', function () { showPolicy(btn.dataset.policy); });
});
document.getElementById('policy-close').addEventListener('click', hidePolicy);
policyOverlay.addEventListener('click', function (e) {
  if (e.target === policyOverlay) hidePolicy();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && policyOverlay.classList.contains('open')) hidePolicy();
});

// Registered only over http(s). On file:/// there is no service worker at
// all -- navigator.serviceWorker is undefined in some browsers and
// register() rejects with a SecurityError in others -- and the pages must
// keep working double-clicked, which is the whole point of vendoring the
// runtime and the typefaces. The .catch is not optional: an unhandled
// rejection here would surface in the console of a page that is otherwise
// clean, and a failed registration is not a reason to degrade the page.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () { /* offline caching unavailable */ });
  });
}
