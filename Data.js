/* ============================================================
   data.js — CSV 파싱 및 시트 로딩
   전역: DATA.parseCSV / DATA.toObjects / DATA.loadAll / DATA.norm
   ============================================================ */
var DATA = (function () {
  "use strict";

  /* CSV 파서 (따옴표·줄바꿈 처리) */
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    var out = [], row = [], field = "", i = 0, inq = false, c;
    while (i < text.length) {
      c = text[i];
      if (inq) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inq = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inq = true; i++; continue; }
      if (c === ',') { row.push(field); field = ""; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); out.push(row); row = []; field = ""; i++; continue; }
      field += c; i++;
    }
    if (field.length || row.length) { row.push(field); out.push(row); }
    return out;
  }

  function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, ""); }

  function toObjects(matrix, placeName) {
    if (!matrix.length) return [];
    var header = matrix[0].map(function (h) { return String(h || "").trim(); });
    var idx = {};
    header.forEach(function (h, k) { if (h) idx[h] = k; });

    function g(r, names) {
      for (var j = 0; j < names.length; j++) {
        if (idx[names[j]] !== undefined) {
          var v = r[idx[names[j]]];
          return v == null ? "" : String(v).trim();
        }
      }
      return "";
    }

    var list = [];
    for (var i = 1; i < matrix.length; i++) {
      var r = matrix[i];
      if (!r || r.every(function (x) { return String(x || "").trim() === ""; })) continue;
      var o = {
        item:    g(r, ["품목명", "한글명", "물품명", "기자재명"]),
        eng:     g(r, ["영문명", "영명"]),
        cas:     g(r, ["CAS번호", "CAS. NO", "CAS.NO", "CAS"]),
        formula: g(r, ["화학식"]),
        qty:     g(r, ["수량", "재고"]),
        loc:     g(r, ["위치", "보관위치"]),
        place:   g(r, ["장소", "실명"]) || placeName,
        cat:     g(r, ["분류"]),
        alias:   g(r, ["별칭", "키워드"]),
        note:    g(r, ["비고", "메모"])
      };
      if (!o.item && !o.eng && !o.cas) continue;
      if (!o.cat) o.cat = (o.cas || o.formula) ? "시약" : "비품";
      /* 검색 키: 소스 탭 이름도 포함시켜 '생명시약실' 같은 검색어가 통하도록 */
      o.source = placeName;
      o._key = norm([o.item, o.eng, o.cas, o.formula, o.qty, o.loc,
                     o.place, placeName, o.cat, o.alias, o.note].join(" "));
      list.push(o);
    }
    return list;
  }

  /* sources 를 모두 불러와 하나의 배열로. 실패한 소스는 건너뜁니다. */
  function loadAll(sources) {
    return Promise.all(sources.map(function (s) {
      if (/GID_확인필요/.test(s.url)) {
        console.warn("GID 미설정으로 건너뜀:", s.name);
        return Promise.resolve([]);
      }
      return fetch(s.url, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (txt) { return toObjects(parseCSV(txt), s.name); })
        .catch(function (err) {
          console.warn("불러오기 실패:", s.name, err);
          return [];
        });
    })).then(function (chunks) {
      return [].concat.apply([], chunks);
    });
  }

  return { parseCSV: parseCSV, toObjects: toObjects, loadAll: loadAll, norm: norm };
})();
