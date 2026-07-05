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

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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

export async function fetchDoc(path: string, init?: RequestInit): Promise<ServerDoc> {
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

export async function fetchJSON(path: string, init?: RequestInit): Promise<JsonResponse> {
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
  waitFor(target: string | (() => boolean), opts?: { timeout?: number }): Promise<void>;
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

const HYDRATION_PATTERNS = [/hydrat/i, /server rendered html/i, /did not match/i];

async function waitForReady(frame: HTMLIFrameElement, timeout: number) {
  const deadline = Date.now() + timeout;
  // Wait for the lab beacon (set in a useEffect in the lab layout) — it fires
  // once React has hydrated, including after a hydration-mismatch client
  // re-render. Fall through on timeout so checks can still report clearly.
  while (Date.now() < deadline) {
    const win = frame.contentWindow as LabWindow | null;
    if (win?.__labHydrated) break;
    await pause(50);
  }
  await pause(150);
}

export async function openPage(path: string, opts?: { timeout?: number }): Promise<LabPage> {
  const timeout = opts?.timeout ?? 8000;
  const frame = document.createElement('iframe');
  frame.style.cssText =
    'position:fixed;top:0;left:-12000px;width:1100px;height:800px;border:0;visibility:hidden;';
  document.body.appendChild(frame);

  await new Promise<void>((resolve) => {
    frame.onload = () => resolve();
    frame.src = path;
    setTimeout(resolve, timeout); // never hang a check on a broken page
  });
  await waitForReady(frame, timeout);

  const win = () => frame.contentWindow as LabWindow;
  const doc = () => {
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

  const errors = () => [...(win().__lab?.errors ?? [])];

  const page: LabPage = {
    get,
    query: (selector) => doc().querySelector(selector),
    all: (selector) => [...doc().querySelectorAll(selector)],
    text: (selector) => (get(selector).textContent ?? '').trim(),
    value: (selector) => (get(selector) as HTMLInputElement).value,
    attr: (selector, name) => get(selector).getAttribute(name),

    async click(selector) {
      (get(selector) as HTMLElement).click();
      await pause(40);
    },

    async type(selector, text) {
      const el = get(selector) as HTMLInputElement;
      for (const ch of text) {
        setNativeValue(el, el.value + ch);
        fireEvent(el, 'input');
        await pause(5);
      }
      await pause(30);
    },

    async selectOption(selector, optionValue) {
      const el = get(selector) as HTMLSelectElement;
      setNativeValue(el, optionValue);
      fireEvent(el, 'change');
      await pause(30);
    },

    async waitFor(target, waitOpts) {
      const limit = Date.now() + (waitOpts?.timeout ?? 5000);
      const check = typeof target === 'string' ? () => !!doc().querySelector(target) : target;
      while (Date.now() < limit) {
        if (check()) return;
        await pause(60);
      }
      throw new Error(
        typeof target === 'string'
          ? `Waited ${waitOpts?.timeout ?? 5000}ms for ${target} to appear on the live page, but it never did.`
          : `Waited ${waitOpts?.timeout ?? 5000}ms for the page to reach the expected state, but it never did.`,
      );
    },

    path: () => win().location.pathname + win().location.search,

    async goto(nextPath) {
      await new Promise<void>((resolve) => {
        frame.onload = () => resolve();
        win().location.assign(nextPath);
        setTimeout(resolve, timeout);
      });
      await waitForReady(frame, timeout);
    },

    errors,
    hydrationErrors: () =>
      errors().filter((message) => HYDRATION_PATTERNS.some((rx) => rx.test(message))),
    title: () => doc().title,
    close: () => frame.remove(),
  };

  return page;
}

/* ---------------------------------------------------------------- *
 * The helper object handed to every check
 * ---------------------------------------------------------------- */

export interface Helpers {
  ok(condition: unknown, message: string): void;
  pause(ms: number): Promise<void>;
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

export async function runCheck(check: {
  name: string;
  run: (h: Helpers) => Promise<void>;
}): Promise<CheckResult> {
  const openPages: LabPage[] = [];

  const helpers: Helpers = {
    ok(condition, message) {
      if (!condition) throw new Error(message);
    },
    pause,
    fetchDoc,
    fetchJSON,
    open: async (path, opts) => {
      const page = await openPage(path, opts);
      openPages.push(page);
      return page;
    },
  };

  try {
    await check.run(helpers);
    return { name: check.name, pass: true };
  } catch (err) {
    return {
      name: check.name,
      pass: false,
      message: String(err instanceof Error ? err.message : err),
    };
  } finally {
    for (const page of openPages) page.close();
  }
}
