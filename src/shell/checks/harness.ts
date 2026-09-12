/**
 * Season 2 check harness.
 *
 * Season 1 mounted components client-side with createRoot — that can't
 * exercise server rendering, caching, or hydration. Here every level is a
 * real Next.js route under /lab, and checks get two instruments:
 *
 *  1. `fetchDoc(path)`  — fetches the route like a fresh browser request and
 *     parses the *server-rendered HTML* (pre-hydration) for assertions.
 *  2. `open(path)`      — loads the route in a hidden same-origin iframe,
 *     waits for hydration, then drives the live page with real events and
 *     reads console/hydration errors captured by the lab layout.
 */

function interruptible<T>(
  promise: Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal?.reason);
    signal?.addEventListener('abort', abort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal?.removeEventListener('abort', abort));
  });
}

function pause(ms: number, signal?: AbortSignal) {
  signal?.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, ms);
    const abort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    signal?.addEventListener('abort', abort, { once: true });
  });
}

/* ---------------------------------------------------------------- *
 * Server-output inspection
 * ---------------------------------------------------------------- */

export interface ServerDoc {
  status: number;
  /** Final URL after any redirects the server issued. */
  url: string;
  redirected: boolean;
  html: string;
  doc: Document;
  /** querySelector that throws a readable error when the element is missing. */
  get(selector: string): Element;
  query(selector: string): Element | null;
  all(selector: string): Element[];
  text(selector: string): string;
  attr(selector: string, name: string): string | null;
  title(): string;
}

function wrapDoc(
  doc: Document,
  html: string,
  res: { status: number; url: string; redirected: boolean },
  context: string,
): ServerDoc {
  const get = (selector: string) => {
    const el = doc.querySelector(selector);
    if (!el) {
      throw new Error(
        `Expected the server-rendered HTML of ${context} to contain ${selector}, but it isn't there.`,
      );
    }
    return el;
  };
  return {
    status: res.status,
    url: res.url,
    redirected: res.redirected,
    html,
    doc,
    get,
    query: (selector) => doc.querySelector(selector),
    all: (selector) => [...doc.querySelectorAll(selector)],
    text: (selector) => (get(selector).textContent ?? '').trim(),
    attr: (selector, name) => get(selector).getAttribute(name),
    title: () => (doc.querySelector('title')?.textContent ?? '').trim(),
  };
}

export async function fetchDoc(
  path: string,
  init?: RequestInit,
): Promise<ServerDoc> {
  const res = await fetch(path, { cache: 'no-store', ...init });
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return wrapDoc(doc, html, res, path);
}

export interface JsonResponse {
  status: number;
  ok: boolean;
  headers: Headers;
  /** Parsed body, or null when the body wasn't valid JSON. */
  json: unknown;
}

export async function fetchJSON(
  path: string,
  init?: RequestInit,
): Promise<JsonResponse> {
  const res = await fetch(path, { cache: 'no-store', ...init });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, headers: res.headers, json };
}

/* ---------------------------------------------------------------- *
 * Live-page driving (hidden iframe)
 * ---------------------------------------------------------------- */

interface LabWindow extends Window {
  __labHydrated?: boolean;
  __lab?: { errors: string[] };
}

export interface LabPage {
  /** querySelector that throws a readable error when the element is missing. */
  get(selector: string): Element;
  query(selector: string): Element | null;
  all(selector: string): Element[];
  text(selector: string): string;
  value(selector: string): string;
  attr(selector: string, name: string): string | null;
  click(selector: string): Promise<void>;
  /** Types character-by-character through the native value setter so React's
   *  synthetic onChange fires exactly like real user input. */
  type(selector: string, text: string): Promise<void>;
  selectOption(selector: string, optionValue: string): Promise<void>;
  /** Polls until the selector exists (or a predicate returns true). */
  waitFor(
    target: string | (() => boolean),
    opts?: { timeout?: number },
  ): Promise<void>;
  /** Current pathname + search of the page inside the frame. */
  path(): string;
  /** Full-page navigation inside the frame (waits for load + hydration). */
  goto(path: string): Promise<void>;
  /** All console.error output captured in the lab frame since load. */
  errors(): string[];
  /** Captured errors that look like React hydration complaints. */
  hydrationErrors(): string[];
  title(): string;
  close(): void;
}

const HYDRATION_PATTERNS = [
  /hydrat/i,
  /server rendered html/i,
  /did not match/i,
];

