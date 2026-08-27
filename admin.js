/* ============================================================
   admin.js — 관리 페이지 로직
   의존: config.js(ADMIN_REPO, SOURCES, GROUPS, CATEGORIES), data.js, settings.js
   ============================================================ */
(function () {
  "use strict";

  var TOKEN_KEY = "labsearch_gh_token";
  var state = { settings: null, sha: null, counts: null };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- base64 (UTF-8) ---------- */
  function b64encode(str) {
    var bytes = new TextEncoder().encode(str), bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64decode(b64) {
    var bin = atob(String(b64).replace(/\s/g, ""));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  /* ---------- GitHub API ---------- */
  function apiUrl() {
    return "https://api.github.com/repos/" + ADMIN_REPO.owner + "/" +
           ADMIN_REPO.repo + "/contents/" + ADMIN_REPO.path;
  }
  function headers() {
    return {
      "Authorization": "Bearer " + $("token").value.trim(),
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json"
    };
  }

  function ghGet() {
    return fetch(apiUrl() + "?ref=" + ADMIN_REPO.branch + "&t=" + Date.now(),
                 { headers: headers(), cache: "no-store" })
      .then(function (r) {
        if (r.status === 404) return null;              /* 최초 실행: 파일 없음 */
        if (r.status === 401) throw new Error("토큰이 올바르지 않습니다.");
        if (r.status === 403) throw new Error("권한이 없습니다. 토큰의 Contents 쓰기 권한을 확인하세요.");
        if (!r.ok) throw new Error("불러오기 실패 (" + r.status + ")");
        return r.json();
      });
  }

  function ghPut(text, message) {
    var body = {
      message: message,
      content: b64encode(text),
      branch: ADMIN_REPO.branch
    };
    if (state.sha) body.sha = state.sha;
    return fetch(apiUrl(), { method: "PUT", headers: headers(), body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error(j.message || ("저장 실패 (" + r.status + ")"));
          return j;
        });
      });
  }

  /* ---------- 불러오기 ---------- */
  function loadAll() {
    var st = $("loadStatus");
    st.className = "status";
    st.textContent = "불러오는 중…";

    if (!$("token").value.trim()) { st.className = "status err"; st.textContent = "토큰을 입력하세요."; return; }
    if (/GITHUB_사용자명|리포지토리이름/.test(ADMIN_REPO.owner + ADMIN_REPO.repo)) {
      st.className = "status err";
      st.textContent = "config.js 의 ADMIN_REPO 를 실제 저장소 정보로 먼저 수정하세요.";
      return;
    }

    ghGet().then(function (file) {
      if (file) {
        state.sha = file.sha;
        state.settings = SETTINGS.normalize(JSON.parse(b64decode(file.content)));
        st.textContent = "불러왔습니다. (마지막 저장: " + (state.settings.savedAt || "기록 없음") + ")";
      } else {
        state.sha = null;
        state.settings = SETTINGS.defaults();
        st.textContent = "settings.json 이 없어 기본값(전체 표시)으로 시작합니다.";
      }
      if ($("remember").checked) localStorage.setItem(TOKEN_KEY, $("token").value.trim());
      else localStorage.removeItem(TOKEN_KEY);
      showAll();
    }).catch(function (e) {
      st.className = "status err";
      st.textContent = e.message;
    });
  }

  function showAll() {
    ["main", "sec3", "sec4", "sec5", "savebar"].forEach(function (id) {
      $(id).style.display = "block";
    });
    renderTree();
    renderBanner();
    renderNotes();
    updatePreview();
  }

  /* ---------- 장소 트리 ---------- */
  function renderTree() {
    var tree = $("tree");
    tree.innerHTML = "";

    GROUPS.forEach(function (g) {
      var members = SOURCES.filter(function (s) { return s.group === g.id; });
      if (!members.length) return;

      var box = document.createElement("div");
      box.className = "group";

      var head = document.createElement("div");
      head.className = "ghead";
      var gcb = document.createElement("input");
      gcb.type = "checkbox";
      head.appendChild(gcb);
      head.appendChild(document.createTextNode(g.name));
      var gcount = document.createElement("span");
      gcount.className = "gcount";
      head.appendChild(gcount);
      box.appendChild(head);

      members.forEach(function (src) {
        var p = state.settings.places[src.name];
        var row = document.createElement("div");
        row.className = "prow" + (p.visible ? "" : " off");

        /* 장소 on/off */
        var nameWrap = document.createElement("label");
        nameWrap.className = "cb";
        var vcb = document.createElement("input");
        vcb.type = "checkbox";
        vcb.checked = p.visible;
        nameWrap.appendChild(vcb);
        nameWrap.appendChild(document.createTextNode(src.name));
        if (/GID_확인필요/.test(src.url)) {
          var w = document.createElement("span");
          w.textContent = " (GID 미설정)";
          w.style.color = "var(--warn)";
          w.style.fontSize = "12px";
          nameWrap.appendChild(w);
        }
        row.appendChild(nameWrap);

        /* 분류 체크 */
        var cats = document.createElement("div");
        cats.className = "cats";
        CATEGORIES.forEach(function (c) {
          var l = document.createElement("label");
          l.className = "cb";
          var cb = document.createElement("input");
          cb.type = "checkbox";
          cb.checked = p.cats.indexOf(c) !== -1;
          cb.addEventListener("change", function () {
            var i = p.cats.indexOf(c);
            if (cb.checked && i === -1) p.cats.push(c);
            if (!cb.checked && i !== -1) p.cats.splice(i, 1);
            updatePreview();
          });
          l.appendChild(cb);
          l.appendChild(document.createTextNode(c));
          cats.appendChild(l);
        });
        row.appendChild(cats);

        /* 업데이트 날짜 */
        var date = document.createElement("input");
        date.type = "date";
        date.value = p.updated || "";
        date.addEventListener("change", function () { p.updated = date.value; });
        row.appendChild(date);

        /* 건수 */
        var num = document.createElement("span");
        num.className = "num";
        num.setAttribute("data-place", src.name);
        num.textContent = state.counts ? countOf(src.name) + "건" : "–";
        row.appendChild(num);

        vcb.addEventListener("change", function () {
          p.visible = vcb.checked;
          row.className = "prow" + (p.visible ? "" : " off");
          syncGroup();
          updatePreview();
        });

        box.appendChild(row);
      });

      function syncGroup() {
        var on = members.filter(function (s) { return state.settings.places[s.name].visible; }).length;
        gcb.checked = on === members.length;
        gcb.indeterminate = on > 0 && on < members.length;
        gcount.textContent = on + " / " + members.length + " 표시";
      }

      gcb.addEventListener("change", function () {
        members.forEach(function (s) { state.settings.places[s.name].visible = gcb.checked; });
        renderTree();
        updatePreview();
      });

      syncGroup();
      tree.appendChild(box);
    });
  }

  /* ---------- 물품 수 ---------- */
  function countOf(place) {
    if (!state.counts) return 0;
    var c = state.counts[place];
    if (!c) return 0;
    var p = state.settings.places[place];
    var n = 0;
    CATEGORIES.forEach(function (cat) {
      if (p.cats.indexOf(cat) !== -1) n += (c[cat] || 0);
    });
    return n;
  }

  function loadCounts() {
    var st = $("countStatus");
    st.className = "status"; st.textContent = "시트를 읽는 중…";
    $("countBtn").disabled = true;

    DATA.loadAll(SOURCES).then(function (rows) {
      var map = {};
      rows.forEach(function (r) {
        if (!map[r.source]) map[r.source] = {};
        map[r.source][r.cat] = (map[r.source][r.cat] || 0) + 1;
      });
      state.counts = map;
      st.textContent = "총 " + rows.length.toLocaleString("ko-KR") + "건 확인";
      $("countBtn").disabled = false;
      renderTree();
      updatePreview();
    });
  }

  function updatePreview() {
    var pv = $("preview");
    if (!state.counts) {
      pv.textContent = "물품 수를 불러오면 노출 건수를 계산합니다.";
      return;
    }
    var total = 0, shown = 0, offPlaces = [];
    SOURCES.forEach(function (src) {
      var c = state.counts[src.name] || {};
      CATEGORIES.forEach(function (cat) { total += (c[cat] || 0); });
      var p = state.settings.places[src.name];
      if (p.visible) shown += countOf(src.name);
      else offPlaces.push(src.name);
    });
    var latest = "";
    SOURCES.forEach(function (src) {
      var p = state.settings.places[src.name];
      if (p.visible && p.updated && p.updated > latest) latest = p.updated;
    });
    pv.innerHTML =
      "노출 <strong>" + shown.toLocaleString("ko-KR") + "건</strong> / 전체 " +
      total.toLocaleString("ko-KR") + "건<br>" +
      "숨긴 장소 " + offPlaces.length + "곳" + (offPlaces.length ? " (" + offPlaces.join(", ") + ")" : "") + "<br>" +
      "검색기 표시 최근 갱신일: " + (latest || "없음");
  }

  /* ---------- 배너 ---------- */
  function renderBanner() {
    $("bannerShow").checked = !!state.settings.banner.show;
    $("bannerText").value = state.settings.banner.text || "";
    $("bannerShow").addEventListener("change", function () {
      state.settings.banner.show = $("bannerShow").checked;
    });
    $("bannerText").addEventListener("input", function () {
      state.settings.banner.text = $("bannerText").value;
    });
  }

  /* ---------- 패치노트 ---------- */
  function renderNotes() {
    var box = $("notes");
    box.innerHTML = "";
    state.settings.patchNotes.forEach(function (n, i) {
      var row = document.createElement("div");
      row.className = "note";

      var d = document.createElement("input");
      d.type = "date"; d.value = n.date || "";
      d.addEventListener("change", function () { n.date = d.value; });

      var t = document.createElement("input");
      t.type = "text"; t.value = n.text || "";
      t.placeholder = "예: 생명시약실 시약 목록 전면 갱신";
      t.addEventListener("input", function () { n.text = t.value; });

      var del = document.createElement("button");
      del.className = "mini"; del.textContent = "삭제";
      del.addEventListener("click", function () {
        state.settings.patchNotes.splice(i, 1);
        renderNotes();
      });

      row.appendChild(d); row.appendChild(t); row.appendChild(del);
      box.appendChild(row);
    });
  }

  /* ---------- 저장 ---------- */
  function save() {
    var st = $("saveStatus");
    st.className = "status"; st.textContent = "저장 중…";
    $("saveBtn").disabled = true;

    state.settings.savedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
    state.settings.patchNotes = state.settings.patchNotes.filter(function (n) { return n.date; });

    var text = JSON.stringify(state.settings, null, 2) + "\n";
    var msg = "settings: 관리 페이지에서 갱신 (" + state.settings.savedAt + ")";

    ghPut(text, msg).then(function (res) {
      state.sha = res.content.sha;
      st.textContent = "저장 완료. 배포 반영까지 10초~2분 정도 걸립니다.";
      $("saveBtn").disabled = false;
    }).catch(function (e) {
      st.className = "status err";
      /* 409/422 = 다른 곳에서 먼저 수정된 경우 */
      st.textContent = e.message + " — 파일이 그 사이 바뀌었다면 다시 불러온 뒤 저장하세요.";
      $("saveBtn").disabled = false;
    });
  }

  /* ---------- 초기화 ---------- */
  var saved = localStorage.getItem(TOKEN_KEY);
  if (saved) $("token").value = saved;

  $("loadBtn").addEventListener("click", loadAll);
  $("countBtn").addEventListener("click", loadCounts);
  $("saveBtn").addEventListener("click", save);
  $("addNote").addEventListener("click", function () {
    state.settings.patchNotes.unshift({ date: new Date().toISOString().slice(0, 10), text: "" });
    renderNotes();
  });
})();
