/* Onboarding kit runtime: site chrome, code links, highlighting, diagrams, quizzes, tabs.
   Pages load the generated site.js first, then this file with `defer`. */
(() => {
  "use strict";

  const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.esm.min.mjs";
  const HLJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js";
  const ELISION = /^\s*(?:…|\.\.\.|(?:\/\/|#|--|;|\*)\s*(?:…|\.\.\.)|\/\*\s*(?:…|\.\.\.)\s*\*\/|<!--\s*(?:…|\.\.\.)\s*-->|\{\/\*\s*(?:…|\.\.\.)\s*\*\/\})\s*$/;
  const LANGUAGES = {
    ts: "typescript", tsx: "typescript", mts: "typescript", cts: "typescript", js: "javascript", jsx: "javascript",
    mjs: "javascript", cjs: "javascript", html: "xml", htm: "xml", xml: "xml", svg: "xml", njk: "xml", vue: "xml",
    csproj: "xml", scss: "scss", css: "css", less: "less", json: "json", yml: "yaml", yaml: "yaml", py: "python",
    cs: "csharp", go: "go", java: "java", kt: "kotlin", rb: "ruby", rs: "rust", sh: "bash", bash: "bash",
    graphql: "graphql", gql: "graphql", sql: "sql", md: "markdown", php: "php", swift: "swift", ini: "ini", toml: "ini",
  };
  const DIAGRAM_CLASSES = { accent: ["--accent-soft", "--accent"], muted: ["--surface-2", "--line"], danger: ["--gotcha-soft", "--gotcha"], new: ["--note-soft", "--note"] };
  const DIAGRAM_SHAPES = ["rect", "polygon", "circle", "ellipse", "path"];
  const ACTIVE_HEADING_OFFSET = 140;
  const COPIED_FEEDBACK_MS = 1400;

  const config = window.ONBOARDING_CONFIG || {};
  const pages = window.ONBOARDING_PAGES || [];
  const script = document.currentScript;
  const siteRoot = new URL("../", script ? script.src : location.href);
  const here = location.href.split("#")[0].split("?")[0];
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const store = {
    get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* storage blocked: keep the in-memory choice */ } },
  };

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
      else if (value !== false && value != null) node.setAttribute(key, value === true ? "" : value);
    }
    node.append(...children.filter((child) => child != null && child !== false));
    return node;
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = src;
    tag.onload = resolve;
    tag.onerror = reject;
    document.head.append(tag);
  });

  const cleanTitle = (title) => (config.repo ? title.replace(new RegExp(`\\s+[—–|-]\\s+${config.repo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "") : title);
  const pageHref = (page) => new URL(page.path, siteRoot).href;

  // ── theme ────────────────────────────────────────────────────────────
  const currentTheme = () => document.documentElement.dataset.theme || (prefersDark.matches ? "dark" : "light");
  function setTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    if (persist) store.set("onboarding-theme", theme);
    renderDiagrams();
  }

  // ── code references ──────────────────────────────────────────────────
  const linkModes = { editor: Boolean(config.editor), web: Boolean(config.web) };
  let linkMode = store.get("onboarding-links");
  if (!linkModes[linkMode]) linkMode = linkModes.editor ? "editor" : linkModes.web ? "web" : null;

  function parseSrc(src) {
    const match = /^(.+?)(?::(\d+)(?:-(\d+))?)?$/.exec((src || "").trim());
    if (!match) return null;
    const start = match[2] ? Number(match[2]) : null;
    return { path: match[1].replace(/^\.\//, ""), start, end: match[3] ? Number(match[3]) : start };
  }

  const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");
  const pageCommit = () => document.querySelector('meta[name="onboarding:commit"]')?.content || config.commit || "";

  function webHref({ path, start, end, commit }) {
    const web = config.web;
    if (!web) return null;
    const sha = commit || pageCommit();
    const multi = start && end > start;
    switch (web.kind) {
      case "github": return `${web.base}/blob/${sha}/${encodePath(path)}${start ? `#L${start}${multi ? `-L${end}` : ""}` : ""}`;
      case "gitlab": return `${web.base}/-/blob/${sha}/${encodePath(path)}${start ? `#L${start}${multi ? `-${end}` : ""}` : ""}`;
      case "bitbucket": return `${web.base}/src/${sha}/${encodePath(path)}${start ? `#lines-${start}${multi ? `:${end}` : ""}` : ""}`;
      case "azure": {
        const query = new URLSearchParams({ path: `/${path}`, version: `GC${sha}`, _a: "contents" });
        if (start) {
          query.set("line", start);
          query.set("lineEnd", end + 1);
          query.set("lineStartColumn", 1);
          query.set("lineEndColumn", 1);
          query.set("lineStyle", "plain");
        }
        return `${web.base}?${query}`;
      }
      default: return null;
    }
  }

  const editorHref = ({ path, start }) => (config.editor
    ? `${config.editorScheme || "vscode"}://${config.editor}/${encodePath(path)}${start ? `:${start}` : ""}` : null);
  // A reference pinned to an old commit opens that version on the web host; the editor only has today's file.
  const codeHref = (ref) => (linkMode === "web" || ref.commit ? webHref(ref) || editorHref(ref) : editorHref(ref));

  function updateCodeLinks() {
    for (const node of document.querySelectorAll("[data-src]")) {
      const ref = parseSrc(node.dataset.src);
      const anchor = node.matches("a") ? node : node.querySelector(".code-head a");
      if (!ref || !anchor) continue;
      ref.commit = node.dataset.commit || "";
      const href = codeHref(ref);
      if (href) {
        anchor.href = href;
        anchor.title = `${node.dataset.src} — opens in ${linkMode === "web" ? "the browser" : "your editor"}`;
      } else {
        anchor.removeAttribute("href");
      }
    }
  }

  function fillInlineSources() {
    for (const anchor of document.querySelectorAll("a.src[data-src]")) {
      if (anchor.textContent.trim()) continue;
      const ref = parseSrc(anchor.dataset.src);
      anchor.textContent = ref ? `${ref.path.split("/").pop()}${ref.start ? `:${ref.start}` : ""}` : anchor.dataset.src;
    }
  }

  function copyButton(getText, label = "Copy") {
    const button = el("button", { class: "copy-btn", type: "button" }, label);
    button.addEventListener("click", async () => {
      const text = getText();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = el("textarea", { style: "position:fixed;opacity:0" });
        area.value = text;
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = label; }, COPIED_FEEDBACK_MS);
    });
    return button;
  }

  function enhanceCodeFigures() {
    for (const figure of document.querySelectorAll("figure.code")) {
      const pre = figure.querySelector("pre");
      const code = pre && pre.querySelector("code");
      if (!code || figure.querySelector(".code-head")) continue;
      if (!code.children.length) code.textContent = code.textContent.replace(/^\n/, "").replace(/\n\s*$/, "");
      const ref = parseSrc(figure.dataset.src || "");
      const extension = ref ? ref.path.split(".").pop().toLowerCase() : "";
      if (LANGUAGES[extension] && ![...code.classList].some((name) => name.startsWith("language-"))) code.classList.add(`language-${LANGUAGES[extension]}`);
      const head = el("div", { class: "code-head" });
      if (ref) {
        const lines = ref.start ? (ref.end > ref.start ? `L${ref.start}–${ref.end}` : `L${ref.start}`) : "";
        head.append(el("a", {}, el("bdi", { text: ref.path })), el("span", { class: "lines", text: lines }));
        if (figure.dataset.commit) head.append(el("span", { class: "lines", text: `@ ${figure.dataset.commit.slice(0, 10)}` }));
      }
      head.append(el("span", { class: "spacer" }), copyButton(() => code.textContent));
      figure.insertBefore(head, pre);
    }
  }

  function parseLineList(spec) {
    const lines = new Set();
    for (const part of spec.split(",").map((p) => p.trim()).filter(Boolean)) {
      const [from, to] = part.split("-").map(Number);
      for (let n = from; n <= (to || from); n++) lines.add(n);
    }
    return lines;
  }

  function addGutters() {
    for (const figure of document.querySelectorAll("figure.code[data-src]")) {
      const ref = parseSrc(figure.dataset.src);
      const pre = figure.querySelector("pre");
      const code = pre && pre.querySelector("code");
      if (!ref || !ref.start || !code || pre.querySelector(".gutter")) continue;
      const lines = code.textContent.replace(/\n$/, "").split("\n");
      if (lines.some((line) => ELISION.test(line))) continue;
      pre.prepend(el("span", { class: "gutter", "aria-hidden": "true", text: lines.map((_, i) => ref.start + i).join("\n") }));
      const marked = parseLineList(figure.dataset.hl || "");
      const lineHeight = parseFloat(getComputedStyle(code).lineHeight);
      for (const number of marked) {
        const index = number - ref.start;
        if (index < 0 || index >= lines.length || !lineHeight) continue;
        pre.append(el("span", { class: "hl-band", style: `top:${code.offsetTop + index * lineHeight}px;height:${lineHeight}px` }));
      }
    }
  }

  async function highlightCode() {
    const blocks = [...document.querySelectorAll("pre > code")].filter((code) => !code.classList.contains("nohighlight"));
    if (!blocks.length) return;
    try {
      if (!window.hljs) await loadScript(HLJS_URL);
    } catch {
      return;
    }
    window.hljs.configure({ ignoreUnescapedHTML: true });
    for (const code of blocks) {
      if (code.dataset.highlighted) continue;
      try { window.hljs.highlightElement(code); } catch { /* leave the block plain */ }
    }
  }

  // ── diagrams ─────────────────────────────────────────────────────────
  let mermaidModule = null;
  let renderGeneration = 0;

  function diagramCss(token) {
    return Object.entries(DIAGRAM_CLASSES).map(([name, [fill, stroke]]) => DIAGRAM_SHAPES
      .map((shape) => `.node.${name} ${shape}`).join(", ")
      + ` { fill: ${token(fill)} !important; stroke: ${token(stroke)} !important; stroke-width: 1.5px !important; }`).join("\n")
      + `\n.node.muted .nodeLabel { color: ${token("--muted")} !important; }`
      + `\n.node.new rect, .node.new polygon { stroke-dasharray: 5 3; }`;
  }

  function showDiagramError(block, message, error) {
    block.dataset.rendered = "error";
    block.replaceChildren(el("div", { class: "diagram-error" },
      el("strong", { text: message }),
      el("pre", { text: String((error && error.message) || error || "") }),
      el("details", {}, el("summary", { text: "Diagram source" }), el("pre", { text: block.dataset.source || "" }))));
  }

  async function renderDiagrams() {
    const blocks = [...document.querySelectorAll(".mermaid")];
    if (!blocks.length) return;
    for (const block of blocks) if (block.dataset.source == null) block.dataset.source = block.textContent.trim();
    const generation = ++renderGeneration;
    try {
      mermaidModule = mermaidModule || (await import(MERMAID_URL)).default;
    } catch (error) {
      blocks.forEach((block) => showDiagramError(block, "Mermaid could not load. Are you offline?", error));
      return;
    }
    if (generation !== renderGeneration) return;
    const styles = getComputedStyle(document.documentElement);
    const token = (name) => styles.getPropertyValue(name).trim();
    mermaidModule.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "base",
      darkMode: currentTheme() === "dark",
      fontFamily: token("--font-body"),
      themeCSS: diagramCss(token),
      themeVariables: {
        fontFamily: token("--font-body"), fontSize: "14px", background: token("--surface"),
        primaryColor: token("--surface"), primaryBorderColor: token("--accent"), primaryTextColor: token("--ink"),
        secondaryColor: token("--accent-soft"), secondaryBorderColor: token("--accent"), secondaryTextColor: token("--ink"),
        tertiaryColor: token("--surface-2"), tertiaryBorderColor: token("--line"), tertiaryTextColor: token("--ink"),
        lineColor: token("--ink-2"), textColor: token("--ink"), mainBkg: token("--surface"), nodeBorder: token("--accent"),
        clusterBkg: token("--surface-2"), clusterBorder: token("--line"), edgeLabelBackground: token("--surface"),
        titleColor: token("--ink"), noteBkgColor: token("--warn-soft"), noteTextColor: token("--ink"), noteBorderColor: token("--warn"),
        actorBkg: token("--surface"), actorBorder: token("--accent"), actorTextColor: token("--ink"), actorLineColor: token("--muted"),
        signalColor: token("--ink-2"), signalTextColor: token("--ink"), labelBoxBkgColor: token("--surface-2"),
        labelBoxBorderColor: token("--line"), labelTextColor: token("--ink"), loopTextColor: token("--ink"),
        activationBkgColor: token("--accent-soft"), activationBorderColor: token("--accent"), sequenceNumberColor: token("--accent-ink"),
        attributeBackgroundColorOdd: token("--surface"), attributeBackgroundColorEven: token("--surface-2"),
      },
      flowchart: { htmlLabels: true, curve: "basis", padding: 12 },
      sequence: { mirrorActors: false, actorFontSize: 14, messageFontSize: 14, noteFontSize: 13 },
    });
    let failures = 0;
    for (const [index, block] of blocks.entries()) {
      const id = `onboarding-diagram-${generation}-${index}`;
      try {
        const { svg, bindFunctions } = await mermaidModule.render(id, block.dataset.source);
        if (generation !== renderGeneration) return;
        block.innerHTML = svg;
        if (bindFunctions) bindFunctions(block);
        block.dataset.rendered = "true";
      } catch (error) {
        failures += 1;
        showDiagramError(block, "This diagram failed to render.", error);
        document.getElementById(id)?.remove();
        document.getElementById(`d${id}`)?.remove();
      }
    }
    document.body.dataset.diagramErrors = String(failures);
  }

  // ── chrome ───────────────────────────────────────────────────────────
  function slugify(text, taken) {
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    let slug = base;
    for (let n = 2; taken.has(slug) || document.getElementById(slug); n++) slug = `${base}-${n}`;
    taken.add(slug);
    return slug;
  }

  function buildToc(main, toc) {
    const headings = [...main.querySelectorAll("section > h2, section > h3")].filter((h) => !h.closest(".quiz, .exercise, .card, .tabs"));
    if (headings.length < 2) {
      toc.remove();
      return;
    }
    const taken = new Set();
    const links = [];
    toc.append(el("span", { text: "On this page" }));
    for (const heading of headings) {
      const label = heading.textContent.trim();
      if (!heading.id) heading.id = slugify(label, taken);
      heading.append(el("a", { class: "heading-anchor", href: `#${heading.id}`, "aria-label": "Link to this section" }, "#"));
      const link = el("a", { href: `#${heading.id}`, class: heading.tagName === "H3" ? "sub" : "" }, label);
      links.push([heading, link]);
      toc.append(link);
    }
    let frame = 0;
    const markActive = () => {
      frame = 0;
      let active = links[0];
      for (const pair of links) if (pair[0].getBoundingClientRect().top < ACTIVE_HEADING_OFFSET) active = pair;
      links.forEach(([, link]) => link.classList.toggle("active", link === active[1]));
    };
    window.addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(markActive); }, { passive: true });
    markActive();
  }

  function buildPageNav(main) {
    const current = pages.find((page) => pageHref(page) === here);
    if (!current) return;
    const siblings = pages.filter((page) => page.group === current.group);
    const position = siblings.indexOf(current);
    const [previous, next] = [siblings[position - 1], siblings[position + 1]];
    if (!previous && !next) return;
    main.append(el("nav", { class: "page-nav", "aria-label": "Previous and next page" },
      previous && el("a", { class: "prev", href: pageHref(previous) }, el("small", { text: "Previous" }), cleanTitle(previous.title)),
      next && el("a", { class: "next", href: pageHref(next) }, el("small", { text: "Next" }), cleanTitle(next.title))));
  }

  function buildVerificationStrip(main) {
    const current = pages.find((page) => pageHref(page) === here);
    const head = main.querySelector(".page-head");
    const check = current && current.check;
    if (!check || !head) return;
    const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
    let tone = "ok";
    let text = `Checked ${check.checked}: ${plural(check.citations, "code reference")} resolve`
      + `${check.excerpts ? ` and ${plural(check.excerpts, "excerpt")} match the source` : ""} at ${(check.head || "").slice(0, 10)}.`;
    if (check.errors) {
      tone = "bad";
      text = `${plural(check.errors, "broken reference")} found on ${check.checked} — ask Claude to refresh this page.`;
    } else if (check.stale && check.stale.length) {
      tone = "warn";
      text = `${plural(check.stale.length, "cited file")} changed since this page was written — claims about them may be out of date.`;
    }
    head.append(el("p", { class: `verified ${tone}` }, text));
  }

  function buildChrome() {
    const main = document.querySelector("main.page");
    if (!main || document.querySelector(".layout")) return;
    const hubHref = new URL("index.html", siteRoot).href;
    const modeButtons = ["editor", "web"].map((mode) => el("button", {
      type: "button", "data-mode": mode, "aria-pressed": String(mode === linkMode), disabled: !linkModes[mode],
      title: mode === "editor" ? "Open code references in your editor" : "Open code references in the repository's web UI",
      onclick: () => {
        linkMode = mode;
        store.set("onboarding-links", mode);
        modeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
        updateCodeLinks();
      },
    }, mode === "editor" ? "Editor" : "Web"));
    const topbar = el("header", { class: "topbar" },
      el("button", { class: "icon-btn nav-toggle", type: "button", "aria-label": "Toggle navigation", onclick: () => document.body.classList.toggle("nav-open") }, "☰"),
      el("a", { class: "brand", href: hubHref },
        el("span", { class: "brand-mark", "aria-hidden": "true", text: (config.repo || "o").slice(0, 1).toUpperCase() }),
        el("span", {}, config.repo || "Onboarding", " ", el("small", { text: "onboarding" }))),
      el("span", { class: "spacer" }),
      el("div", { class: "toolbar-group" }, el("span", { text: "Code opens in" }), el("div", { class: "seg", role: "group", "aria-label": "Open code in" }, ...modeButtons)),
      el("button", { class: "icon-btn", type: "button", "aria-label": "Toggle light or dark theme", title: "Toggle light or dark theme",
        onclick: () => setTheme(currentTheme() === "dark" ? "light" : "dark", true) }, "◐"));

    const sidebar = el("nav", { class: "sidebar", "aria-label": "Onboarding pages" },
      el("a", { href: hubHref, "aria-current": here === hubHref ? "page" : false }, "Overview"));
    const groups = new Map();
    for (const page of pages) {
      if (!groups.has(page.group)) groups.set(page.group, []);
      groups.get(page.group).push(page);
    }
    for (const [group, members] of groups) {
      const box = el("div", { class: "nav-group" }, el("span", { text: group }));
      const references = members.filter((page) => page.kind === "reference");
      for (const page of members.filter((p) => p.kind !== "reference")) {
        box.append(el("a", { href: pageHref(page), "aria-current": pageHref(page) === here ? "page" : false }, cleanTitle(page.title)));
      }
      if (references.length) {
        box.append(el("div", { class: "nav-sub" }, ...references.map((page) => el("a", { href: pageHref(page), "aria-current": pageHref(page) === here ? "page" : false }, cleanTitle(page.title)))));
      }
      sidebar.append(box);
    }

    const toc = el("nav", { class: "toc", "aria-label": "On this page" });
    const content = el("div", { class: "content" });
    const layout = el("div", { class: "layout" }, sidebar, content);
    main.replaceWith(layout);
    content.append(main, toc);
    document.body.prepend(topbar);
    buildVerificationStrip(main);
    buildToc(main, toc);
    buildPageNav(main);
    const commit = pageCommit();
    main.append(el("footer", { class: "page-foot" },
      commit ? `Generated from ${config.repo || "the repository"} at ${commit.slice(0, 10)}. ` : "",
      "Line numbers drift as the code changes — run onboarding.py check to find stale references."));
  }

  // ── learning widgets ─────────────────────────────────────────────────
  function setupQuizzes() {
    const quizzes = [...document.querySelectorAll(".quiz")];
    if (!quizzes.length) return;
    const results = [];
    const score = el("b", { text: `0 / ${quizzes.length}` });
    const refresh = () => { score.textContent = `${results.filter((r) => r.chosen && r.chosen === r.correct).length} / ${quizzes.length}`; };
    quizzes.forEach((quiz, quizIndex) => {
      const question = quiz.querySelector(".q");
      if (question) question.dataset.number = `Q${quizIndex + 1}`;
      const options = [...quiz.querySelectorAll(":scope > ol > li, :scope > ul > li")];
      const result = {
        question: question ? question.textContent.trim() : `Question ${quizIndex + 1}`,
        correct: (options.find((o) => o.hasAttribute("data-correct")) || { textContent: "" }).textContent.trim(),
        chosen: null,
      };
      results.push(result);
      for (const option of options) {
        option.tabIndex = 0;
        option.setAttribute("role", "button");
        const choose = () => {
          if (quiz.classList.contains("answered")) return;
          quiz.classList.add("answered");
          result.chosen = option.textContent.trim();
          options.forEach((o) => o.hasAttribute("data-correct") && o.classList.add("correct"));
          if (!option.hasAttribute("data-correct")) option.classList.add("wrong");
          refresh();
        };
        option.addEventListener("click", choose);
        option.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); }
        });
      }
    });
    const report = () => [`Quiz results — ${cleanTitle(document.title)}`, ...results.map((r, i) => {
      const verdict = r.chosen == null ? "skipped" : r.chosen === r.correct ? "✓" : `✗ chose "${r.chosen}" (answer: "${r.correct}")`;
      return `Q${i + 1} ${verdict} — ${r.question}`;
    })].join("\n");
    quizzes[quizzes.length - 1].after(el("div", { class: "quiz-summary" },
      el("span", { text: "Score" }), score, el("span", { class: "spacer" }), copyButton(report, "Copy results for Claude")));
  }

  const SELF_CHECK_LEVELS = [["know", "Know it"], ["fuzzy", "Fuzzy"], ["new", "New to me"]];

  function setupSelfChecks() {
    document.querySelectorAll(".selfcheck").forEach((list, listIndex) => {
      const key = `onboarding-selfcheck:${location.pathname}:${listIndex}`;
      let state = {};
      try { state = JSON.parse(store.get(key) || "{}"); } catch { state = {}; }
      const items = [...list.children].filter((child) => child.tagName === "LI");
      const labelOf = (item) => {
        const copy = item.cloneNode(true);
        copy.querySelector(".levels")?.remove();
        return copy.textContent.trim().replace(/\s+/g, " ");
      };
      items.forEach((item, i) => {
        const id = item.dataset.id || String(i);
        const buttons = SELF_CHECK_LEVELS.map(([level, text]) => el("button", {
          type: "button", "data-level": level, "aria-pressed": String(state[id] === level),
          onclick: () => {
            state[id] = state[id] === level ? undefined : level;
            store.set(key, JSON.stringify(state));
            buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.level === state[id])));
            item.dataset.level = state[id] || "";
          },
        }, text));
        item.append(el("span", { class: "levels", role: "group", "aria-label": "How well do you know this?" }, ...buttons));
        item.dataset.level = state[id] || "";
      });
      const summary = () => {
        const byLevel = { know: [], fuzzy: [], new: [] };
        items.forEach((item, i) => {
          const level = state[item.dataset.id || String(i)];
          if (level) byLevel[level].push(labelOf(item));
        });
        return [`Self-check — ${cleanTitle(document.title)}`,
          `Know it: ${byLevel.know.join("; ") || "—"}`,
          `Fuzzy: ${byLevel.fuzzy.join("; ") || "—"}`,
          `New to me: ${byLevel.new.join("; ") || "—"}`,
          list.dataset.prompt || "Use this to decide what to explain next."].join("\n");
      };
      list.after(el("div", { class: "selfcheck-actions" }, copyButton(summary, "Copy for Claude")));
    });
  }

  function setupPrompts() {
    for (const prompt of document.querySelectorAll(".prompt")) {
      const text = prompt.textContent.trim();
      prompt.append(copyButton(() => text));
    }
  }

  function setupTabs() {
    document.querySelectorAll(".tabs").forEach((tabs, tabsIndex) => {
      const panels = [...tabs.children].filter((child) => child.matches("section[data-tab]"));
      if (!panels.length) return;
      const list = el("div", { class: "tablist", role: "tablist" });
      const select = (selected) => panels.forEach((panel, i) => {
        panel.hidden = i !== selected;
        list.children[i].setAttribute("aria-selected", String(i === selected));
      });
      panels.forEach((panel, i) => {
        panel.id = panel.id || `tabs-${tabsIndex}-${i}`;
        panel.setAttribute("role", "tabpanel");
        list.append(el("button", { type: "button", role: "tab", "aria-controls": panel.id, onclick: () => select(i) }, panel.dataset.tab));
      });
      tabs.prepend(list);
      select(0);
    });
  }

  function setupGlossary() {
    for (const list of document.querySelectorAll("dl.glossary")) {
      const entries = [];
      for (const child of list.children) {
        if (child.tagName === "DT") entries.push([child]);
        else if (entries.length) entries[entries.length - 1].push(child);
      }
      const input = el("input", { class: "glossary-filter", type: "search", placeholder: "Filter terms…", "aria-label": "Filter glossary terms" });
      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        for (const entry of entries) {
          const hit = !query || entry.some((node) => node.textContent.toLowerCase().includes(query));
          entry.forEach((node) => node.classList.toggle("hidden", !hit));
        }
      });
      list.before(input);
    }
  }

  function start() {
    if (!document.documentElement.dataset.theme) {
      document.documentElement.dataset.theme = store.get("onboarding-theme") || (prefersDark.matches ? "dark" : "light");
    }
    buildChrome();
    enhanceCodeFigures();
    fillInlineSources();
    updateCodeLinks();
    setupTabs();
    setupQuizzes();
    setupSelfChecks();
    setupPrompts();
    setupGlossary();
    highlightCode().then(addGutters);
    renderDiagrams();
    prefersDark.addEventListener("change", () => {
      if (!store.get("onboarding-theme")) setTheme(prefersDark.matches ? "dark" : "light", false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
