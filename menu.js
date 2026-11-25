// Mimics the customer's Grafana "menu" dashboard: it loads other dashboards in an
// iframe and keeps the selected one in its own URL as `open=` via replaceState.
(function () {
  var DASHBOARDS = [
    { path: 'dashboard.html?name=core-banking', label: 'Core banking' },
    { path: 'dashboard.html?name=call-center', label: 'Call center' },
    { path: 'dashboard.html?name=falcon', label: 'Falcon response time' }
  ];

  var frame = document.getElementById('dash');
  var logList = document.getElementById('log');

  function log(source, url) {
    var item = document.createElement('li');
    item.textContent = new Date().toLocaleTimeString() + '  [' + source + ']  ' + url;
    logList.insertBefore(item, logList.firstChild);
  }

  function showUrls() {
    document.getElementById('topUrl').textContent = location.href;
    try {
      document.getElementById('frameUrl').textContent =
        frame.contentWindow && frame.contentWindow.location.href !== 'about:blank'
          ? frame.contentWindow.location.href : '(none)';
    } catch (e) {
      document.getElementById('frameUrl').textContent = '(not readable)';
    }
  }

  // Same normalisation the customer's menu does on load: `kiosk` -> `kiosk=1`,
  // add `open=` and a default time range, keep whatever is already there.
  function normaliseOwnUrl(open) {
    var params = new URLSearchParams(location.search);
    params.set('kiosk', '1');
    params.set('open', open);
    if (!params.has('orgId')) params.set('orgId', '2');
    if (!params.has('from')) params.set('from', 'now/d');
    if (!params.has('to')) params.set('to', 'now/d');
    if (!params.has('timezone')) params.set('timezone', 'browser');
    var url = location.pathname + '?' + decodeURIComponent(params.toString());
    history.replaceState(null, '', url);
    log('menu replaceState', location.href);
    showUrls();
  }

  function openDashboard(path) {
    // Like the customer's menu: the frame gets only `kiosk=1`; the dashboard adds the rest itself.
    frame.src = path + '&kiosk=1';
    normaliseOwnUrl('/' + path);
  }

  DASHBOARDS.forEach(function (d) {
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = d.label;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openDashboard(d.path);
    });
    document.getElementById('links').appendChild(link);
  });

  // The dashboard frame reports its own address changes so they show in the log.
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'dashboard-url') return;
    log('dashboard ' + e.data.how, e.data.url);
    showUrls();
  });

  // On (re)load, restore the dashboard named in `open=`, like the customer's menu does.
  var open = new URLSearchParams(location.search).get('open') || '';
  if (open) {
    frame.src = open.replace(/^\//, '') + '&kiosk=1';
  }
  normaliseOwnUrl(open);
})();
