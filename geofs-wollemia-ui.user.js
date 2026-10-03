// ==UserScript==
// @name         GeoFS Wollemia UI
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Wollemia UI: Monochromatic MSFS-style HUD for GeoFS
// @author       Fendrixx and Hassan
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @grant        none
// @updateURL   https://raw.githubusercontent.com/hassanmaqbool12/GeoFS-Wollemia-UI/main/geofs-wollemia-ui.user.js
// @downloadURL https://raw.githubusercontent.com/hassanmaqbool12/GeoFS-Wollemia-UI/main/geofs-wollemia-ui.user.js
// @icon         https://raw.githubusercontent.com/hassanmaqbool12/GeoFS-Wollemia-UI/main/icon.svg
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const css = `
    .left {
        width:100%;
        display:flex;
        justify-content:left;
        align-items:normal;
    }
    .center {
        width:100%;
        display:flex;
        justify-content:center;
        align-items:center;
    }

    .right {
        width:100%;
        display:flex;
        justify-content:right;
        align-items:center;
    }

    .box {
        position: fixed;
        width:fit-content;
        top:0;
        justify-content:space-between;
    }

    .bottom-box {
        position: fixed;
        justify-content:space-between;
        bottom:40px;
        width:auto;
        padding:auto 4%;
    }

    .row {
        display:flex;
        flex-direction:row;
    }

    .column {
        display:flex;
        flex-direction:column;
    }

    #msfs-ui-root {
        position: fixed; inset: 0;
        height:fit-content;
        pointer-events: none; z-index: 99999;
        font-family: 'Consolas','Menlo',monospace; color: #fff;
        text-shadow: 0 0 2px #000;
        --bonsai-bottom: 10px;
    }
    #msfs-ui-root .panel {
        position: relative;
        background: rgba(0,0,0,0.55);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 3px;
        box-sizing: border-box;
        margin-top:6px;
        margin-left:0px;
    }
    #msfs-ui-root .label { font-size: 10px; color: #ccc; letter-spacing: 1px; }

    #msfs-hdg {
        position:fixed;
        bottom: 44px; left: 50%; transform: translateX(-50%);
        width: 360px; height: 30px;
        background: rgba(0,0,0,0.55);
    }
    #msfs-hdg .hdg-readout {
        position: absolute; top: -100%; left: 50%; transform: translate(-50%, 2px);
        background: #000; padding: 2px 10px; border: 1px solid #fff;
        font-weight: bold; font-size: 13px; z-index: 2; white-space: nowrap;
    }
    #msfs-hdg canvas { display: block; width: 100%; height: 100%; }
    #msfs-hdg .hdg-cursor {
        position: absolute; top: 0px; left: 50%; transform: translateX(-50%);
        width: 2; height: 4;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #fff;
        z-index: 2;
    }

    #msfs-spd {
        position: relative;
        width: 60px; height: 100%;
    }
    #msfs-spd .top-label, #msfs-spd .bot-label,
    #msfs-alt .top-label, #msfs-alt .bot-label {
        position:absolute; left:0; right:0; text-align:center;
        font-size:10px; color:#ccc; letter-spacing:1px;
    }
    #msfs-spd .top-label, #msfs-alt .top-label { top: 4px; }
    #msfs-spd .bot-label, #msfs-alt .bot-label { bottom: 4px; }

    #msfs-spd .tape, #msfs-alt .tape {
        position: absolute; top: 20px; bottom: 20px; left: 4px; right: 4px;
        overflow: hidden;
    }
    #msfs-spd .tape { border-left: 2px solid #fff; border-right: 1px solid #444; }
    #msfs-alt .tape { border-left: 1px solid #444; border-right: 2px solid #fff; }

    #msfs-spd .strip, #msfs-alt .strip {
        position: absolute; left: 0; right: 0;
    }
    #msfs-spd .tick, #msfs-alt .tick {
        position: relative; height: 24px; font-size: 11px; color: #ddd;
    }
    #msfs-spd .tick { padding-left: 6px; }
    #msfs-spd .tick::before {
        content:''; position:absolute; left:0; top:11px; width:6px; height:2px; background:#fff;
    }
    #msfs-alt .tick { text-align: right; padding-right: 6px; }
    #msfs-alt .tick::after {
        content:''; position:absolute; right:0; top:11px; width:6px; height:2px; background:#fff;
    }

    #msfs-spd .center, #msfs-alt .center {
        position: absolute; left: 0; right: 0; top: 50%; height: 24px;
        transform: translateY(-50%);
        background: #000; border: 1px solid #fff;
        font-size: 16px; font-weight: bold; text-align: center; line-height: 22px;
    }

    #msfs-thr {
        position: relative;
        width: 100%;
        height: 20%;
        padding:2px;
    }
    #msfs-thr .top-label, #msfs-thr .val {
        position:absolute; top:0; text-align:center; font-size:10px; color:#ccc;
    }
    #msfs-thr .top-label { left: 0px; letter-spacing: 1px; }
    #msfs-thr .val { right: 0px; }
    #msfs-thr .bar {
        background: linear-gradient(#1a1a1a,#000); border: 1px solid #4e4e4e;
    }
    #msfs-thr .fill {
        position: absolute; left: 0; bottom: 0;
        background: linear-gradient(#fff,#888); height: 50%;
    }

    /* Attitude indicator, stacked above flaps/spoilers, tall and narrow */
    #msfs-att {
        width: 60px; height: 100%;
        padding: 0;
    }
    #msfs-att .att-vs {
        position: absolute; top: 3px; left: 0; right: 0; text-align: center;
        font-size: 10px; color: #ccc; letter-spacing: 0px; z-index: 3;
    }
    #msfs-att .att-clip {
        position: absolute; top: 17px; left: 4px; right: 4px; bottom: 4px;
        max-width:100%;
        overflow: hidden; border: 1px solid rgba(255,255,255,0.3); background: #000;
    }
    #msfs-att .att-horizon {
        position: absolute; left: -30%; right: -30%; top: -50%; bottom: -50%;
        transform-origin: center center;
    }
    #msfs-att .att-sky    { position: absolute; left: 0; right: 0; top: 0; height: 50%; background: linear-gradient(#1a4d8f,#3a7bd5); }
    #msfs-att .att-ground { position: absolute; left: 0; right: 0; top: 50%; height: 50%; background: linear-gradient(#5c3a1e,#8a5a2e); }
    #msfs-att .att-line   { position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: #fff; }

    #msfs-att .att-rung {
        position: absolute; left: 16%; right: 16%;
        transform: translateY(-50%);
        display: flex; align-items: center; justify-content: space-between;
    }
    #msfs-att .att-rung.minor {
        left: 40%; right: 40%; justify-content: center;
    }
    #msfs-att .att-rung-line {
        height: 2px; background: #fff; flex: 1; margin: 0 4px;
    }
    #msfs-att .att-rung.minor .att-rung-line { margin: 0; }
    #msfs-att .att-rung-num {
        font-size: 9px; font-weight: bold; color: #ddd; line-height: 1;
    }

    #msfs-att .att-fixed {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
        width: 40px; height: 2px; background: #ffd24a; z-index: 4;
    }
    #msfs-att .att-fixed::before, #msfs-att .att-fixed::after {
        content: ''; position: absolute; top: 0; width: 12px; height: 2px; background: #ffd24a;
    }
    #msfs-att .att-fixed::before { left: -10px; transform: rotate(35deg); transform-origin: right center; }
    #msfs-att .att-fixed::after  { right: -10px; transform: rotate(-35deg); transform-origin: left center; }
    #msfs-att .att-fixed-dot {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
        width: 5px; height: 5px; border-radius: 50%;
        background: #ffd24a; border: 1px solid #000; z-index: 5;
    }

    #msfs-alt {
        height:100%;
        width:100px;
    }

    #msfs-spl, #msfs-flaps, #msfs-gear, #msfs-brk  {
        position: relative;
        width: 62px;
        height:30%;
        padding:6px;
        display: flex; align-items: center; justify-content: space-between;
        flex-direction: column; gap: 6px;
        pointer-events:auto;
    }
        
    #msfs-gear .lbl, #msfs-brk .lbl, #msfs-spl .lbl, #msfs-flaps .lbl {
        font-size: 9px;
        width:100%;
        letter-spacing: 1.5px;
        color: #ffffff;
        text-transform: uppercase;
        font-weight:bold;
    }
    #msfs-gear .val, #msfs-brk .val, #msfs-spl .val, #msfs-flaps .val {
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 1.5px;
        color: #ddd;
        width:70%;
        padding: 4px 6px;
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 2px;
        background: rgba(0,0,0,0.4);
        display:flex;
        justify-content:center;
        align-items:center;
    }

    #msfs-spl .val.on  { color: #fff; background: rgba(180,140,0,0.4);  border-color: #db3; }
    #msfs-spl .val.off { color: #aaa; }
    #msfs-gear .val.on  { color: #fff; background: rgba(0, 228, 0, 0.35); border-color: #6c6; }
    #msfs-gear .val.tran { color: #fff; background: rgba(235, 184, 0, 0.45); border-color: #db3; animation: sos 1s ease-in-out infinite;}
    #msfs-gear .val.off { color: #fff; background: rgba(235, 0, 0, 0.35); border-color: #c66; }
    #msfs-brk  .val.on  { color: #fff; background: rgba(235, 184, 0, 0.45);  border-color: #db3; }
    #msfs-brk  .val.off { color: #aaa; }

    @keyframes sos {
    0% {background-color: rgba(235, 184, 0, 0.45); border-color: #db3;}
    50% {background-color: transparent; border: 1px solid rgba(255,255,255,0.25);}
    100% {background-color: rgba(235, 184, 0, 0.45); border-color: #db3; }
    }

    #msfs-thr.reverse .bar { border-color: #db3 !important; }
    #msfs-thr.reverse .fill {
        background: linear-gradient(#ffd24a, #b58a00) !important;
    }
    #msfs-thr.reverse .top-label,
    #msfs-thr.reverse .val { color: #ffd24a !important; }

    .geofs-ui-bottom {
        background: rgba(0,0,0,0.55) !important;
        border: 1px solid rgba(255,255,255,0.18) !important;
        border-radius: 0px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        padding: 3px 8px !important;
        min-height: 36px !important;
        height: 36px !important;
        line-height: 30px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-wrap: nowrap !important;
        gap: 4px !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        width: 100% !important;
        bottom: 0px !important;
    }
    .geofs-ui-bottom .mdl-button {
        color: #e0e0e0 !important;
        font-family: 'Consolas','Menlo',monospace !important;
        font-size: 11px !important;
        letter-spacing: 1px !important;
        text-transform: uppercase !important;
        background: rgba(30,30,30,0.55) !important;
        border: 1px solid rgba(255,255,255,0.15) !important;
        border-radius: 3px !important;
        margin: 0 2px !important;
        height: 26px !important;
        min-height: 26px !important;
        line-height: 24px !important;
        padding: 0 8px !important;
        vertical-align: middle !important;
        transition: background 0.15s, border-color 0.15s !important;
    }
    .geofs-ui-bottom .mdl-button:hover {
        background: rgba(180,180,180,0.25) !important;
        border-color: #fff !important;
        color: #fff !important;
    }
    .geofs-ui-bottom .mdl-button--icon {
        padding: 0 !important;
        width: 28px !important;
        min-width: 28px !important;
        height: 26px !important;
        border-radius: 3px !important;
    }
    .geofs-ui-bottom .mdl-button .material-icons {
        font-size: 16px !important;
        line-height: 24px !important;
        vertical-align: middle !important;
        color: #ddd !important;
    }
    .geofs-ui-bottom .geofs-ui-bottom-box {
        background: rgba(0,0,0,0.35) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        border-radius: 3px !important;
        padding: 1px 3px !important;
        margin: 0 3px !important;
        height: 28px !important;
        display: inline-flex !important;
        align-items: center !important;
        vertical-align: middle !important;
        float: none !important;
    }
    .geofs-ui-bottom .geofs-ui-bottom-box .mdl-button {
        background: transparent !important;
        border: none !important;
        margin: 0 !important;
        height: 24px !important;
        min-height: 24px !important;
        width: 26px !important;
        min-width: 26px !important;
    }
    .geofs-ui-bottom .geofs-chat-input-section {
        background: rgba(0,0,0,0.35) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        border-radius: 3px !important;
        padding: 0 6px !important;
        height: 28px !important;
        display: inline-flex !important;
        align-items: center !important;
    }
    .geofs-ui-bottom .geofs-chat-input-section input {
        color: #fff !important;
        font-family: 'Consolas','Menlo',monospace !important;
        font-size: 11px !important;
    }
    .geofs-ui-bottom .geofs-chat-input-section .mdl-textfield__label {
        color: #ccc !important;
        font-size: 11px !important;
    }
    .geofs-ui-bottom .mdl-button.geofs-toggled,
    .geofs-ui-bottom .mdl-button.is-active {
        background: rgba(220,220,220,0.35) !important;
        border-color: #fff !important;
        color: #fff !important;
    }
    .geofs-ui-bottom .geofs-button-fullscreen {
        float: none !important;
    }
    .geofs-recordPlayer-slider {
        position: fixed !important;
        width: 380px !important;
        min-width: 380px !important;
        height: 14px !important;
        background: rgba(0,0,0,0.6) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        border-radius: 7px !important;
        bottom: 108px !important;
        left: 50% !important;
        right: auto !important;
        top: auto !important;
        transform: translateX(-50%) !important;
        padding: 0 !important;
        margin: 0 !important;
        z-index: 2147483647 !important;
        display: block !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
        backdrop-filter: blur(4px) !important;
        -webkit-backdrop-filter: blur(4px) !important;
    }
    .geofs-recordPlayer-slider .slider-rail {
        width: 100% !important;
        height: 100% !important;
        background: transparent !important;
    }
    .geofs-recordPlayer-slider .slider-selection {
        height: 100% !important;
        background: rgba(255,255,255,0.3) !important;
        border-radius: 7px !important;
    }
    .geofs-recordPlayer-slider .slider-grippy {
        width: 14px !important;
        height: 22px !important;
        margin-top: -4px !important;
        background: #fff !important;
        border-radius: 3px !important;
        box-shadow: 0 0 4px rgba(0,0,0,0.8) !important;
        position: absolute !important;
        right: -7px !important;
        cursor: pointer !important;
        top: 0 !important;
    }
    .geofs-recordPlayer-slider .slider-input {
        opacity: 0 !important;
        width: 100% !important;
        height: 100% !important;
        cursor: pointer !important;
        position: absolute !important;
        inset: 0 !important;
    }

    .geofs-overlay[style*="images/instruments/"] {
        display: none !important;
    }

    .geofs-overlay[style*="images/instruments/wind/"] {
        display: block !important;
    }
    .geofs-instrument-background {
        display: none !important;
    }

    .geofs-autopilot-pad {
        border-radius:3px !important;;
    }

    .geofs-overlay {
        border-radius:3px !important;;
    }

    .numberDown, .numberUp, .geofs-autopilot-bar, .geofs-autopilot-switch, .switchRight {
        border-radius: 3px 0px 0px 3px !important;
    }

    .numberUp, .switchRight {
        border-radius: 0px 3px 3px 0px !important;
    }

    .green-pad {
        background: #323762 !important
    }

    .geofs-sd-logo,
    .geofs-sr-logo,
    .geofs-hd-logo {
        display: none !important;
    }

    .geofs-inline-overlay.spoiler-overlay,
    .geofs-inline-overlay.brakes-overlay,
    .geofs-inline-overlay.gear-overlay,
    .geofs-inline-overlay.flaps-overlay,
    .spoiler-overlay,
    .brakes-overlay,
    .gear-overlay,
    .flaps-overlay,
    .geofs-screenshot {
        display: none !important;
    }

    .geofs-chat,
    .geofs-chat-container,
    .geofs-chat-messages,
    .geofs-chat-message-list,
    #geofs-chat-messages {
        position: fixed !important;
        left: 16px !important;
        top: 60px !important;
        bottom: auto !important;
        width: 226px !important;
        max-width: 226px !important;
        height: 50px !important;
        max-height: 50px !important;
        overflow: hidden !important;
        padding-left: 0 !important;
        box-sizing: border-box !important;
    }
    .geofs-chat-message {
        margin-left: 0 !important;
        max-width: 226px !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
    }

    .geofs-list,
    .geofs-aircraft-list,
    .geofs-location-list,
    .geofs-map-list,
    .geofs-preference-list,
    .geofs-player-list,
    .livery-list,
    .geofs-debug,
    .mdl-menu__container.is-visible {
        z-index: 2147483600 !important;
    }

    body.msfs-menu-open #msfs-spd,
    body.msfs-menu-open #msfs-thr,
    body.msfs-menu-open #msfs-flaps,
    body.msfs-menu-open #msfs-spl,
    body.msfs-menu-open #msfs-att,
    body.msfs-menu-open .geofs-autopilot-pad,
    body.msfs-menu-open .geofs-radio-pad,
    body.msfs-menu-open .geofs-autopilot-controls,
    body.msfs-menu-open .geofs-radio-controls,
    body.msfs-menu-open .geofs-radio,
    body.msfs-menu-open .geofs-radio-list {
        opacity: 0 !important;
        pointer-events: none !important;
    }
    #msfs-spd, #msfs-thr, #msfs-flaps, #msfs-spl, #msfs-att {
        transition: opacity 0.2s ease, background 0.15s, border-color 0.15s !important;
    }

    #bonsai-landing-popup {
        position: fixed;
        bottom: 56px;
        left: 50%;
        transform: translate(-50%, 12px);
        z-index: 2147483647;
        padding: 6px 12px;
        background: rgba(0,0,0,0.78);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 6px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.6);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #fff;
        font-family: 'Consolas','Menlo',monospace;
        text-align: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2,0.8,0.2,1);
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
    }
    #bonsai-landing-popup.show {
        opacity: 1;
        transform: translate(-50%, 0);
    }
    #bonsai-landing-popup .bl-fpm {
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 1.5px;
        line-height: 1;
    }
    #bonsai-landing-popup .bl-fpm-unit {
        font-size: 10px;
        color: #bbb;
        letter-spacing: 1.5px;
        text-transform: uppercase;
    }
    #bonsai-landing-popup .bl-grade {
        display: inline-block;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 2px;
        text-transform: uppercase;
        border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.2);
    }
    #bonsai-landing-popup .bl-grade.butter     { background: #1e6b1e; color: #fff; }
    #bonsai-landing-popup .bl-grade.great      { background: #2c8a2c; color: #fff; }
    #bonsai-landing-popup .bl-grade.acceptable { background: #b58a00; color: #000; }
    #bonsai-landing-popup .bl-grade.hard       { background: #a83232; color: #fff; }
    #bonsai-landing-popup .bl-grade.crash      { background: #5c0000; color: #fff; }
    #bonsai-landing-popup .bl-title {
        font-size: 9px;
        color: #aaa;
        letter-spacing: 2px;
        text-transform: uppercase;
    }

    .geofs-radio-pad {
        margin:0px 0px 50px 0px;
        border-radius:3px;
    }

    .geofs-radio-controls {
        margin-left:30px;
        margin-bottom:80px;
    }

    .geofs-wind-container {
        width:45%;
        height:60%;
        max-height:75px;
        align-items:center;
        max-width:50px;
        background: rgba(0,0,0,0.55);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 3px;
        box-sizing: border-box;
    }

    .control-pad-transparent, .control-pad {
        border-radius:3px;
    }

    body.msfs-hidden #msfs-ui-root,
    body.msfs-hidden #bonsai-landing-popup { display: none !important; }

    body .geofs-alarms-container,
    body .geofs-control-status,
    body .geofs-crashOverlay,
    body .geofs-message,
    body .geofs-warning {
        position: fixed !important;
        left: 50% !important;
        right: auto !important;
        top: auto !important;
        bottom: 120px !important;
        transform: translateX(-50%) !important;
        z-index: 2147483640 !important;
        margin: 0 !important;
        width: auto !important;
        height: auto !important;
        border-radius:3px;
        float: none !important;
        pointer-events: none;
    }
    body .geofs-control-status { bottom: 100px !important; pointer-events: auto; }
    body .geofs-alarms-container .geofs-textOverlay {
        position: relative !important;
        margin: 0 4px !important;
        transform: none !important;
        transform-origin: 0 0 !important;
    }

    #bonsai-settings-btn {
        position: fixed;
        bottom: 0px;
        right: 8px;
        z-index: 2147483646;
        width: 32px;
        height: 32px;
        background:transparent;
        border:none;
        color: #fff;
        font-family: 'Consolas','Menlo',monospace;
        font-size: 23px;
        cursor: pointer;
        -webkit-backdrop-filter: blur(8px);
        pointer-events: auto;
    }
    #bonsai-settings-btn:hover { background: rgba(0,0,0,0.75); }
    body.msfs-hidden #bonsai-settings-btn { display: none !important; }

    #bonsai-settings {
        position: fixed;
        top: 55px;
        right: 4px;
        z-index: 2147483646;
        width: 320px;
        max-height: 80vh;
        overflow-y: auto;
        background: rgba(0,0,0,0.82);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 6px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #fff;
        font-family: 'Consolas','Menlo',monospace;
        font-size: 12px;
        padding: 14px 16px;
        display: none;
        pointer-events: auto;
    }
    #bonsai-settings.show { display: block; }
    #bonsai-settings h3 {
        font-size: 12px; letter-spacing: 3px; margin: 0 0 10px; color: #ccc;
        border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px;
    }
    #bonsai-settings h4 {
        font-size: 10px; letter-spacing: 2px; margin: 12px 0 6px; color: #888;
    }
    #bonsai-settings .row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 4px 0;
    }
    #bonsai-settings .row label { flex: 1; cursor: pointer; }
    #bonsai-settings input[type="checkbox"] { accent-color: #fff; cursor: pointer; }
    #bonsai-settings input[type="range"] { width: 130px; }
    #bonsai-settings input[type="text"] {
        width: 60px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.25);
        color: #fff; padding: 2px 6px; font-family: inherit; text-align: center;
        text-transform: uppercase;
    }
    #bonsai-settings .hint { color: #888; font-size: 10px; margin-top: 4px; }
    #bonsai-settings button.reset {
        margin-top: 10px; width: 100%; padding: 6px;
        background: rgba(255,255,255,0.08); color: #fff;
        border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
        font-family: inherit; letter-spacing: 2px; font-size: 11px;
    }
    #bonsai-settings button.reset:hover { background: rgba(255,255,255,0.18); }
    `;

    function buildSpeedTicks() {
        let html = '';
        for (let v = 800; v >= 0; v -= 10) html += `<div class="tick">${v}</div>`;
        return html;
    }
    function buildAltTicks() {
        let html = '';
        for (let v = 60000; v >= 0; v -= 200) html += `<div class="tick">${v}</div>`;
        return html;
    }

    const ATT_PX_PER_DEG = 1.3;
    function buildPitchLadder() {
        let html = '';
        for (let d = -90; d <= 90; d += 10) {
            if (d === 0) continue;
            const y = -d * ATT_PX_PER_DEG;
            const label = Math.abs(d);
            if (d % 30 === 0) {
                html += `<div class="att-rung major" style="top:calc(50% + ${y}px)">
                    <span class="att-rung-num">${label}</span>
                    <span class="att-rung-line"></span>
                    <span class="att-rung-num">${label}</span>
                </div>`;
            } else {
                html += `<div class="att-rung minor" style="top:calc(50% + ${y}px)">
                    <span class="att-rung-line"></span>
                </div>`;
            }
        }
        return html;
    }

    // Globals
    let VERSION = geofs.version;
    let SPOILERS_ARMED = false;
    let FLAPS = null;
    let GEARS = null;
    let BRAKES = null;
    let SPOILERS = null;
    let ENGINE = null;

    const SETTINGS_KEY = 'bonsaiUISettings_v1';
    const PANELS = [
        { id: 'msfs-hdg', label: 'Heading compass' },
        { id: 'msfs-spd', label: 'Airspeed tape' },
        { id: 'msfs-alt', label: 'Altitude tape' },
        { id: 'msfs-thr', label: 'Throttle gauge' },
        { id: 'msfs-flaps', label: 'Flaps indicator' },
        { id: 'msfs-spl', label: 'Spoilers indicator' },
        { id: 'msfs-att', label: 'Attitude indicator' },
        { id: 'msfs-gear', label: 'Gear indicator' },
        { id: 'msfs-brk', label: 'Brakes indicator' },
    ];
    const DEFAULT_SETTINGS = {
        panels: Object.fromEntries(PANELS.map(p => [p.id, true])),
        opacity: 1.0,
        hideHotkey: 'h',
        landingPopup: true,
    };
    let _settings = loadSettings();

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            const parsed = JSON.parse(raw);
            return {
                panels: { ...DEFAULT_SETTINGS.panels, ...(parsed.panels || {}) },
                opacity: typeof parsed.opacity === 'number' ? parsed.opacity : DEFAULT_SETTINGS.opacity,
                scale: typeof parsed.scale === 'number' ? parsed.scale : DEFAULT_SETTINGS.scale,
                bottomOffset: typeof parsed.bottomOffset === 'number' ? parsed.bottomOffset : DEFAULT_SETTINGS.bottomOffset,
                hideHotkey: parsed.hideHotkey || DEFAULT_SETTINGS.hideHotkey,
                landingPopup: parsed.landingPopup !== false,
            };
        } catch (e) {
            return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    }
    function saveSettings() {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings)); } catch (e) { console.error(e); }
    }
    const PANEL_ORIGINS = {
        'msfs-hdg': 'top center',
        'msfs-spd': 'bottom left',
        'msfs-thr': 'bottom left',
        'msfs-flaps': 'bottom left',
        'msfs-spl': 'bottom left',
        'msfs-att': 'bottom left',
        'msfs-alt': 'bottom right',
        'msfs-gear': 'bottom right',
        'msfs-brk': 'bottom right',
        'msfs-wind': 'bottom right',
    };
    function applySettings() {
        const root = document.getElementById('msfs-ui-root');
        if (root) {
            root.style.opacity = String(_settings.opacity);
            root.style.setProperty('--bonsai-bottom', (_settings.bottomOffset || 0) + 'px');
        }
        const sc = _settings.scale || 1;
        for (const p of PANELS) {
            const el = document.getElementById(p.id);
            if (!el) continue;
            el.style.display = _settings.panels[p.id] ? '' : 'none';
            //el.style.transformOrigin = PANEL_ORIGINS[p.id] || 'top left';
            const baseTransform = (p.id === 'msfs-hdg') ? 'translateX(-50%)' : '';
            //const scaleTransform = (sc === 1) ? '' : `scale(${sc})`;
            //el.style.transform = [baseTransform, scaleTransform].filter(Boolean).join(' ');
        }
        const popup = document.getElementById('bonsai-landing-popup');
        if (popup && !_settings.landingPopup) {
            popup.classList.remove('show');
        }
    }

    function buildSettingsPanel() {
        if (document.getElementById('bonsai-settings')) return;

        const btn = document.createElement('button');
        btn.id = 'bonsai-settings-btn';
        btn.textContent = '⚙';
        btn.title = 'Bonsai UI settings';
        document.body.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = 'bonsai-settings';
        panel.innerHTML = `
            <h3>BONSAI UI</h3>
            <h4>ELEMENTS</h4>
            ${PANELS.map(p => `
                <div class="row">
                    <label for="bs-${p.id}">${p.label}</label>
                    <input type="checkbox" id="bs-${p.id}" data-panel="${p.id}">
                </div>
            `).join('')}
            <div class="row">
                <label for="bs-landing">Landing FPM popup</label>
                <input type="checkbox" id="bs-landing">
            </div>
            <h4>OPACITY</h4>
            <div class="row">
                <input type="range" id="bs-opacity" min="0.1" max="1" step="0.05">
                <span id="bs-opacity-val">100%</span>
            </div>
            <h4>HIDE HOTKEY</h4>
            <div class="row">
                <label for="bs-hotkey">Toggle HUD key</label>
                <input type="text" id="bs-hotkey" maxlength="12" readonly>
            </div>
            <div class="hint">Click box, then press a key.</div>
            <button class="reset" id="bs-reset">RESET TO DEFAULTS</button>
        `;
        document.body.appendChild(panel);

        btn.addEventListener('click', () => {
            panel.classList.toggle('show');
            btn.blur();
        });

        for (const p of PANELS) {
            const cb = panel.querySelector(`#bs-${p.id}`);
            cb.checked = !!_settings.panels[p.id];
            cb.addEventListener('change', () => {
                _settings.panels[p.id] = cb.checked;
                saveSettings(); applySettings();
            });
        }

        const landing = panel.querySelector('#bs-landing');
        landing.checked = !!_settings.landingPopup;
        landing.addEventListener('change', () => {
            _settings.landingPopup = landing.checked;
            saveSettings(); applySettings();
        });

        const op = panel.querySelector('#bs-opacity');
        const opVal = panel.querySelector('#bs-opacity-val');
        op.value = _settings.opacity;
        opVal.textContent = Math.round(_settings.opacity * 100) + '%';
        op.addEventListener('input', () => {
            _settings.opacity = parseFloat(op.value);
            opVal.textContent = Math.round(_settings.opacity * 100) + '%';
            saveSettings(); applySettings();
        });

        const hk = panel.querySelector('#bs-hotkey');
        hk.value = _settings.hideHotkey.toUpperCase();
        hk.addEventListener('focus', () => { hk.value = '...'; });
        hk.addEventListener('blur', () => { hk.value = _settings.hideHotkey.toUpperCase(); });
        hk.addEventListener('keydown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.key === 'Escape' || e.key === 'Tab') { hk.blur(); return; }
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
            _settings.hideHotkey = k;
            hk.value = k.toUpperCase();
            saveSettings();
            hk.blur();
        });

        panel.querySelector('#bs-reset').addEventListener('click', () => {
            _settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            saveSettings();
            panel.remove();
            btn.remove();
            buildSettingsPanel();
            applySettings();
        });
    }

    function wireHideHotkey() {
        window.addEventListener('keydown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            const k = (e.key || '').toLowerCase();
            if (k === _settings.hideHotkey) {
                document.body.classList.toggle('msfs-hidden');
            }
        }, true);
    }

    async function waitForGeoFS() {
        while (!window.geofs?.api?.addFrameCallback) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async function init() {
        if (document.getElementById('msfs-ui-root')) return;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        const root = document.createElement('div');
        root.id = 'msfs-ui-root';
        root.innerHTML = `

            <div class="" id="msfs-hdg">
                <div class="hdg-readout"><span id="v-hdg">000</span>°</div>
                <div class="hdg-cursor"></div>
                <canvas id="c-hdg" width="420" height="33"></canvas>
            </div>

            <div class="bottom-box left column" style="height:42%; left:5px; bottom:47px; width:18%; max-width:137px">

                <div class="panel left" id="msfs-thr">
                    <div class="center" style="padding:4px">
                        <div class="top-label left">THROTTLE</div>
                        <div class="val right" id="v-thr-pct">0%</div>
                    </div>
                    <div class="bar"><div class="fill center" id="v-thr-fill"></div></div>
                </div>

                <div class="center row" style="justify-content:space-between; gap:7px; height:100%">

                    <div class="left column" style="width:100%; justify-content:space-between; height:100%;">

                        <div class="panel left" id="msfs-spd" style="width:auto;">
                            <div class="top-label">AIRSPEED</div>
                            <div class="tape"><div class="strip" id="spd-strip">${buildSpeedTicks()}</div></div>
                            <div class="center" id="v-ias">0</div>
                            <div class="bot-label">KTS</div>
                        </div>

                    </div>

                    <div class="center column" style="height:100%;">

                        <div class="panel" id="msfs-att">
                            <div class="att-vs" id="v-vs">0 FPM</div>
                            <div class="att-clip">
                                <div class="att-horizon" id="att-horizon">
                                    <div class="att-sky"></div>
                                    <div class="att-ground"></div>
                                    <div class="att-line"></div>
                                    ${buildPitchLadder()}
                                </div>
                                <div class="att-fixed"></div>
                                <div class="att-fixed-dot"></div>
                            </div>
                        </div>

                        <button class="panel" id="msfs-flaps">
                            <div class="lbl">FLAPS</div>
                            <div class="val" id="v-flaps">0/0</div>
                        </button>

                    </div>

                </div>

            </div>

            <div class="bottom-box right row" style="justify-content:space-between; gap:8px; height:34%;right:5px; bottom:47px; width:18%; max-width:137px">

                <div class="right column" style="justify-content:space-between; width:64px">

                    <button class="panel" id="msfs-gear">
                        <div class="lbl center">GEAR</div>
                        <div class="val off" id="v-gear">UP</div>
                    </button>

                    <button class="panel" id="msfs-brk" >
                        <div class="lbl center">BRKS</div>
                        <div class="val off" id="v-brk">OFF</div>
                    </button>

                    <div class="panel right" id="msfs-spl">
                        <div class="lbl center">SPLRS</div>
                        <button class="val off" id="v-spl" style='width:100%;'>RET</button>
                        <button class="val off" id="v-auto-spl" style='width:100%;'>STW</button>
                    </div>

                </div>

                <div class="panel left" id="msfs-alt">
                    <div class="top-label">ALTITUDE</div>
                    <div class="tape"><div class="strip" id="alt-strip">${buildAltTicks()}</div></div>
                    <div class="center" id="v-alt">0</div>
                    <div class="bot-label">FT</div>
                </div>

            </div>

        `;
        document.body.appendChild(root);

        wireMenuWatcher();
        buildSettingsPanel();
        wireHideHotkey();
        applySettings();

        await waitForGeoFS();
        const callbackId = geofs.api.addFrameCallback(loop);
    }

    function wireMenuWatcher() {
        const MENU_SELECTORS = [
            '.geofs-list',
            '.geofs-aircraft-list',
            '.geofs-location-list',
            '.geofs-map-list',
            '.geofs-preference-list',
            '.geofs-player-list',
            '.livery-list',
            '.geofs-debug',
            '.geofs-settings',
            '.geofs-options',
            '.geofs-ui-left.is-visible',
            '.mdl-menu__container.is-visible'
        ];
        const isMenuOpen = () => {
            for (const sel of MENU_SELECTORS) {
                for (const el of document.querySelectorAll(sel)) {
                    if (el.offsetParent === null) continue;
                    const cs = getComputedStyle(el);
                    if (cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05) {
                        return true;
                    }
                }
            }
            return false;
        };
        setInterval(() => {
            document.body.classList.toggle('msfs-menu-open', isMenuOpen());
        }, 200);
    }

    function drawCompass(ctx, hdg) {
        const canvas = ctx.canvas;
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const PX_PER_DEG = 3;
        const cx = W / 2;
        const startDeg = ((hdg - (W / 2) / PX_PER_DEG) % 360 + 360) % 360;
        const visibleDeg = W / PX_PER_DEG;

        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const firstTick = Math.ceil(startDeg / 5) * 5;

        for (let d = firstTick; d <= startDeg + visibleDeg + 5; d += 5) {
            const deg = ((d % 360) + 360) % 360;
            const x = (d - startDeg) * PX_PER_DEG;

            const isMajor = deg % 30 === 0;
            const isMid = deg % 10 === 0;

            const tickHeight = isMajor ? 10 : (isMid ? 7 : 4);

            ctx.lineWidth = isMajor ? 2 : 1;
            ctx.beginPath();

            // Ticks grow upward from the bottom
            ctx.moveTo(x, H);
            ctx.lineTo(x, H - tickHeight);

            ctx.stroke();

            if (isMajor) {
                let label;

                if (deg === 0) label = 'N';
                else if (deg === 90) label = 'E';
                else if (deg === 180) label = 'S';
                else if (deg === 270) label = 'W';
                else label = String(deg / 10).padStart(2, '0');

                // Numbers above the bottom ticks
                ctx.fillText(label, x, H - tickHeight - 2);
            }
        }
    }

    function readState() {
        const g = window.geofs;
        if (!g) return null;
        const av = g.animation?.values || g.aircraft?.instance?.animationValue;
        if (!av) return null;

        let thr = 0;
        let rawThr = null;
        const ctrls = g.controls?.controls;
        if (ctrls && typeof ctrls.throttle === 'number') rawThr = ctrls.throttle;
        else if (typeof av.throttle === 'number') rawThr = av.throttle;
        else if (g.aircraft?.instance?.engine?.[0]?.throttle != null)
            rawThr = g.aircraft.instance.engine[0].throttle;
        const reverse = (typeof rawThr === 'number' && rawThr < 0)
            || !!av.reverse
            || !!av.thrustReverse
            || !!(g.aircraft?.instance?.engine?.[0]?.reverse)
            || !!(ctrls && ctrls.reverseThrust);
        thr = (typeof rawThr === 'number') ? Math.abs(rawThr) : 0;
        if (thr > 1) thr = thr / 100;
        if (thr > 1) thr = 1;

        let spl = 0;
        if (ctrls && typeof ctrls.airbrakes === 'number') spl = ctrls.airbrakes;
        else if (ctrls && typeof ctrls.spoilers === 'number') spl = ctrls.spoilers;
        else if (typeof av.airbrakesPosition === 'number') spl = av.airbrakesPosition;
        else if (typeof av.spoilersPosition === 'number') spl = av.spoilersPosition;
        if (spl < 0) spl = 0;
        if (spl > 1) spl = spl / 100;

        let gearDown;
        if (typeof av.gearPosition === 'number') {
            if(av.gearPosition > 0 && av.gearPosition < 1) gearDown = av.gearPosition;
            else gearDown = av.gearPosition == 0;
        }
        else if (typeof av.landingGearPosition === 'number') gearDown = av.landingGearPosition < 0.5;
        else if (ctrls && typeof ctrls.gear === 'boolean') gearDown = !ctrls.gear;
        else if (ctrls && typeof ctrls.gear === 'number') gearDown = ctrls.gear < 0.5;

        let brakesOn = false;

        if (ctrls) {
            if (typeof ctrls.brakes === 'boolean') {
                brakesOn = ctrls.brakes;
            } else if (typeof ctrls.brakes === 'number') {
                brakesOn = ctrls.brakes > 0.05;
            } else if (typeof ctrls.parkingBrake === 'boolean') {
                brakesOn = ctrls.parkingBrake;
            } else if (typeof ctrls.parkingBrake === 'number') {
                brakesOn = ctrls.parkingBrake > 0.05;
            }
        }

        if (!brakesOn) {
            if (typeof av.brakesPosition === 'number') {
                const v = av.brakesPosition > 1
                    ? av.brakesPosition / 100
                    : av.brakesPosition;

                brakesOn = v > 0.05;
            } else if (typeof av.parkingBrake === 'number') {
                const v = av.parkingBrake > 1
                    ? av.parkingBrake / 100
                    : av.parkingBrake;

                brakesOn = v > 0.05;
            } else if (typeof av.parkingBrake === 'boolean') {
                brakesOn = av.parkingBrake;
            }
        }

        let flapStage = g.animation.getValue('flapsTarget') ?? 0;
        let flapMax = g.animation.getValue('flapsSteps') ?? 0;

        // Pitch/roll/vertical-speed for the attitude indicator. GeoFS doesn't
        // publish an official API, so the property names below are best.
        let pitch = 0, roll = 0;
        if (typeof geofs.animation.getValue("atilt") === 'number') pitch = window.geofs.animation.getValue("atilt");
        else if (typeof av.pitchAngle === 'number') pitch = av.pitchAngle;

        if (typeof geofs.animation.getValue("aroll") === "number") roll = window.geofs.animation.getValue("aroll");
        else if (typeof av.bank === 'number') roll = av.bank;
        //const RAD2DEG = 180 / Math.PI;
        pitch = -pitch;
        roll = -roll;

        const vs = av.verticalSpeed ?? av.verticalSpeed1 ?? 0;

        return {
            ias: av.kias ?? av.ias ?? 0,
            alt: av.altitude ?? av.altitude1 ?? 0,
            hdg: ((av.heading360 ?? av.heading ?? 0) + 360) % 360,
            flapStage,
            flapMax,
            throttle: thr,
            reverse,
            spoilers: spl,
            gearDown,
            brakesOn,
            pitch,
            roll,
            vs,
        };
    }

    let _lastHdg = 0;
    function loop() {
        if(geofs.isPaused()) return;

        const s = readState();
        if (s) {
            _lastHdg = s.hdg;
            const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            set('v-ias', Math.round(s.ias));
            set('v-alt', Math.round(s.alt));
            set('v-hdg', String(Math.round(s.hdg)).padStart(3, '0'));

            const spdStrip = document.getElementById('spd-strip');
            if (spdStrip) {
                const tapeH = spdStrip.parentElement.clientHeight;
                const offset = ((400 - s.ias) / 10) * 24;
                spdStrip.style.top = (tapeH / 2 - offset - 12) + 'px';
            }
            const altStrip = document.getElementById('alt-strip');
            if (altStrip) {
                const tapeH = altStrip.parentElement.clientHeight;
                const offset = ((50000 - s.alt) / 200) * 24;
                altStrip.style.top = (tapeH / 2 - offset - 12) + 'px';
            }

            if(FLAPS === null || FLAPS != s.flapStage + s.flapMax) {
                const vFlaps = document.getElementById('v-flaps');
                if (vFlaps) {
                    vFlaps.textContent = `${s.flapStage ?? 'NA'} / ${s.flapMax ?? 'NA'}`;
                    FLAPS = s.flapStage + s.flapMax;
                }
            }
    
            if(ENGINE == null || ENGINE != s.throttle) {

                const thrFill = document.getElementById('v-thr-fill');
                const thrPct = document.getElementById('v-thr-pct');
                if (thrFill) {
                    ENGINE = s.throttle;
                    const pct = Math.max(0, Math.min(1, s.throttle));
                    thrFill.style.width = (pct * 100) + '%';
                    if (thrPct) thrPct.textContent = Math.round(pct * 100) + '%';
                }
                const thrPanel = document.getElementById('msfs-thr');
                if (thrPanel) thrPanel.classList.toggle('reverse', !!s.reverse);
            }

            if(GEARS == null || GEARS != s.gearDown) {

                const vGear = document.getElementById('v-gear');
                if (vGear) {
                    GEARS = s.gearDown;
                    if(typeof s.gearDown === "number") {
                        vGear.textContent = "TRAN";
                        vGear.classList.remove('on');
                        vGear.classList.remove('off');
                        vGear.classList.add('tran');
                    } else {
                        vGear.textContent = s.gearDown ? 'DOWN' : 'UP';
                        vGear.classList.remove('tran')
                        vGear.classList.toggle('on', !!s.gearDown);
                        vGear.classList.toggle('off', !s.gearDown);
                    }
                }
            }

            if(BRAKES == null || BRAKES != s.brakesOn) {

                const vBrk = document.getElementById('v-brk');
                if (vBrk) {
                    BRAKES = s.brakesOn;
                    vBrk.textContent = s.brakesOn ? 'ON' : 'OFF';
                    vBrk.classList.toggle('on', !!s.brakesOn);
                    vBrk.classList.toggle('off', !s.brakesOn);
                }
            }
            
            if(SPOILERS == null || SPOILERS !== s.spoilers) {

                const vSpl = document.getElementById('v-spl');
                if (vSpl) {
                    SPOILERS = s.spoilers;
                    const splOn = s.spoilers > 0.05;
                    vSpl.textContent = splOn ? 'EXT' : 'RET';
                    vSpl.classList.toggle('on', splOn);
                    vSpl.classList.toggle('off', !splOn);
                }
            }

            const vVs = document.getElementById('v-vs');

            if (vVs) {
                const vs = Math.round(s.vs || 0);
                const sign = vs > 0 ? '+' : '';

                if (Math.abs(vs) < 100) {
                    vVs.textContent =
                        sign + Math.round(vs / 10) * 10 + ' FPM';

                } else if (Math.abs(vs) < 1000) {
                    vVs.textContent =
                        sign + Math.round(vs / 100) * 100 + ' FPM';

                } else {
                    const k = Math.round(vs / 100) / 10;
                    vVs.textContent =
                        sign + k + 'K FPM';
                }
            }
            
            const attHorizon = document.getElementById('att-horizon');
            if (attHorizon) {
                const pitchPx = (s.pitch || 0) * ATT_PX_PER_DEG;
                attHorizon.style.transform = `rotate(${-(s.roll || 0)}deg) translateY(${pitchPx}px)`;
            }

            const cHdg = document.getElementById('c-hdg');
            if (cHdg) drawCompass(cHdg.getContext('2d'), s.hdg);
        } else {
            const cHdg = document.getElementById('c-hdg');
            if (cHdg) drawCompass(cHdg.getContext('2d'), _lastHdg);
        }
        //requestAnimationFrame(loop);
    }

    function unhideMistakes() {
        document.querySelectorAll('[data-msfs-hidden]').forEach(el => {
            el.style.removeProperty('display');
            delete el.dataset.msfsHidden;
        });
    }

    function autoCycleVisibility() {
        const ready = () => {
            const g = window.geofs;
            if (!g || typeof g.visibilityCycle !== 'function') return false;
            const inst = g.instruments;
            if (!inst || !inst.groups) return false;
            const keys = Object.keys(inst.groups);
            if (!keys.length) return false;
            return keys.some(k => inst.groups[k] && inst.groups[k].controls);
        };
        const tryCycle = (attempt = 0) => {
            if (ready()) {
                try {
                    window.geofs.visibilityCycle();
                    window.geofs.visibilityCycle();
                    window.geofs.visibilityCycle();
                } catch (e) {
                    if (attempt < 60) setTimeout(() => tryCycle(attempt + 1), 1000);
                }
            } else if (attempt < 60) {
                setTimeout(() => tryCycle(attempt + 1), 1000);
            }
        };
        setTimeout(() => tryCycle(), 6000);
    }

    function enableMapNavLayers() {
        const tryEnable = (attempt = 0) => {
            try {
                document.querySelectorAll('input[data-gespref]').forEach(inp => {
                    const pref = inp.getAttribute('data-gespref') || '';
                    if (/recenterMap|drawFlightPath|showRunways|showAirports|showNavaids|showWaypoints|showPlanes|showFlightPath/i.test(pref)) {
                        if (!inp.checked) {
                            inp.click();
                        }
                    }
                });

                const g = window.geofs;
                if (g) {
                    if (g.preferences && g.preferences.interface) {
                        g.preferences.interface.recenterMap = true;
                        g.preferences.interface.drawFlightPath = true;
                    }
                    if (typeof g.savePreferences === 'function') {
                        try { g.savePreferences(); } catch (e) { }
                    }
                    if (g.flight && g.flight.recorder && typeof g.flight.recorder.setPathDrawState === 'function') {
                        try { g.flight.recorder.setPathDrawState(); } catch (e) { }
                    }
                }
            } catch (e) { }

            if (attempt < 30) setTimeout(() => tryEnable(attempt + 1), 3000);
        };
        setTimeout(() => tryEnable(), 4000);
    }

    function ensureLandingPopup() {
        let el = document.getElementById('bonsai-landing-popup');
        if (el) return el;
        el = document.createElement('div');
        el.id = 'bonsai-landing-popup';
        document.body.appendChild(el);
        return el;
    }

    function gradeFromFpm(fpm) {
        if (fpm <= -1000 || fpm > 200) return { label: 'CRASH', cls: 'crash' };
        if (fpm >= -50) return { label: 'BUTTER', cls: 'butter' };
        if (fpm >= -200) return { label: 'GREAT', cls: 'great' };
        if (fpm >= -500) return { label: 'ACCEPTABLE', cls: 'acceptable' };
        return { label: 'HARD LANDING', cls: 'hard' };
    }

    let _bonsaiPrevGround = true;
    let _bonsaiPrevVS = 0;
    let _bonsaiPopupTimer = null;

    function showLandingPopup(fpm) {
        if (!_settings.landingPopup) return;
        const popup = ensureLandingPopup();
        const g = gradeFromFpm(fpm);
        popup.innerHTML = `
            <div class="bl-title">Touchdown</div>
            <div class="bl-fpm">${Math.round(fpm)}</div>
            <div class="bl-fpm-unit">FPM</div>
            <div class="bl-grade ${g.cls}">${g.label}</div>
        `;
        requestAnimationFrame(() => popup.classList.add('show'));
        if (_bonsaiPopupTimer) clearTimeout(_bonsaiPopupTimer);
        _bonsaiPopupTimer = setTimeout(() => {
            popup.classList.remove('show');
        }, 5000);
    }

    function watchLanding() {
        setInterval(() => {
            const g = window.geofs;
            if (!g || !g.animation || !g.animation.values) return;
            const av = g.animation.values;
            const grounded = !!av.groundContact;
            const vs = av.verticalSpeed;
            if (grounded && !_bonsaiPrevGround) {
                const touchdownFpm = (typeof _bonsaiPrevVS === 'number' && _bonsaiPrevVS !== 0)
                    ? _bonsaiPrevVS
                    : (typeof vs === 'number' ? vs : 0);
                showLandingPopup(touchdownFpm);
                VERSION < 4 && SPOILERS_ARMED === true ? toggleSpoilers() : null;
            }
            if (!grounded && typeof vs === 'number') _bonsaiPrevVS = vs;
            _bonsaiPrevGround = grounded;
        }, 80);
    }

    function toggleSpoilers() {
        if(typeof controls.setters.setAirbrakes.set != 'function') return;
        controls.setters.setAirbrakes.set(1);
    }

    function toggleBrakes() {
        if(typeof controls.setters.toggleParkingBrake.set != 'function') return;
        controls.setters.toggleParkingBrake.set(); 
    }

    function toggleFlaps() {
        if(typeof controls.setters.cycleFlaps.set != 'function') return;
        controls.setters.cycleFlaps.set(); 
    }

    function toggleGears() {
        if(typeof controls.setters.setGear.set != 'function') return;
        controls.setters.setGear.set()
    }

    function armSpoilers() {
        //if(typeof controls.airbrakes.position != 'number') return;
        let indicator = document.getElementById('v-auto-spl');
        if(typeof indicator == "undefined") return;
        if(VERSION > 3.9 && typeof controls.airbrakes.armed != 'number') return
        // If AirBrakes are on, Arming them would trigger a cycle bug.
        controls.setters.setAirbrakesDown.set()
        if(SPOILERS_ARMED === false) {
            indicator.classList.add('on');
            indicator.classList.remove('off')
            indicator.textContent = "ARM";
            VERSION > 3.9 ? controls.setters.armAirbrakes.set() : null;
            SPOILERS_ARMED = true

        } else{
            indicator.classList.add('off');
            indicator.classList.remove('on')
            indicator.textContent = "STW";
            VERSION > 3.9 ? controls.setters.disarmAirbrakes.set() : null;
            SPOILERS_ARMED = false
        }
    }

    function registerCallbacks() {
        document.getElementById("msfs-brk").addEventListener('click', toggleBrakes);
        document.getElementById("msfs-flaps").addEventListener('click', toggleFlaps);
        document.getElementById("msfs-gear").addEventListener('click', toggleGears);
        document.getElementById("v-spl").addEventListener('click', toggleSpoilers);
        document.getElementById("v-auto-spl").addEventListener('click', armSpoilers);
    }

    function boot() {
        unhideMistakes();
        init();
        autoCycleVisibility();
        wireMenuWatcher();
        enableMapNavLayers();
        registerCallbacks()
        ensureLandingPopup();
        watchLanding();
    }

    if (document.body) boot();
    else window.addEventListener('DOMContentLoaded', boot, { once: true });
})();