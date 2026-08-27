/* ============================================================
   settings.js — 관리 설정(settings.json) 로드와 표시 규칙
   전역: SETTINGS
   settings.json 이 없거나 깨져 있으면 '전부 표시'로 폴백합니다.
   ============================================================ */
var SETTINGS = (function () {
  "use strict";

  var current = null;

  function blank() {
    return { version: 1, savedAt: "", banner: { show: false, text: "" }, places: {}, patchNotes: [] };
  }

  /* SOURCES 전체를 '표시 + 모든 분류 허용' 상태로 채운 기본값 */
  function defaults() {
    var s = blank();
    SOURCES.forEach(function (src) {
      s.places[src.name] = { visible: true, cats: CATEGORIES.slice(), updated: "" };
    });
    return s;
  }

  /* 저장된 설정에 없는 장소는 기본값(표시)으로 채웁니다.
     → 시트에 탭을 새로 추가해도 설정을 다시 저장할 때까지 숨겨지지 않습니다. */
  function normalize(raw) {
    var s = defaults();
    if (!raw || typeof raw !== "object") return s;
    s.version = raw.version || 1;
    s.savedAt = raw.savedAt || "";
    if (raw.banner && typeof raw.banner === "object") {
      s.banner = { show: !!raw.banner.show, text: String(raw.banner.text || "") };
    }
    if (Array.isArray(raw.patchNotes)) {
      s.patchNotes = raw.patchNotes.filter(function (n) { return n && n.date; });
    }
    Object.keys(s.places).forEach(function (name) {
      var p = raw.places && raw.places[name];
      if (!p) return;
      s.places[name] = {
        visible: p.visible !== false,
        cats: Array.isArray(p.cats) ? p.cats.slice() : CATEGORIES.slice(),
        updated: String(p.updated || "")
      };
    });
    return s;
  }

  function load() {
    return fetch("settings.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) { current = normalize(json); return current; })
      .catch(function (err) {
        console.warn("settings.json 로드 실패 — 전체 표시로 진행합니다.", err);
        current = defaults();
        return current;
      });
  }

  function get() { return current || defaults(); }

  function place(name) {
    var p = get().places[name];
    return p || { visible: true, cats: CATEGORIES.slice(), updated: "" };
  }

  /* 행 표시 여부. 소스 탭 이름(row.source) 기준으로 판정합니다.
     시트의 '장소' 열 값은 탭 이름과 다를 수 있어 기준으로 쓰지 않습니다. */
  function allows(sourceName, cat) {
    var p = place(sourceName);
    if (!p.visible) return false;
    if (!cat) return true;
    return p.cats.indexOf(cat) !== -1;
  }

  /* 표시 중인 장소들의 업데이트 날짜 중 가장 최근 값 (YYYY-MM-DD, 없으면 "") */
  function latestUpdated() {
    var best = "";
    SOURCES.forEach(function (src) {
      var p = place(src.name);
      if (!p.visible || !p.updated) return;
      if (p.updated > best) best = p.updated;
    });
    return best;
  }

  function patchNotes() {
    return get().patchNotes.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
  }

  function banner() { return get().banner; }

  return {
    load: load, get: get, defaults: defaults, normalize: normalize,
    place: place, allows: allows, latestUpdated: latestUpdated,
    patchNotes: patchNotes, banner: banner
  };
})();
