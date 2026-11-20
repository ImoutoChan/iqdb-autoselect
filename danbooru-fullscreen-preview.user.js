// ==UserScript==
// @name         Danbooru Fullsceen Preiew
// @author       ImoutoChan
// @version      1.9.3
// @description  Right-click a thumbnail to browse posts and their related posts in a full-window viewer. Press F to add the current post to your favorites.
// @match        https://danbooru.donmai.us/*
// @run-at       document-end
// @grant        none
// @noframes
// @downloadURL  https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-fullscreen-preview.user.js
// @updateURL    https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-fullscreen-preview.user.js
// ==/UserScript==

(() => {
  'use strict';

  if (!['/', '/posts', '/posts/'].includes(location.pathname)) return;

  const EDGE_WIDTH = 'clamp(26px, 4vw, 72px)';
  const CARD = '#posts .post-preview[data-id]';
  const BLOCKED = '.blacklisted-active, .blacklisted-hidden, .blacklisted-blurred, [hidden]';

  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      dialog {
        --edge: ${EDGE_WIDTH};
        position: fixed; inset: 0; box-sizing: border-box; margin: 0; border: 0;
        width: 100%; height: 100%; max-width: none; max-height: none; padding: 0;
        overflow: hidden; overscroll-behavior: contain; color-scheme: dark;
        background: radial-gradient(ellipse at center, #202128 0%, #0a0b0f 80%);
        color: #f2f2f5; font: 14px/1.4 "Segoe UI", system-ui, sans-serif;
      }
      dialog::backdrop { background: #0a0b0f; }
      [hidden] { display: none !important; }
      .stage { position: absolute; inset: 10px var(--edge) 62px; display: grid;
        place-items: center; grid-template: 100% / 100%; container-type: size; }
      .stage > * { display: block; object-fit: contain;
        width: min(100cqw, calc(100cqh * var(--aspect)));
        height: min(100cqh, calc(100cqw / var(--aspect))); }
      footer { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
        display: flex; align-items: center; gap: 12px; padding: 5px 7px 5px 16px;
        border: 1px solid #ffffff23; border-radius: 24px; background: #191a20; white-space: nowrap; }
      .count { color: #bfc0cb; font-variant-numeric: tabular-nums; }
      .key-hints { display: grid; gap: 1px; font-size: 11px; line-height: 1.2; color: #bfc0cb; }
      .key-hints kbd { font: inherit; color: #eeeef4; }
      a, button { color: inherit; font: inherit; }
      a { text-underline-offset: 3px; }
      button { border: 0; background: #ffffff12; border-radius: 18px; padding: 6px 12px; cursor: pointer; }
      button:disabled { cursor: default; }
      button.saved { color: #ffadc6; }
      a:focus-visible, button:focus-visible { outline: 2px solid #c4b5fd; }
      output { position: absolute; left: 50%; bottom: 64px; transform: translateX(-50%);
        background: #15161dec; border-radius: 12px; padding: 7px 14px; text-align: center; }
      output:empty, .feedback:not(:empty) + .loading { display: none; }
      dialog {
        --default-panel: clamp(265px, 26vw, 380px);
        --max-panel: 65vw;
        --panel: min(clamp(190px, var(--preferred-panel, var(--default-panel)), var(--max-panel)),
                     calc(100% - 2 * var(--edge) - 14px));
      }
      dialog.details-open .stage { left: calc(var(--edge) + var(--panel) + 14px); }
      .panel-grip { position: absolute; left: calc(var(--edge) + var(--panel)); top: 12px; bottom: 62px;
        width: 14px; display: grid; place-items: center; cursor: col-resize; touch-action: none; user-select: none; }
      .panel-grip::after { content: ''; width: 3px; height: 38px; border-radius: 4px; background: #ffffff48; }
      .panel-grip:hover::after, .panel-grip:active::after { background: #c4b5fd; }
      aside { position: absolute; left: var(--edge); top: 12px; bottom: 62px;
        width: var(--panel); box-sizing: border-box; overflow: auto; overscroll-behavior: contain;
        scrollbar-color: #565865 transparent; scrollbar-width: thin; border-radius: 14px; }
      aside section { padding: 14px; margin-bottom: 9px; border-radius: 14px;
        background: #17181e; border: 1px solid #ffffff19; }
      aside h3 { margin: 16px 0 7px; font-size: 13px; color: #e6e5ed; }
      aside h3:first-child { margin-top: 0; }
      aside dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 5px 10px; }
      aside dt, .tag-count { color: #a7a8b7; }
      aside dd { margin: 0; overflow-wrap: anywhere; }
      .id-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
      .id-row span { color: #a7a8b7; }
      .post-id { font-variant-numeric: tabular-nums; user-select: all; }
      .copy-id { margin-left: auto; font-size: 12px; padding: 4px 9px; }
      aside a { color: #abd5ff; text-decoration: none; }
      aside a:hover { text-decoration: underline; }
      .relations, .relations ul { display: grid; list-style: none; margin: 0; padding: 0; gap: 8px; }
      .relations { grid-template-columns: minmax(0, 1fr); }
      .relations ul { grid-template-columns: repeat(auto-fill, min(100%, clamp(104px, 9vw, 136px)));
        align-items: start; }
      .relations > li + li { border-top: 1px solid #ffffff19; padding-top: 8px; }
      .relations li { min-width: 0; }
      .relation-parent-id { color: #bfc0cb; font-size: 11px; }
      .relations a { --tint: #c7b2fc; position: relative; display: grid; align-content: start; padding: 5px; border-radius: 9px;
        background: #222129; border: 1px solid color-mix(in srgb, var(--tint) 48%, transparent);
        color: var(--tint); font-size: 12px; line-height: 1.35; text-align: center; }
      .relations .parent { --tint: #8ed9aa; } .relations .child { --tint: #ffc37c; }
      .relations a:hover { border-color: var(--tint); background: #303039; text-decoration: none; }
      .relations a[aria-current="true"] { border-color: #ffd365; box-shadow: 0 0 0 2px #ffd365;
        color: #ffe3a0; background: #383024; }
      .relations img { width: 100%; height: clamp(100px, 9vw, 148px); object-fit: contain;
        background: #101015; border-radius: 5px; margin-bottom: 5px; }
      .tile-heart { position: absolute; top: 7px; right: 7px; display: grid; place-items: center;
        width: 22px; height: 22px; border-radius: 50%; color: #ffabc6; background: #20151df2;
        font: bold 16px/1 "Segoe UI", sans-serif; pointer-events: none; }
      .tags { display: grid; gap: 2px; overflow-wrap: anywhere; }
      .tags .wiki { margin-right: 6px; color: #a8a9b7; }
      .tag-count { font-size: 11px; margin-left: 5px; }
      .artist a { color: #ff9da8; } .copyright a { color: #c1afff; }
      .character a { color: #8ed9aa; } .meta a { color: #efc984; }
      footer { max-width: calc(100% - 2 * var(--edge)); box-sizing: border-box; gap: 7px; }
      footer button { padding-inline: 9px; }
      @media (max-width: 720px) {
        dialog { --default-panel: 310px; --max-panel: 100vw; }
        dialog.details-open .stage { left: var(--edge); }
        footer { flex-wrap: wrap; justify-content: center; width: max-content; }
        .stage, aside, .panel-grip { bottom: 90px; }
      }
    </style>
    <dialog lang="en" aria-label="Danbooru post viewer">
      <div class="stage"></div>
      <aside id="post-panel" aria-label="Post details" hidden>
        <section hidden><h3>Related posts</h3><ul class="relations" aria-label="Related post tree"></ul></section>
        <section><h3>Details</h3>
          <div class="id-row"><span>ID</span><strong class="post-id"></strong>
            <button type="button" class="copy-id" title="Copy post ID">Copy</button></div>
          <div class="post-details"></div>
        </section>
      </aside>
      <div class="panel-grip" role="separator" aria-orientation="vertical" aria-label="Details panel width"
        aria-controls="post-panel" title="Drag to resize. Double-click to restore the default width." hidden></div>
      <footer><span class="key-hints"><span><kbd>← →</kbd> results</span><span><kbd>↑ ↓</kbd> tree</span></span>
        <span class="count"></span><a target="_blank" rel="noopener" title="Open post in a new tab"></a>
        <button class="origin" title="Return to the original search result" hidden></button>
        <button class="details" aria-controls="post-panel">Details</button>
        <button class="fav" title="Add to favorites (F)"></button></footer>
      <output class="feedback" role="status"></output>
      <output class="loading" role="status"></output>
    </dialog>`;
  document.body.append(host);
  const dialog = root.querySelector('dialog');
  const stage = root.querySelector('.stage');
  const status = root.querySelector('.loading');
  const feedback = root.querySelector('.feedback');
  const link = root.querySelector('footer a');
  const panel = root.querySelector('aside');
  const grip = root.querySelector('.panel-grip');
  const widthKey = 'danbooru-hover.panel-width';
  let drag = null;
  let suppressResizeClick = false;
  try {
    const width = Number(localStorage.getItem(widthKey));
    if (Number.isFinite(width) && width > 0) dialog.style.setProperty('--preferred-panel', width + 'px');
  } catch { /* The current tab can still resize with storage disabled. */ }

  grip.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    event.preventDefault();
    grip.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, offset: event.clientX - panel.getBoundingClientRect().right, moved: false };
  });
  window.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    const width = event.clientX - panel.getBoundingClientRect().left - drag.offset;
    dialog.style.setProperty('--preferred-panel', Math.round(width) + 'px');
    drag.moved = true;
  }, true);
  function finishResize() {
    if (!drag) return;
    const { id, moved } = drag;
    drag = null;
    if (grip.hasPointerCapture(id)) grip.releasePointerCapture(id);
    if (!moved) return;
    suppressResizeClick = true;
    const width = panel.offsetWidth;
    dialog.style.setProperty('--preferred-panel', width + 'px');
    try { localStorage.setItem(widthKey, String(width)); } catch { /* Keep the in-tab size. */ }
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    window.addEventListener(type, event => { if (event.pointerId === drag?.id) finishResize(); }, true);
  }
  dialog.addEventListener('pointerdown', () => { suppressResizeClick = false; }, true);
  dialog.addEventListener('click', event => {
    if (!suppressResizeClick || !event.detail) return;
    suppressResizeClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  grip.addEventListener('dblclick', () => {
    dialog.style.removeProperty('--preferred-panel');
    try { localStorage.removeItem(widthKey); } catch { /* Keep the in-tab default. */ }
  });
  const tree = panel.querySelector('.relations');
  const postDetails = panel.querySelector('.post-details');
  const postId = panel.querySelector('.post-id');
  const copyId = panel.querySelector('.copy-id');
  const family = new Map();
  let drawnRoot, treeDirty = true, treeFrame = 0;
  const details = root.querySelector('.details');
  const origin = root.querySelector('.origin');
  const panelCache = new Map();
  let session;
  let preloadPlan;
  let activePreloads = 0;
  const pendingOriginals = new Set();
  let loadingOriginal = false;
  let showDetails = window.innerWidth > 720;
  let relatedId = null;
  const fav = root.querySelector('.fav');
  const cache = new Map();
  const saved = new Set();
  const saving = new Map();
  const favoriteRevisions = new Map();
  let cards = [], index = -1, generation = 0;
  let lastWheel = -Infinity, wheelSum = 0, lastInput = -Infinity;

  function available(card) {
    return /^\d+$/.test(card.dataset.id) && !card.closest(BLOCKED) &&
      card.getClientRects().length > 0 && getComputedStyle(card).visibility === 'visible';
  }

  function thumbnailAt(target, x, y) {
    const card = target?.closest?.(CARD);
    if (!card || !available(card)) return null;
    const image = card.querySelector('img.post-preview-image, .post-preview-link img');
    if (!image?.naturalWidth || !image.naturalHeight || !target.contains(image)) return null;
    const css = getComputedStyle(image);
    if (css.visibility !== 'visible') return null;
    const bounds = image.getBoundingClientRect();
    const left = bounds.left + parseFloat(css.borderLeftWidth) + parseFloat(css.paddingLeft);
    const top = bounds.top + parseFloat(css.borderTopWidth) + parseFloat(css.paddingTop);
    const width = bounds.right - left - parseFloat(css.borderRightWidth) - parseFloat(css.paddingRight);
    const height = bounds.bottom - top - parseFloat(css.borderBottomWidth) - parseFloat(css.paddingBottom);
    if (x < left || x >= left + width || y < top || y >= top + height) return null;
    if (!['contain', 'scale-down', 'none'].includes(css.objectFit)) return card;

    const fit = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const scale = css.objectFit === 'none' ? 1 : css.objectFit === 'scale-down' ? Math.min(1, fit) : fit;
    const paintedWidth = image.naturalWidth * scale;
    const paintedHeight = image.naturalHeight * scale;
    const [px, py] = css.objectPosition.split(' ');
    const offset = (space, value) => value.endsWith('%') ? space * parseFloat(value) / 100 : parseFloat(value);
    const imageLeft = left + offset(width - paintedWidth, px);
    const imageTop = top + offset(height - paintedHeight, py);
    return x >= imageLeft && x < imageLeft + paintedWidth && y >= imageTop && y < imageTop + paintedHeight ? card : null;
  }

  document.addEventListener('contextmenu', event => {
    if (dialog.open || event.button !== 2) return;
    const card = thumbnailAt(event.target, event.clientX, event.clientY);
    if (!card) return;
    cards = [...document.querySelectorAll(CARD)].filter(available);
    index = cards.indexOf(card);
    if (index < 0) return;
    event.preventDefault();
    event.stopPropagation();
    session = new AbortController();
    dialog.showModal();
    lastWheel = lastInput = -Infinity;
    wheelSum = 0;
    render();
  }, true);

  function currentId() { return relatedId ?? cards[index]?.dataset.id; }

  copyId.addEventListener('click', async () => {
    const id = currentId();
    if (!id) return;
    const token = generation;
    try {
      await navigator.clipboard.writeText(id);
      if (token === generation) copyId.textContent = 'Copied';
    } catch {
      if (token === generation) copyId.textContent = 'Copy failed';
    }
  });

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function webUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value, location.origin);
      return ['https:', 'http:'].includes(url.protocol) ? url : null;
    } catch { return null; }
  }

  function copyLink(source) {
    const url = webUrl(source.getAttribute('href'));
    const label = source.textContent.trim() || url?.hostname || '';
    if (!url) return document.createTextNode(label);
    const anchor = element('a', label);
    anchor.href = url.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.title = source.getAttribute('title') || url.href;
    return anchor;
  }

  function addFacts(container, page) {
    const list = element('dl');
    for (const [field, label] of [['date', 'Date'], ['size', 'File'], ['source', 'Source']]) {
      const row = page.querySelector('#post-info-' + field);
      if (!row) continue;
      const value = element('dd');
      for (const part of row.childNodes) {
        if (part.nodeType === Node.TEXT_NODE) value.append(part.textContent.replace(/^\s*(Date|Size|Source):\s*/i, ''));
        else if (part.nodeType === Node.ELEMENT_NODE) {
          value.append(part.matches('a') ? copyLink(part) : part.textContent);
        }
      }
      const time = row.querySelector('time[datetime]');
      if (time) value.title = new Date(time.dateTime).toLocaleString('en');
      if (!value.textContent.trim()) value.textContent = '—';
      list.append(element('dt', label), value);
    }
    container.append(list);
  }

  function addTags(container, page) {
    for (const group of page.querySelectorAll('#tag-list ul')) {
      const category = [...group.classList].find(name => name.endsWith('-tag-list'))?.replace(/-tag-list$/, '');
      const list = element('div', '', 'tags ' + (category || ''));
      for (const tag of group.querySelectorAll('li[data-tag-name]')) {
        const search = tag.querySelector('.search-tag');
        if (!search) continue;
        const row = element('div');
        const wiki = tag.querySelector('.wiki-link');
        if (wiki) {
          const help = copyLink(wiki);
          if (help instanceof HTMLAnchorElement) help.className = 'wiki';
          row.append(help);
        }
        if (tag.querySelector('.nested-tag-icon')) row.append('↳ ');
        row.append(copyLink(search));
        const count = tag.querySelector('.post-count');
        if (count) {
          const badge = element('span', count.textContent.trim(), 'tag-count');
          badge.title = count.getAttribute('title') || '';
          row.append(badge);
        }
        list.append(row);
      }
      if (list.childElementCount) container.append(element('h3', group.previousElementSibling?.textContent.trim() || category), list);
    }
  }

  function blockedRelative(card) {
    if (card.closest(BLOCKED) || document.querySelector('#posts [data-id="' + card.dataset.id + '"]')?.closest(BLOCKED)) return true;
    const rules = document.querySelector('#blacklist-box')?.blacklist?.rules;
    if (!rules?.length) return false;
    const flags = (card.dataset.flags || '').split(/\s+/).filter(Boolean).map(flag => 'status:' + flag);
    const tags = new Set([...(card.dataset.tags || '').split(/\s+/), ...flags, 'rating:' + card.dataset.rating, 'uploaderid:' + card.dataset.uploaderId]);
    const post = { tags, score: Number(card.dataset.score) };
    return rules.some(rule => rule.enabled && rule.match(post));
  }

  function familyNode(id) {
    if (!family.has(id)) family.set(id, { id, parent: null, children: new Set(), thumb: '', visible: false });
    return family.get(id);
  }

  function familyRoot(node) {
    const path = new Set();
    while (node.parent && !path.has(node)) {
      path.add(node);
      node = node.parent;
    }
    // A malformed cycle still needs a consistent entry point for every member.
    if (path.has(node)) {
      let member = node.parent;
      for (let first = node; member !== first; member = member.parent) {
        if (Number(member.id) < Number(node.id)) node = member;
      }
    }
    return node;
  }

  function readRelations(page, id) {
    const self = familyNode(id);
    const relatives = new Set();
    let changed = !self.visible;
    self.visible = true;

    function connect(parent, child) {
      if (!parent || parent === child || child.parent === parent) return;
      child.parent?.children.delete(child);
      child.parent = parent;
      parent.children.add(child);
      changed = true;
    }

    const search = page.querySelector('.post-notice-child a[href*="parent"]');
    const parentId = webUrl(search?.getAttribute('href'))?.searchParams.get('tags')?.match(/^parent:(\d+)$/)?.[1];
    const parent = parentId ? familyNode(parentId) : null;
    connect(parent, self);
    for (const card of page.querySelectorAll('#has-parent-relationship-preview .post-preview, #has-children-relationship-preview .post-preview')) {
      const target = card.dataset.id;
      if (!/^\d+$/.test(target) || blockedRelative(card)) continue;
      const node = familyNode(target);
      const thumb = webUrl(card.querySelector('img')?.getAttribute('src'))?.href || '';
      if (!node.visible || (thumb && !node.thumb)) changed = true;
      node.visible = true;
      node.thumb ||= thumb;
      if (target !== id) relatives.add(target);
      if (card.closest('#has-children-relationship-preview')) connect(self, node);
      else connect(parent, node);
    }

    if (changed && dialog.open && familyRoot(self) === familyRoot(familyNode(currentId()))) {
      treeDirty = true;
      if (!treeFrame && showDetails) treeFrame = requestAnimationFrame(drawFamily);
    }
    return [...relatives];
  }

  function drawFamily() {
    cancelAnimationFrame(treeFrame);
    treeFrame = 0;
    if (!dialog.open) return;
    const selected = familyNode(currentId());
    const top = familyRoot(selected);
    if (treeDirty || drawnRoot !== top) {
      const focused = root.activeElement?.closest('.relations a')?.dataset.postId;
      const fragment = document.createDocumentFragment();
      const seen = new Set();
      const levels = [];
      const stack = [{ node: top, depth: 0 }];
      while (stack.length) {
        const { node, depth } = stack.pop();
        if (seen.has(node)) continue;
        seen.add(node);
        const children = [...node.children].filter(child => !seen.has(child)).sort((a, b) => Number(b.id) - Number(a.id));
        if (node.visible) {
          if (!levels[depth]) {
            const level = element('li');
            const row = element('ul');
            row.setAttribute('aria-label', 'Level ' + (depth + 1));
            level.append(row);
            fragment.append(level);
            levels[depth] = row;
          }
          const item = element('li');
          const tile = element('a');
          tile.dataset.postId = node.id;
          tile.href = '/posts/' + node.id;
          tile.target = '_blank';
          tile.rel = 'noopener';
          if (node.thumb) {
            const image = new Image();
            image.loading = 'lazy';
            image.alt = '';
            image.src = node.thumb;
            tile.append(image);
          }
          const heart = element('span', '♥', 'tile-heart');
          heart.setAttribute('role', 'img');
          heart.setAttribute('aria-label', 'Favorited');
          heart.hidden = !favoriteShown(node.id);
          tile.append(heart, element('strong'), element('span', '#' + node.id));
          if (node.parent?.visible) {
            tile.append(element('small', '↳ Parent #' + node.parent.id, 'relation-parent-id'));
          }
          item.append(tile);
          levels[depth].append(item);
        }
        const childDepth = node.visible ? depth + 1 : depth;
        for (const child of children) stack.push({ node: child, depth: childDepth });
      }
      tree.replaceChildren(fragment);
      tree.parentElement.hidden = tree.querySelectorAll('a[data-post-id]').length < 2;
      if (focused) tree.querySelector('[data-post-id="' + focused + '"]')?.focus({ preventScroll: true });
      drawnRoot = top;
      treeDirty = false;
    }
    for (const tile of tree.querySelectorAll('a')) {
      const node = family.get(tile.dataset.postId);
      const current = node === selected;
      const sibling = node.parent && node.parent === selected.parent;
      const parent = node === selected.parent || node === top;
      tile.className = parent ? 'parent' : sibling ? 'sibling' : 'child';
      const label = current ? 'Current' : node === selected.parent ? 'Parent' :
        node === top ? 'Root' : sibling ? 'Sibling' : 'Child';
      tile.querySelector('strong').textContent = label;
      tile.title = label + ' · #' + node.id + (node.parent?.visible ? ' · parent #' + node.parent.id : '');
      if (current) tile.setAttribute('aria-current', 'true');
      else tile.removeAttribute('aria-current');
    }
  }

  function requestPanel(id) {
    if (panelCache.has(id)) return panelCache.get(id);
    const { signal } = session;
    const revision = favoriteRevisions.get(id);
    const ready = (async () => {
      const response = await fetch('/posts/' + id, { signal, headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      // A template keeps the fetched page inert, including scripts and media.
      const template = document.createElement('template');
      template.innerHTML = await response.text();
      signal.throwIfAborted();
      const page = template.content;
      if (!page.querySelector('#post-information, #tag-list')) throw new Error('Post page unavailable');
      const info = element('div');
      addFacts(info, page);
      addTags(info, page);
      const heart = page.querySelector('.fav-buttons-true, .fav-buttons-false');
      if (heart && revision === favoriteRevisions.get(id) && !saving.has(id)) {
        if (heart.classList.contains('fav-buttons-true')) saved.add(id);
        else saved.delete(id);
        updateFavorite(id);
      }
      return { content: info, relatives: readRelations(page, id) };
    })();
    panelCache.set(id, ready);
    ready.catch(() => { if (panelCache.get(id) === ready) panelCache.delete(id); });
    return ready;
  }

  async function updatePanel() {
    if (!showDetails) finishResize();
    grip.hidden = !showDetails;
    panel.hidden = !showDetails;
    dialog.classList.toggle('details-open', showDetails);
    details.setAttribute('aria-expanded', String(showDetails));
    if (!showDetails) return;
    const token = generation;
    const id = currentId();
    const selected = familyNode(id);
    if (!selected.thumb) {
      const preview = document.querySelector('#posts [data-id="' + id + '"] img');
      selected.thumb = preview?.currentSrc || preview?.src || '';
      if (selected.thumb) treeDirty = true;
    }
    if (!selected.visible) treeDirty = true;
    selected.visible = true;
    drawFamily();
    if (!panelCache.has(id)) postDetails.textContent = 'Loading details…';
    try {
      const { content, relatives } = await requestPanel(id);
      if (token !== generation || !showDetails) return;
      drawFamily();
      postDetails.replaceChildren(content);
      // A manual retry can reveal links the background request couldn't read.
      if (preloadPlan) enqueueRelatives(preloadPlan, relatives);
    } catch (error) {
      if (token !== generation || !showDetails) return;
      const retry = element('button', 'Retry');
      retry.addEventListener('click', updatePanel, { once: true });
      postDetails.replaceChildren(element('p', 'Could not load post details · ' + error.message), retry);
    }
  }

  function openRelative(id) {
    if (id === currentId()) return;
    relatedId = id === cards[index].dataset.id ? null : id;
    render();
  }

  function stepFamily(direction) {
    const id = currentId();
    if (treeDirty || drawnRoot !== familyRoot(familyNode(id))) drawFamily();
    const tiles = [...tree.querySelectorAll('a[data-post-id]')];
    const position = tiles.findIndex(tile => tile.dataset.postId === id);
    if (position < 0) return;
    const next = tiles[position + direction];
    if (!next) return;
    openRelative(next.dataset.postId);
    if (showDetails) {
      if (tree.contains(root.activeElement)) next.focus({ preventScroll: true });
      next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  details.addEventListener('click', () => { showDetails = !showDetails; updatePanel(); });
  panel.addEventListener('click', event => {
    const tile = event.target.closest('a[data-post-id]');
    if (!tile || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openRelative(tile.dataset.postId);
  });
  origin.addEventListener('click', () => { relatedId = null; render(); });

  dialog.addEventListener('click', event => {
    if (event.button === 0 && (event.target === dialog || event.target === stage)) close();
  });
  stage.addEventListener('mousedown', event => {
    if (event.button === 1 && event.target.matches('img, video')) event.preventDefault();
  });
  stage.addEventListener('auxclick', event => {
    if (event.button !== 1 || !event.target.matches('img, video')) return;
    event.preventDefault();
    window.open('/posts/' + currentId(), '_blank', 'noopener');
  });

  function discard(id) {
    const entry = cache.get(id);
    pendingOriginals.delete(id);
    entry.pendingOriginal?.removeAttribute('src');
    entry.controller.abort();
    if (entry.node instanceof HTMLVideoElement) {
      entry.node.pause();
      entry.node.removeAttribute('src');
      entry.node.load();
    } else if (entry.node) {
      entry.node.removeAttribute('src');
    }
    cache.delete(id);
  }

  function close() {
    if (!dialog.open) return;
    finishResize();
    generation++;
    dialog.close();
    stage.replaceChildren();
    for (const id of cache.keys()) discard(id);
    cards = [];
    index = -1;
    relatedId = null;
    preloadPlan = null;
    session.abort();
    cancelAnimationFrame(treeFrame);
    treeFrame = 0;
    drawnRoot = null;
    treeDirty = true;
    family.clear();
    tree.replaceChildren();
    postDetails.replaceChildren();
    panel.scrollTop = 0;
    panelCache.clear();
  }

  function requestMedia(id) {
    if (cache.has(id)) return cache.get(id).ready;
    const entry = { controller: new AbortController(), node: null };
    const signal = entry.controller.signal;
    entry.ready = (async () => {
      const response = await fetch('/posts/' + id + '.json?only=id,file_ext,file_url,large_file_url', { signal });
      if (!response.ok) throw new Error('Could not load post · HTTP ' + response.status);
      const post = await response.json();
      signal.throwIfAborted();
      const video = ['webm', 'mp4', 'zip'].includes(post.file_ext);
      const url = post.file_ext === 'zip' ? post.large_file_url : (post.large_file_url || post.file_url);
      if (!url || post.file_ext === 'swf' || (post.file_ext === 'zip' && !/\.(webm|mp4)(\?|$)/i.test(url))) {
        throw new Error('This file cannot be previewed. Use the post link below to open it.');
      }
      const node = video ? document.createElement('video') : new Image();
      entry.node = node;
      if (video) {
        node.controls = node.loop = node.muted = node.playsInline = true;
        node.preload = 'metadata';
      } else {
        node.alt = 'Post #' + id;
      }
      await new Promise((resolve, reject) => {
        node.addEventListener(video ? 'loadedmetadata' : 'load', resolve, { once: true, signal });
        node.addEventListener('error', () => reject(new Error('Could not load the media file.')), { once: true, signal });
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        node.src = url;
      });
      const aspect = video ? node.videoWidth / node.videoHeight : node.naturalWidth / node.naturalHeight;
      node.style.setProperty('--aspect', Number.isFinite(aspect) && aspect > 0 ? aspect : 1);
      if (!video && post.file_url && new URL(post.file_url, location.href).href !== node.src) {
        entry.originalUrl = post.file_url;
        pendingOriginals.add(id);
      }
    })();
    cache.set(id, entry);
    entry.ready.catch(() => { if (cache.get(id) === entry) discard(id); });
    return entry.ready;
  }

  function favoriteShown(id) {
    return saving.get(id) ?? saved.has(id);
  }

  function updateFavorite(id = currentId()) {
    const isSaved = favoriteShown(id);
    const heart = tree.querySelector('[data-post-id="' + id + '"] .tile-heart');
    if (heart) heart.hidden = !isSaved;
    if (id !== currentId()) return;
    fav.classList.toggle('saved', isSaved);
    fav.setAttribute('aria-pressed', String(isSaved));
    fav.disabled = saving.has(id);
    fav.title = isSaved ? 'Remove from favorites' : 'Add to favorites (F)';
    fav.textContent = fav.disabled ? 'Saving…' : isSaved ? '♥ Favorited' : '♡ Favorite · F';
  }

  // Walk links breadth-first. Shared promises let a click use work already in flight.
  function enqueueRelatives(plan, ids) {
    for (const id of ids) {
      if (plan.seen.has(id)) continue;
      plan.seen.add(id);
      plan.pending.add(id);
    }
    pumpPreloads();
  }

  async function preloadOriginal() {
    if (loadingOriginal || !pendingOriginals.size) return;
    const id = pendingOriginals.has(currentId()) ? currentId() : pendingOriginals.values().next().value;
    pendingOriginals.delete(id);
    const entry = cache.get(id);
    loadingOriginal = true;
    const image = new Image();
    entry.pendingOriginal = image;
    image.alt = entry.node.alt;
    image.fetchPriority = 'low';
    try {
      image.src = entry.originalUrl;
      await image.decode();
      if (cache.get(id) !== entry) return;
      image.style.setProperty('--aspect', image.naturalWidth / image.naturalHeight);
      if (stage.firstElementChild === entry.node && currentId() === id) entry.node.replaceWith(image);
      entry.node = image;
    } catch {
      // A missing or undecodable original leaves the loaded sample available.
    } finally {
      entry.pendingOriginal = null;
      loadingOriginal = false;
      pumpPreloads();
    }
  }

  function pumpPreloads() {
    const plan = preloadPlan;
    if (!plan) return;
    while (activePreloads < 2 && plan.pending.size) {
      const id = plan.pending.values().next().value;
      plan.pending.delete(id);
      activePreloads++;
      const info = requestPanel(id).then(({ relatives }) => {
        if (plan === preloadPlan) enqueueRelatives(plan, relatives);
      });
      Promise.allSettled([info, requestMedia(id)]).then(() => {
        activePreloads--;
        pumpPreloads();
      });
    }
    if (!activePreloads && !plan.pending.size) {
      for (const id of cache.keys()) if (!plan.seen.has(id)) discard(id);
      for (const id of panelCache.keys()) if (!plan.seen.has(id)) panelCache.delete(id);
      preloadOriginal();
    }
  }

  async function render() {
    const token = ++generation;
    const id = currentId();
    const nearby = cards.slice(Math.max(0, index - 1), index + 2).map(card => card.dataset.id);
    stage.querySelector('video')?.pause();
    stage.replaceChildren();
    root.querySelector('.count').textContent = (index + 1) + ' / ' + cards.length;
    link.href = '/posts/' + id;
    link.textContent = '#' + id;
    postId.textContent = id;
    copyId.textContent = 'Copy';
    origin.hidden = !relatedId;
    origin.textContent = '↩ #' + cards[index].dataset.id;
    updatePanel();
    updateFavorite();
    feedback.textContent = '';
    status.textContent = 'Loading…';
    const ready = requestMedia(id);
    if (preloadPlan?.index !== index) preloadPlan = { index, seen: new Set(), pending: new Set() };
    enqueueRelatives(preloadPlan, [id, ...nearby]);
    try {
      await ready;
      if (token !== generation) return;
      const node = cache.get(id).node;
      stage.replaceChildren(node);
      status.textContent = '';
      if (node instanceof HTMLVideoElement) node.play().catch(() => {});
      if (pendingOriginals.has(id)) pumpPreloads();
    } catch (error) {
      if (token === generation) status.textContent = error.message;
    }
  }

  function step(direction) {
    const next = index + direction;
    if (next < 0 || next >= cards.length) return;
    panel.scrollTop = 0;
    index = next;
    relatedId = null;
    render();
  }

  async function setFavorite(shouldSave) {
    const id = currentId();
    if (!id || saving.has(id) || shouldSave === saved.has(id)) return;
    saving.set(id, shouldSave);
    feedback.textContent = '';
    updateFavorite();
    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.content;
      const response = await fetch(shouldSave ? '/favorites.json' : '/favorites/' + id + '.json', {
        method: shouldSave ? 'POST' : 'DELETE', credentials: 'same-origin',
        headers: { Accept: 'application/json', ...(token ? { 'X-CSRF-Token': token } : {}) },
        body: shouldSave ? new URLSearchParams({ post_id: id }) : undefined
      });
      if ([401, 403].includes(response.status)) throw new Error('Check that you are signed in to Danbooru and that your account can edit favorites.');
      if (!response.ok) {
        const detail = await response.text();
        if (!shouldSave || response.status !== 422 || !/already favorited/i.test(detail)) {
          const action = shouldSave ? 'add this post to favorites' : 'remove this post from favorites';
          throw new Error('Could not ' + action + ' · HTTP ' + response.status);
        }
      } else if (response.status !== 204 && !response.headers.get('content-type')?.includes('json')) {
        throw new Error('Check that you are signed in to Danbooru and try again.');
      }
      favoriteRevisions.set(id, (favoriteRevisions.get(id) || 0) + 1);
      if (shouldSave) saved.add(id);
      else saved.delete(id);
    } catch (error) {
      if (id === currentId()) feedback.textContent = error.message;
    } finally {
      saving.delete(id);
      updateFavorite(id);
    }
  }

  dialog.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.composedPath().includes(panel)) {
      panel.scrollBy(0, (event.deltaY || event.deltaX) * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? panel.clientHeight : 1));
      return;
    }
    const now = performance.now();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (now - lastInput > 160 || Math.sign(delta) !== Math.sign(wheelSum)) wheelSum = 0;
    lastInput = now;
    if (now - lastWheel < 180) return;
    wheelSum += delta * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelSum) < 18) return;
    step(Math.sign(wheelSum));
    lastWheel = now;
    wheelSum = 0;
  }, { passive: false });

  window.addEventListener('keydown', event => {
    if (!dialog.open || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && event.code !== 'KeyF') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.code === 'KeyF') { if (!event.repeat) setFavorite(true); }
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') stepFamily(event.key === 'ArrowUp' ? -1 : 1);
    else step(event.key === 'ArrowLeft' ? -1 : 1);
  }, true);
  dialog.addEventListener('cancel', event => event.preventDefault());
  fav.addEventListener('click', () => setFavorite(!saved.has(currentId())));
  window.addEventListener('pagehide', close);
})();
