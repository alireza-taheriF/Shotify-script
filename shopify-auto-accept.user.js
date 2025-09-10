// ==UserScript==
// @name         Shopify Admin – Auto Accept ALL + Save (Reliable Panel, Bulk, Stop)
// @namespace    qanex.tools.shopify
// @version      1.3.2
// @description  Auto-click "Accept all"/"Accept" in Category metafields, then "Save". Adds a reliable panel, Bulk (with Stop), hotkeys, and admin autodetect.
// @match        https://admin.shopify.com/*
// @match        https://*/admin/*
// @include      *://*/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  // --- Hard guard: run on Shopify Admin only ---
  const isAdminHost = location.host === 'admin.shopify.com' || /(^|\.)myshopify\.com$/i.test(location.host);
  const isAdminPath = /\/admin(\/|$)/.test(location.pathname) || /\/store\/[^/]+\/products/.test(location.pathname);
  if (!isAdminHost && !isAdminPath) return;

  // ---- Config ----
  const DEFAULT_ACCEPT_LABELS = ['Accept all','Accept','Apply','Confirm'];
  const DEFAULT_SAVE_LABELS   = ['Save','Save changes','Save and close'];

  // LocalStorage keys (for label customization & bulk state)
  const LS_ACCEPT   = 'qa_accept_labels';
  const LS_SAVE     = 'qa_save_labels';
  const LS_QUEUE    = 'qa_bulk_queue';
  const LS_ACTIVE   = 'qa_bulk_active';
  const LS_DEFERRED = 'qa_bulk_deferred';

  // Small delays to let the UI render/enable buttons
  const DELAY_BEFORE_FINDING = 800;
  const DELAY_AFTER_ACCEPT   = 700;
  const DELAY_AFTER_SAVE     = 1200;

  const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));
  const getLabels = (k, d)=> { try{ const a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)&&a.length?a:d }catch{ return d } };
  const setLabels = (k, a)=> localStorage.setItem(k, JSON.stringify(a));

  // ---- UI helpers ----
  function visible(el){ if(!el) return false; const s=getComputedStyle(el); return s.visibility!=='hidden' && s.display!=='none'; }
  async function waitEnabled(el,ms=6000){ const t=performance.now(); while(performance.now()-t<ms){ if(el && !el.hasAttribute('disabled') && visible(el)) return true; await sleep(150) } return !!el; }
  function click(el){ if(!el) return false; el.focus?.(); el.click?.(); el.dispatchEvent?.(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); return true; }

  // Toast message at the bottom of the page
  function toast(msg){
    let t=document.getElementById('qa-toast');
    if(!t){
      t=document.createElement('div'); t.id='qa-toast';
      Object.assign(t.style,{
        position:'fixed', zIndex: 2147483647, left:'50%', bottom:'22px', transform:'translateX(-50%)',
        background:'#111', color:'#fff', padding:'8px 12px', borderRadius:'8px',
        boxShadow:'0 6px 18px rgba(0,0,0,.35)', fontFamily:'Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial',
        fontSize:'12px', opacity:'0', transition:'opacity .2s ease'
      });
      document.documentElement.appendChild(t);
    }
    t.textContent=msg; t.style.opacity='1'; setTimeout(()=>{t.style.opacity='0'},1600);
  }

  // Find clickable elements by text or aria-label (robust against DOM variations)
  function findClickable(root, labels){
    const nodes = root.querySelectorAll('button,[role="button"],a[role="button"]');
    for(const el of nodes){
      const txt=(el.innerText||el.textContent||'').trim().toLowerCase();
      if(!txt) continue;
      for(const l of labels){ const L=l.toLowerCase(); if(txt===L || txt.includes(L)) return el; }
    }
    const aria = root.querySelectorAll('button[aria-label],[role="button"][aria-label]');
    for(const el of aria){
      const a=(el.getAttribute('aria-label')||'').trim().toLowerCase();
      if(!a) continue;
      for(const l of labels){ const L=l.toLowerCase(); if(a===L || a.includes(L)) return el; }
    }
    return null;
  }

  // Core action: Accept → Save
  async function acceptAllAndSave(){
    await sleep(DELAY_BEFORE_FINDING);
    const acceptBtn = findClickable(document, getLabels(LS_ACCEPT, DEFAULT_ACCEPT_LABELS));
    if (acceptBtn) { await waitEnabled(acceptBtn); click(acceptBtn); toast('Accepted ✔'); }
    else { toast('Accept all not found'); }

    await sleep(DELAY_AFTER_ACCEPT);
    const saveBtn = findClickable(document, getLabels(LS_SAVE, DEFAULT_SAVE_LABELS)) || document.querySelector('[aria-label*="Save" i]');
    if (!saveBtn){ toast('Save not found'); return false; }
    await waitEnabled(saveBtn); click(saveBtn); toast('Saved 💾'); return true;
  }

  // ---- Admin routing helpers (support admin.shopify.com and *.myshopify.com/admin) ----
  const isNewAdmin = location.host === 'admin.shopify.com';
  function getStoreSeg(){
    if (!isNewAdmin) return null;
    const parts = location.pathname.split('/').filter(Boolean);
    const i = parts.indexOf('store');
    return (i !== -1 && parts[i+1]) ? parts[i+1] : null;
  }
  function isProductsIndex(){
    const p = location.pathname;
    return isNewAdmin
      ? /\/store\/[^/]+\/products\/?$/.test(p)
      : /\/admin\/products\/?$/.test(p);
  }
  function isProductEdit(){
    const p = location.pathname;
    return isNewAdmin
      ? /\/store\/[^/]+\/products\/\d+/.test(p)
      : /\/admin\/products\/\d+/.test(p);
  }
  function getIndexUrl(){
    if (isNewAdmin){
      const store=getStoreSeg();
      return store ? `${location.origin}/store/${store}/products` : `${location.origin}/products`;
    }
    return `${location.origin}/admin/products`;
  }
  function buildEditUrl(id){
    if (isNewAdmin){
      const store=getStoreSeg();
      return store ? `${location.origin}/store/${store}/products/${id}` : `${location.origin}/products/${id}`;
    }
    return `${location.origin}/admin/products/${id}`;
  }

  // ---- Bulk queue helpers ----
  const saveQueue = (a)=> localStorage.setItem(LS_QUEUE, JSON.stringify(a));
  const loadQueue = ()=> { try{ const a=JSON.parse(localStorage.getItem(LS_QUEUE)||'[]'); return Array.isArray(a)?a:[] }catch{ return [] } };
  const clearQueue= ()=> localStorage.removeItem(LS_QUEUE);
  const setActive = (b)=> localStorage.setItem(LS_ACTIVE, b?'1':'0');
  const isActive  = ()=> localStorage.getItem(LS_ACTIVE)==='1';
  const setDeferred=(b)=> localStorage.setItem(LS_DEFERRED, b?'1':'0');
  const isDeferred =()=> localStorage.getItem(LS_DEFERRED)==='1';
  function removeFromQueue(url){ const q=loadQueue().filter(x=>x!==url); saveQueue(q); }
  function nextFromQueue(current){ const q=loadQueue(); if(!q.length) return null; const i=q.indexOf(current); return i===-1?q[0]:(q[i+1]||null); }

  // Collect product edit links on Products index (anchors + Polaris role=link + row IDs)
  function collectFromIndex(){
    // 1) direct anchors
    const anchors = [...document.querySelectorAll('a[href*="/products/"]')]
      .map(a=>a.href)
      .filter(h=>/\/products\/\d+($|[/?#])/.test(h));

    // 2) Polaris links (role="link")
    const roleLinks = [...document.querySelectorAll('[role="link"]')]
      .map(el => el.getAttribute('href') || el.getAttribute('data-href') || '')
      .filter(Boolean)
      .map(h => (h.startsWith('http') ? h : location.origin + h))
      .filter(h => /\/products\/\d+($|[/?#])/.test(h));

    // 3) extract IDs from checkboxes / dataset attrs
    const ids = [
      ...[...document.querySelectorAll('input[type="checkbox"][value]')].map(i=>i.value),
      ...[...document.querySelectorAll('[data-resource-id],[data-id]')].map(el=>el.getAttribute('data-resource-id')||el.getAttribute('data-id'))
    ].filter(v=>/^\d+$/.test(v));

    const linksFromIds = ids.map(buildEditUrl);
    const all = [...anchors, ...roleLinks, ...linksFromIds];
    const uniq = [...new Set(all)];
    const editLinks = uniq.filter(h=>/\/products\/\d+($|[/?#])/.test(h));
    console.log('[Bulk collect] found:', {anchors: anchors.length, roleLinks: roleLinks.length, ids: ids.length, total: editLinks.length});
    return editLinks;
  }

  // ---- Panel (mounts reliably even in SPA/virtualized UIs) ----
  function createPanel(){
    const old=document.getElementById('qa-auto-panel'); if(old) return;
    const box=document.createElement('div'); box.id='qa-auto-panel';
    Object.assign(box.style,{
      position:'fixed', top:'10px', right:'10px', zIndex:2147483647,
      background:'rgba(17,17,17,0.94)', color:'#fff', padding:'10px 12px',
      borderRadius:'12px', boxShadow:'0 6px 18px rgba(0,0,0,.35)',
      fontFamily:'Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial', fontSize:'12px',
      display:'flex', alignItems:'center', gap:'8px'
    });

    const title=document.createElement('span'); title.textContent='Auto Accept'; title.style.fontWeight='700';

    const run=document.createElement('button'); run.textContent='Run';
    run.style.cssText='background:#30d4e5;border:none;border-radius:8px;padding:6px 10px;color:#000;cursor:pointer;font-weight:700;';
    run.onclick=window.qaRun;

    const bulk=document.createElement('button'); bulk.textContent='Start Bulk';
    bulk.style.cssText='background:#4ade80;border:none;border-radius:8px;padding:6px 10px;color:#000;cursor:pointer;font-weight:700;';
    bulk.onclick=window.qaStartBulk;

    const stop=document.createElement('button'); stop.textContent='Stop';
    stop.style.cssText='background:#ef4444;border:none;border-radius:8px;padding:6px 10px;color:#fff;cursor:pointer;font-weight:700;';
    stop.onclick=window.qaStopBulk;

    const cfg=document.createElement('button'); cfg.textContent='Config';
    cfg.style.cssText='background:#333;border:none;border-radius:8px;padding:6px 10px;color:#fff;cursor:pointer;';
    cfg.onclick=window.qaConfig;

    box.append(title, run, bulk, stop, cfg);
    (document.body || document.documentElement).appendChild(box);
  }

  // Try multiple times to ensure the panel is mounted (SPA)
  let tries = 0;
  const ensureTimer = setInterval(()=>{
    tries++;
    if (document.readyState === 'complete' || tries > 40) {
      createPanel();
      clearInterval(ensureTimer);
    } else {
      createPanel();
    }
  }, 250);

  // ---- Public API (for when the panel isn't visible) ----
  window.qaRun = async function(){
    const ok = await acceptAllAndSave();
    if (ok && isActive()){
      await sleep(DELAY_AFTER_SAVE);
      const here=location.href;
      removeFromQueue(here);
      const nxt=nextFromQueue(here);
      if (nxt) location.href=nxt; else { setActive(false); toast('Bulk done ✅'); }
    }
  };

  window.qaStartBulk = function(){
    // If not on Products index, navigate there first; then auto-collect and start
    if (!isProductsIndex()){
      setDeferred(true);
      setActive(true);
      location.href = getIndexUrl();
      return;
    }
    const links = collectFromIndex();
    if (!links.length){ toast('No product links detected (scroll the list, then try again)'); return; }
    localStorage.setItem(LS_QUEUE, JSON.stringify(links));
    setActive(true);
    location.href = links[0];
  };

  window.qaStopBulk = function(){
    setActive(false);
    setDeferred(false);
    localStorage.removeItem(LS_QUEUE);
    toast('Bulk stopped ✋');
  };

  window.qaConfig = function(){
    const acc = prompt('Accept labels (comma separated):', getLabels(LS_ACCEPT, DEFAULT_ACCEPT_LABELS).join(', '));
    if (acc !== null) setLabels(LS_ACCEPT, acc.split(',').map(s=>s.trim()).filter(Boolean));
    const sav = prompt('Save labels (comma separated):',   getLabels(LS_SAVE, DEFAULT_SAVE_LABELS).join(', '));
    if (sav !== null) setLabels(LS_SAVE, sav.split(',').map(s=>s.trim()).filter(Boolean));
    alert('Saved. Reload if needed.');
  };

  // ---- Autorun on product edit pages when Bulk is active ----
  (async ()=>{
    const active = isActive();
    const onEdit = isProductEdit();
    if (active && onEdit){
      await sleep(1200);
      const ok = await acceptAllAndSave();
      if (ok){
        await sleep(DELAY_AFTER_SAVE);
        const here = location.href;
        removeFromQueue(here);
        const nxt = nextFromQueue(here);
        if (nxt) location.href = nxt; else { setActive(false); toast('Bulk done ✅'); }
      }
    }
  })();

  // If Start Bulk was pressed on a product page, once we arrive at index, auto-start
  (async ()=>{
    if (isDeferred() && isProductsIndex()){
      await sleep(800);
      const links = collectFromIndex();
      if (links.length){
        saveQueue(links);
        setDeferred(false);
        setActive(true);
        location.href = links[0];
      } else {
        toast('No product links detected on index. Scroll to load more.');
        setDeferred(false);
      }
    }
  })();

  // Hotkey: Ctrl+Shift+S → Run (works even if the panel is hidden)
  window.addEventListener('keydown', e=>{
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='s') window.qaRun();
  });

  console.log('[Auto Accept] userscript loaded on', location.href);
})();