async function waitForReady(
  frame: HTMLIFrameElement,
  timeout: number,
  signal?: AbortSignal,
) {
  const deadline = Date.now() + timeout;
  // The layout beacon establishes instrument readiness, not readiness of
  // streamed content. Checks must still wait for their own page state.
  while (Date.now() < deadline) {
    const win = frame.contentWindow as LabWindow | null;
    if (win?.__labHydrated) {
      if (!Array.isArray(win.__lab?.errors)) {
        throw new Error(
          'Lab console capture is unavailable. Check the dev server and retry.',
        );
      }
      return;
    }
    await pause(50, signal);
  }
  throw new Error(
    'Lab hydration readiness timed out. Check the dev server and retry.',
  );
}

export async function openPage(
  path: string,
  opts?: { timeout?: number; signal?: AbortSignal },
): Promise<LabPage> {
  const timeout = opts?.timeout ?? 8000;
  const signal = opts?.signal;
  signal?.throwIfAborted();
  const frame = document.createElement('iframe');
  const close = () => {
    frame.remove();
    signal?.removeEventListener('abort', close);
  };
  signal?.addEventListener('abort', close, { once: true });
  frame.style.cssText =
    'position:fixed;top:0;left:-12000px;width:1100px;height:800px;border:0;visibility:hidden;';
  document.body.appendChild(frame);

  const navigate = async (action: () => void) => {
    signal?.throwIfAborted();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await interruptible(
        new Promise<void>((resolve, reject) => {
          frame.onload = () => {
            if (frame.contentWindow?.location.href !== 'about:blank') resolve();
          };
          timer = setTimeout(
            () =>
              reject(
                new Error(
                  'Lab navigation timed out. Check the dev server and retry.',
                ),
              ),
            timeout,
          );
          action();
        }),
        signal,
      );
      await waitForReady(frame, timeout, signal);
    } finally {
      clearTimeout(timer);
      frame.onload = null;
    }
  };
  try {
    await navigate(() => {
      frame.src = path;
    });
  } catch (error) {
    close();
    throw error;
  }

  const win = () => {
    signal?.throwIfAborted();
    return frame.contentWindow as LabWindow;
  };
  const doc = () => {
    signal?.throwIfAborted();
    const d = frame.contentDocument;
    if (!d) throw new Error(`The page at ${path} could not be loaded.`);
    return d;
  };

  const get = (selector: string) => {
    const el = doc().querySelector(selector);
    if (!el) {
      throw new Error(
        `Expected to find ${selector} on the live page (${win().location.pathname}), but it isn't there.`,
      );
    }
    return el;
  };

  const setNativeValue = (el: Element, value: string) => {
    const view = el.ownerDocument.defaultView as typeof globalThis & Window;
    const proto = Object.getPrototypeOf(el);
    const descriptor =
      Object.getOwnPropertyDescriptor(proto, 'value') ||
      Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(el, value);
  };

  const fireEvent = (el: Element, type: string) => {
    const view = el.ownerDocument.defaultView as typeof globalThis & Window;
    el.dispatchEvent(new view.Event(type, { bubbles: true }));
  };

  const errors = () => {
    const captured = win().__lab?.errors;
    if (!Array.isArray(captured))
      throw new Error(
        'Lab console capture is unavailable. Check the dev server and retry.',
      );
    return [...captured];
  };

  const page: LabPage = {
    get,
    query: (selector) => doc().querySelector(selector),
    all: (selector) => [...doc().querySelectorAll(selector)],
    text: (selector) => (get(selector).textContent ?? '').trim(),
    value: (selector) => (get(selector) as HTMLInputElement).value,
    attr: (selector, name) => get(selector).getAttribute(name),

    async click(selector) {
      (get(selector) as HTMLElement).click();
      await pause(40, signal);
    },

    async type(selector, text) {
      const el = get(selector) as HTMLInputElement;
      for (const ch of text) {
        setNativeValue(el, el.value + ch);
        fireEvent(el, 'input');
        await pause(5, signal);
      }
      await pause(30, signal);
    },

    async selectOption(selector, optionValue) {
      const el = get(selector) as HTMLSelectElement;
      setNativeValue(el, optionValue);
      fireEvent(el, 'change');
      await pause(30, signal);
    },

    async waitFor(target, waitOpts) {
      const limit = Date.now() + (waitOpts?.timeout ?? 5000);
      const check =
        typeof target === 'string'
          ? () => !!doc().querySelector(target)
          : target;
      while (Date.now() < limit) {
        signal?.throwIfAborted();
        if (check()) return;
        await pause(60, signal);
      }
      throw new Error(
        typeof target === 'string'
          ? `Waited ${waitOpts?.timeout ?? 5000}ms for ${target} to appear on the live page, but it never did.`
          : `Waited ${waitOpts?.timeout ?? 5000}ms for the page to reach the expected state, but it never did.`,
      );
    },

    path: () => win().location.pathname + win().location.search,

    async goto(nextPath) {
      await navigate(() => win().location.assign(nextPath));
    },

    errors,
    hydrationErrors: () =>
      errors().filter((message) =>
        HYDRATION_PATTERNS.some((rx) => rx.test(message)),
      ),
    title: () => doc().title,
    close,
  };

  return page;
}

