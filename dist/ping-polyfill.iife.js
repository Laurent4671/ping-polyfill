// ping-polyfill.iife.js — IIFE
// SPDX-License-Identifier: MIT
(function (global) {
  'use strict';
  const DEFAULT_POLICY = {
    ua: { allow: /Chrom(e|ium)|Edg|OPR/i, deny: /Firefox|Safari|Brave/i },
    dnt: "off",
    transparency: true,
  };
  function shouldActivate(uaString, featureProbe, policy = DEFAULT_POLICY) {
    if (policy.force === true) return true;
    if (policy.disable === true) return false;
    if (typeof global.PING_POLYFILL_FORCE === "boolean") return global.PING_POLYFILL_FORCE;
    if (featureProbe === true && policy.ua.allow.test(uaString)) return false;
    if (policy.ua.deny.test(uaString)) return true;
    return true;
  }
  function init(policy = DEFAULT_POLICY) {
    const uaString = navigator.userAgent;
    const probe = "ping" in HTMLAnchorElement.prototype;
    if (!shouldActivate(uaString, probe, policy)) return;
    if (policy.transparency) setTransparencyFlag();
    attachListeners(document);
  }
  function attachListeners(root = document) {
    root.addEventListener("click", handleClick, { capture: true, passive: false });
  }
  function handleClick(event) {
    if (event.defaultPrevented) return;
    if (event.button !== 0 && event.button !== 1) return;
    const link = event.target.closest("a[ping]");
    if (!link || !link.href) return;
    const urls = extractPingUrls(link);
    if (!urls.length) return;
    const from = computePingFrom(link, document);
    urls.forEach((url) => sendPing(url, from, link.href));
  }
  function extractPingUrls(link) {
    const raw = link.getAttribute("ping");
    if (!raw) return [];
    return raw.split(/\s+/).filter(Boolean).map((u) => {
      try { return new URL(u, location.href).href; } catch { return null; }
    }).filter(Boolean);
  }
  function computePingFrom(link, doc) {
    const policy = link.referrerPolicy ||
      (doc.querySelector("meta[name='referrer']")?.content) ||
      "strict-origin-when-cross-origin";
    const current = new URL(location.href);
    const origin = current.origin;
    switch (policy) {
      case "no-referrer": return "";
      case "origin":
      case "strict-origin": return origin;
      case "unsafe-url": return current.href;
      case "origin-when-cross-origin":
      case "strict-origin-when-cross-origin":
        try {
          const linkUrl = new URL(link.href);
          return linkUrl.origin === origin ? current.href : origin;
        } catch { return origin; }
      default: return origin;
    }
  }
  function sendPing(url, from, to) {
    if (navigator.sendBeacon?.(url, "PING")) return;
    fetch(url, {
      method: "POST",
      body: "PING",
      headers: { "Content-Type": "text/ping", "Ping-From": from, "Ping-To": to },
      mode: "no-cors",
      keepalive: true,
      cache: "no-store",
      redirect: "manual",
    }).catch(() => {});
  }
  function setTransparencyFlag() {
    try { document.documentElement.dataset.pingPolyfilled = "true"; }
    catch { try { document.documentElement.setAttribute("data-ping-polyfilled", "true"); } catch {} }
  }
  global.PINGPOLY = { init, shouldActivate };
  init();
})(typeof window !== "undefined" ? window : this);
