/* ============================================================
   search.js — 검색기 화면 로직
   의존: config.js, data.js, settings.js
   ============================================================ */
(function () {
  "use strict";

  var els = {
    q: document.getElementById("q"),
    clear: document.getElementById("clear"),
    place: document.getElementById("place"),
    cat: document.getElementById("cat"),
    pageSize: document.getElementById("pageSize"),
    pager: document.getElementById("pager"),
    pagePrev: document.getElementById("pagePrev"),
    pageNext: document.getElementById("pageNext"),
    pageInfo: document.getElementById("pageInfo"),
    out: document.getElementById("out"),
    matchN: document.getElementById("matchN"),
    totalN: document.getElementById("totalN"),
    updated: document.getElementById("updated"),
    updPanel: document.getElementById("updPanel"),
    banner: document.getElementById("noticeBanner"),
    patchBox: document.getElementById("patchBox"),
    patchToggle: document.getElementById("patchToggle"),
    patchList: document.getElementById("patchList")
  };

  var rows = [];
  var page = 1;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function highlight(text, q) {
    var t = esc(text);
    if (!q) return t;
    try {
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      return t.replace(re, "<mark>$1</mark>");
    } catch (e) { return t; }
  }

  /* ---------- 설정 반영 ---------- */
  function applyBanner() {
    var b = SETTINGS.banner();
    if (b.show && b.text) {
      els.banner.innerHTML = esc(b.text);
      els.banner.style.display = "block";
    } else {
      els.banner.style.display = "none";
    }
  }

  /* 표시 중인 장소의 관리자 지정 갱신일 목록. 그룹 순서대로. */
  function applyUpdated() {
    var visible = SOURCES.filter(function (s) { return SETTINGS.place(s.name).visible; });
    if (!visible.length) { els.updated.style.display = "none"; return; }

    els.updated.style.display = "block";
    els.updated.textContent = "▸ 갱신 일자 확인하기";

    var html = "";
    GROUPS.forEach(function (g) {
      var members = visible.filter(function (s) { return s.group === g.id; });
      if (!members.length) return;
      html += '<div class="ug">' + esc(g.name) + '</div>';
      members.forEach(function (s) {
        var d = SETTINGS.place(s.name).updated;
        html += '<div class="ur"><span>' + esc(s.name) + '</span>' +
                '<span>' + (d ? esc(d) : "미지정") + '</span></div>';
      });
    });
    els.updPanel.innerHTML = html;

    els.updated.addEventListener("click", function () {
      var open = els.updPanel.style.display !== "none";
      els.updPanel.style.display = open ? "none" : "block";
      els.updated.textContent = (open ? "▸ " : "▾ ") + "갱신 일자 확인하기";
    });
  }

  function renderPatchNotes() {
    var notes = SETTINGS.patchNotes();
    if (!notes.length) { els.patchBox.style.display = "none"; return; }
    els.patchBox.style.display = "block";
    els.patchList.innerHTML = notes.map(function (n) {
      return '<li><span class="pdate">' + esc(n.date) + '</span>' +
             '<span class="ptext">' + esc(n.text || "") + '</span></li>';
    }).join("");
    els.patchToggle.addEventListener("click", function () {
      var open = els.patchList.style.display !== "none";
      els.patchList.style.display = open ? "none" : "block";
      els.patchToggle.textContent = (open ? "▸ " : "▾ ") + "업데이트 내역";
    });
  }

  /* ---------- 로드 ---------- */
  function load() {
    SETTINGS.load().then(function () {
      applyBanner();
      applyUpdated();
      renderPatchNotes();

      var visible = SOURCES.filter(function (s) { return SETTINGS.place(s.name).visible; });
      return DATA.loadAll(visible);
    }).then(function (all) {
      rows = all.filter(function (r) { return SETTINGS.allows(r.source, r.cat); });
      els.totalN.textContent = rows.length.toLocaleString("ko-KR");
      fillPlaces();
      render();
    });
  }

  function fillPlaces() {
    var seen = {};
    rows.forEach(function (r) { if (r.place) seen[r.place] = 1; });
    Object.keys(seen).sort(function (a, b) { return a.localeCompare(b, "ko"); })
      .forEach(function (p) {
        var o = document.createElement("option");
        o.value = p; o.textContent = p;
        els.place.appendChild(o);
      });
  }

  /* ---------- 검색 ---------- */
  function render() {
    var raw = els.q.value.trim();
    var q = DATA.norm(raw);
    var place = els.place.value;
    var cat = els.cat.value;

    var list = rows.filter(function (r) {
      if (place && r.place !== place) return false;
      if (cat && r.cat !== cat) return false;
      if (q && r._key.indexOf(q) === -1) return false;
      return true;
    });

    els.matchN.textContent = list.length.toLocaleString("ko-KR");
    els.clear.style.display = raw ? "block" : "none";

    if (!list.length) {
      els.out.innerHTML = '<div class="empty">검색 결과가 없습니다.' +
        (raw ? ' <b>' + esc(raw) + '</b>' : '') + '</div>';
      els.pager.style.display = "none";
      return;
    }

    /* 페이지 범위 보정 — 필터가 바뀌어 총 페이지가 줄어든 경우 대비 */
    var size = parseInt(els.pageSize.value, 10) || 50;
    var pages = Math.ceil(list.length / size);
    if (page > pages) page = pages;
    if (page < 1) page = 1;

    var start = (page - 1) * size;
    var shown = list.slice(start, start + size);

    var html = '<table><thead><tr>' +
      '<th>품목</th><th>CAS·화학식</th><th>수량</th><th>위치</th><th>장소</th><th>분류</th><th>비고</th>' +
      '</tr></thead><tbody>';

    shown.forEach(function (r) {
      html += '<tr>' +
        '<td class="namecell" data-label="품목"><div class="name">' + highlight(r.item, raw) + '</div>' +
          (r.eng ? '<div class="eng">' + highlight(r.eng, raw) + '</div>' : '') + '</td>' +
        '<td class="sub" data-label="CAS">' + highlight(r.cas, raw) +
          (r.formula ? '<div class="eng">' + highlight(r.formula, raw) + '</div>' : '') + '</td>' +
        '<td class="qty" data-label="수량">' + esc(r.qty) + '</td>' +
        '<td class="sub" data-label="위치">' + esc(r.loc) + '</td>' +
        '<td class="sub" data-label="장소">' + esc(r.place) + '</td>' +
        '<td data-label="분류"><span class="tag">' + esc(r.cat) + '</span></td>' +
        '<td class="sub" data-label="비고">' + esc(r.note) + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';
    els.out.innerHTML = html;

    els.pager.style.display = pages > 1 ? "flex" : "none";
    els.pageInfo.textContent = page + " / " + pages + " 쪽  ·  " +
      (start + 1) + "–" + (start + shown.length) + "번째";
    els.pagePrev.disabled = page <= 1;
    els.pageNext.disabled = page >= pages;
  }

  /* 필터·검색어가 바뀌면 항상 첫 쪽부터 다시 봅니다. */
  function resetAndRender() {
    page = 1;
    render();
  }

  els.q.addEventListener("input", resetAndRender);
  els.place.addEventListener("change", resetAndRender);
  els.cat.addEventListener("change", resetAndRender);
  els.pageSize.addEventListener("change", resetAndRender);
  els.pagePrev.addEventListener("click", function () {
    if (page > 1) { page--; render(); window.scrollTo(0, 0); }
  });
  els.pageNext.addEventListener("click", function () {
    page++; render(); window.scrollTo(0, 0);
  });
  els.clear.addEventListener("click", function () {
    els.q.value = ""; els.q.focus(); resetAndRender();
  });

  load();
})();
