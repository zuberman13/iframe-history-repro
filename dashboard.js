// Mimics a Grafana kiosk dashboard: it loads with only `kiosk=1` and then fills in
// its defaults with history.replaceState, without reloading.
(function () {
  var params = new URLSearchParams(location.search);
  var isTopLevel = window.top === window;

  document.getElementById('name').textContent = 'Dashboard: ' + (params.get('name') || '?');
  document.getElementById('bug').hidden = !isTopLevel;

  function report(how) {
    document.getElementById('url').textContent = location.href;
    if (!isTopLevel) {
      window.parent.postMessage({ type: 'dashboard-url', how: how, url: location.href }, location.origin);
    }
  }

  function setParams(changes, how) {
    var next = new URLSearchParams(location.search);
    Object.keys(changes).forEach(function (key) { next.set(key, changes[key]); });
    var url = location.pathname + '?' + decodeURIComponent(next.toString());
    if (how === 'pushState') {
      history.pushState(null, '', url);
    } else {
      history.replaceState(null, '', url);
    }
    report(how);
  }

  report('load');

  // Grafana adds its defaults shortly after load; the delay makes the change visible.
  setTimeout(function () {
    setParams({ orgId: '2', from: 'now-6h', to: 'now', timezone: 'browser', refresh: '1m' }, 'replaceState');
  }, 1000);

  document.getElementById('replace').addEventListener('click', function () {
    setParams({ from: 'now-12h' }, 'replaceState');
  });
  document.getElementById('push').addEventListener('click', function () {
    setParams({ viewPanel: 'panel-1' }, 'pushState');
  });
})();
