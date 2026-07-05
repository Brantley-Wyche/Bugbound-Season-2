import LabBeacon from '@/shell/LabBeacon';

/**
 * Shell-owned lab chrome — always bug-free, players never edit this file.
 *
 * The inline script below is rendered into the server HTML, so it executes
 * while the document is still parsing — *before* React hydrates. That lets it
 * capture every console.error the page produces (including React hydration
 * complaints) for the check harness to read via window.__lab.
 */
const CAPTURE_SCRIPT = `
(function () {
  if (window.__lab) return;
  window.__lab = { errors: [] };
  var original = console.error;
  console.error = function () {
    try {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg === 'string') parts.push(arg);
        else if (arg && arg.message) parts.push(String(arg.message));
        else {
          try { parts.push(JSON.stringify(arg)); } catch (e) { parts.push(String(arg)); }
        }
      }
      window.__lab.errors.push(parts.join(' '));
    } catch (e) { /* never break the page from the logger */ }
    return original.apply(console, arguments);
  };
  window.addEventListener('error', function (event) {
    window.__lab.errors.push(String(event.message || event));
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    window.__lab.errors.push(String((reason && reason.message) || reason));
  });
})();
`;

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lab-shell">
      <script dangerouslySetInnerHTML={{ __html: CAPTURE_SCRIPT }} />
      <div className="lab-banner">
        <span className="env-dot" />
        <span>Lab environment · the product under test</span>
      </div>
      <div className="lab-main">{children}</div>
      <LabBeacon />
    </div>
  );
}
