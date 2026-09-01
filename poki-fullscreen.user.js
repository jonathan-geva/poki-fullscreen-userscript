// ==UserScript==
// @name         Poki Fullscreen for Every Game
// @namespace    https://github.com/jonathan-geva/poki-fullscreen-userscript
// @version      1.0.0
// @description  Adds fullscreen mode to every game on Poki, even when Poki hides its own button.
// @author       Jonathan Geva
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

  function updateButton() {
    const button = document.getElementById(BUTTON_ID);
    if (!button) return;

    const isFullscreen = Boolean(getFullscreenElement());
    button.textContent = isFullscreen ? "×" : "⛶";
    button.title = isFullscreen ? "Vollbild beenden (Esc)" : "Vollbild";
    button.setAttribute("aria-label", button.title);
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #game-player {
        position: relative !important;
      }

      #${BUTTON_ID} {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 2147483647;
        display: grid;
        width: 44px;
        height: 44px;
        padding: 0;
        place-items: center;
        border: 0;
        border-radius: 12px;
        background: rgba(20, 20, 24, 0.78);
        box-shadow: 0 3px 14px rgba(0, 0, 0, 0.32);
        color: #fff;
        font: 700 29px/1 Arial, sans-serif;
        cursor: pointer;
        opacity: 0.72;
        transition: opacity 120ms ease, transform 120ms ease, background 120ms ease;
      }

      #${BUTTON_ID}:hover,
      #${BUTTON_ID}:focus-visible {
        background: rgba(20, 20, 24, 0.94);
        opacity: 1;
        outline: 3px solid #fff;
        outline-offset: 2px;
        transform: scale(1.05);
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

  function addButton() {
    const player = getGamePlayer();
    if (!player || document.getElementById(BUTTON_ID)) return;

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void toggleFullscreen();
    });

    player.appendChild(button);
    updateButton();
  }

  function initialize() {
    addStyles();
    enableIframeFullscreen();
    addButton();
  }

  document.addEventListener("fullscreenchange", updateButton);
  document.addEventListener("webkitfullscreenchange", updateButton);

  const observer = new MutationObserver(initialize);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  initialize();
})();
