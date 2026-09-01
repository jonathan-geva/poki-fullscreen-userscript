// ==UserScript==
// @name         Poki Fullscreen for Every Game
// @namespace    https://github.com/jonathan-geva/poki-fullscreen-userscript
// @version      1.1.0
// @description  Adds fullscreen mode to every game on Poki, even when Poki hides its own button.
// @author       Anonymous
// @match        https://poki.com/*/g/*
// @match        https://www.poki.com/*/g/*
// @icon         https://poki.com/favicon.ico
// @homepageURL  https://github.com/jonathan-geva/poki-fullscreen-userscript
// @supportURL   https://github.com/jonathan-geva/poki-fullscreen-userscript/issues
// @downloadURL  https://raw.githubusercontent.com/jonathan-geva/poki-fullscreen-userscript/main/poki-fullscreen.user.js
// @updateURL    https://raw.githubusercontent.com/jonathan-geva/poki-fullscreen-userscript/main/poki-fullscreen.user.js
// @grant        none
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const BUTTON_ID = "poki-universal-fullscreen-button";
  const STYLE_ID = "poki-universal-fullscreen-style";
  const ACTIVE_CLASS = "poki-universal-fullscreen-active";

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function getGamePlayer() {
    return document.querySelector("#game-player");
  }

  function enableIframeFullscreen() {
    const iframe = document.querySelector("#game-element");
    if (!iframe) return;

    iframe.allowFullscreen = true;
    iframe.setAttribute("allowfullscreen", "true");

    const permissions = new Set(
      (iframe.getAttribute("allow") || "")
        .split(";")
        .map((permission) => permission.trim())
        .filter(Boolean)
    );

    permissions.add("fullscreen");
    iframe.setAttribute("allow", [...permissions].join("; "));
  }

  async function toggleFullscreen() {
    const player = getGamePlayer();
    if (!player) return;

    try {
      if (getFullscreenElement()) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else if (player.requestFullscreen) {
        await player.requestFullscreen();
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      }
    } catch (error) {
      console.warn("[Poki Fullscreen] Fullscreen could not be toggled:", error);
    }
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${ACTIVE_CLASS} [role="img"] {
        background-color: #000 !important;
      }

      #game-player:fullscreen,
      #game-player:-webkit-full-screen {
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        background: #000 !important;
      }

      #game-player:fullscreen > div,
      #game-player:fullscreen iframe,
      #game-player:-webkit-full-screen > div,
      #game-player:-webkit-full-screen iframe {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function findReportButton() {
    const flagIcon = document.querySelector(
      'button span[style*="ui-icons-flag.svg"]'
    );

    if (flagIcon) return flagIcon.closest("button");

    return Array.from(document.querySelectorAll("button")).find((button) =>
      /report a bug/i.test(button.textContent || "")
    );
  }

  function makeButtonNative(button) {
    button.classList.add(ACTIVE_CLASS);
    button.title = "Fullscreen - Poki Fullscreen script active";
    button.setAttribute("aria-label", button.title);
  }

  function addButton() {
    const nativeButton = document.getElementById("fullscreen-button");
    const customButton = document.getElementById(BUTTON_ID);

    if (nativeButton) {
      customButton?.remove();
      makeButtonNative(nativeButton);
      return;
    }

    if (customButton) return;

    const reportButton = findReportButton();
    const reportWrapper = reportButton?.parentElement;
    const menu = reportWrapper?.parentElement;
    if (!reportButton || !reportWrapper || !menu) return;

    const button = reportButton.cloneNode(true);
    button.id = BUTTON_ID;
    button.type = "button";

    const icon = button.querySelector('[role="img"]');
    icon?.setAttribute("aria-label", "ui-icons-fullscreen");
    icon?.style.setProperty(
      "--icon-src",
      "url('https://a.poki-cdn.com/icons/ui-masks/ui-icons-fullscreen.svg')"
    );

    const labels = Array.from(button.querySelectorAll("span"));
    const visibleLabel = labels.find((label) =>
      /report a bug/i.test(label.textContent || "")
    ) || labels.at(-1);
    if (visibleLabel) visibleLabel.textContent = "Fullscreen";

    makeButtonNative(button);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void toggleFullscreen();
    });

    reportWrapper.after(button);
  }

  function initialize() {
    addStyles();
    enableIframeFullscreen();
    addButton();
  }

  const observer = new MutationObserver(initialize);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  initialize();
})();