/* ---------------------------------------------------------------- *
 * The helper object handed to every check
 * ---------------------------------------------------------------- */

export interface Helpers {
  ok(condition: unknown, message: string): void;
  pause(ms: number): Promise<void>;
  /** Poll current server state without assuming a fixed response time. */
  poll(
    predicate: () => boolean | Promise<boolean>,
    opts: { timeout?: number; message: string },
  ): Promise<void>;
  /** Best-effort HTTP cleanup, also attempted after failure or cancellation. */
  cleanupRequest(path: string, init?: RequestInit): void;
  /** Fetch a route and inspect its server-rendered HTML (pre-hydration). */
  fetchDoc(path: string, init?: RequestInit): Promise<ServerDoc>;
  /** Fetch a route handler and inspect status/headers/JSON body. */
  fetchJSON(path: string, init?: RequestInit): Promise<JsonResponse>;
  /** Load a route in a hidden iframe and drive the live, hydrated page. */
  open(path: string, opts?: { timeout?: number }): Promise<LabPage>;
}

export interface CheckResult {
  name: string;
  pass: boolean;
  message?: string;
}

export class LabCleanupError extends Error {
  constructor() {
    super(
      'Lab session cleanup failed. Stop other lab activity and retry the checks.',
    );
    this.name = 'LabCleanupError';
  }
}

export async function runCheck(
  check: {
    name: string;
    run: (h: Helpers) => Promise<void>;
  },
  options: { signal?: AbortSignal; timeout?: number } = {},
): Promise<CheckResult> {
  options.signal?.throwIfAborted();
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([controller.signal, options.signal])
    : controller.signal;
  const timeout = options.timeout ?? 60000;
  const timer = setTimeout(
    () =>
      controller.abort(
        new Error(
          `Check timed out after ${timeout / 1000} seconds. Check the dev server and retry.`,
        ),
      ),
    timeout,
  );
  const openPages: LabPage[] = [];
  const cleanups: { path: string; init?: RequestInit }[] = [];
  let cleanupFailed = false;
  let result: CheckResult = { name: check.name, pass: false };
  const requestInit = (init?: RequestInit): RequestInit => ({
    ...init,
    signal: init?.signal ? AbortSignal.any([signal, init.signal]) : signal,
  });

  const helpers: Helpers = {
    ok(condition, message) {
      if (!condition) throw new Error(message);
    },
    pause: (ms) => pause(ms, signal),
    cleanupRequest(path, init) {
      signal.throwIfAborted();
      cleanups.push({ path, init });
    },
    async poll(predicate, opts) {
      const deadline = Date.now() + (opts.timeout ?? 5000);
      do {
        signal.throwIfAborted();
        if (await interruptible(Promise.resolve().then(predicate), signal))
          return;
        await pause(100, signal);
      } while (Date.now() < deadline);
      throw new Error(opts.message);
    },
    fetchDoc: (path, init) => {
      signal.throwIfAborted();
      return fetchDoc(path, requestInit(init));
    },
    fetchJSON: (path, init) => {
      signal.throwIfAborted();
      return fetchJSON(path, requestInit(init));
    },
    open: async (path, opts) => {
      const page = await openPage(path, { ...opts, signal });
      openPages.push(page);
      return page;
    },
  };

  try {
    await interruptible(
      Promise.resolve().then(() => {
        signal.throwIfAborted();
        return check.run(helpers);
      }),
      signal,
    );
    signal.throwIfAborted();
    result = { name: check.name, pass: true };
  } catch (err) {
    result = {
      name: check.name,
      pass: false,
      message: String(err instanceof Error ? err.message : err),
    };
  } finally {
    clearTimeout(timer);
    controller.abort();
    for (const page of openPages) page.close();
    // A stopped check cannot reuse its aborted signal for cookie cleanup.
    // Cleanup is bounded and cannot undo a mutation already accepted by the server.
    for (const { path, init } of cleanups.reverse()) {
      try {
        const response = await fetchJSON(path, {
          ...init,
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } catch {
        cleanupFailed = true;
        result = {
          name: check.name,
          pass: false,
          message: `${result.message ? result.message + ' ' : ''}Lab session cleanup failed. Stop other lab activity and retry the checks.`,
        };
      }
    }
  }
  if (options.signal?.aborted) {
    if (cleanupFailed) throw new LabCleanupError();
    options.signal.throwIfAborted();
  }
  return result;
}
