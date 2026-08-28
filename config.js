/* ============================================================
   config.js — 데이터 소스 및 관리 설정
   ============================================================ */

// 통합검색기 데이터 소스 설정
// 각 항목의 url 은 구글시트 [파일 > 공유 > 웹에 게시] 로 만든 CSV 주소입니다.
const PUB_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub";

// gid 만 넣으면 CSV 주소를 만들어 줍니다.
const csv = (gid) => `${PUB_BASE}?gid=${gid}&single=true&output=csv`;

/* 그룹(과목 분야) 정의 — 관리 페이지의 큰 분류이자 표시 순서 */
const GROUPS = [
  { id: "physics", name: "물리" },
  { id: "chem",    name: "화학" },
  { id: "bio",     name: "생명과학" },
  { id: "earth",   name: "지구과학" }
];

/* SOURCES — 각 항목의 name 은 settings.json 의 키로 쓰이므로 변경 시 설정도 함께 갱신됩니다. */
const SOURCES = [
  // ── 물리 ──
  { name: "물리학실험실1",          group: "physics", url: csv("123017136") },
  { name: "물리학실험실1,2 사이",    group: "physics", url: csv("2017488138") },
  { name: "물리학실험실2",          group: "physics", url: csv("1168434556") },
  { name: "물리R&E실",              group: "physics", url: csv("1367808534") },
  { name: "물리첨단기기실",          group: "physics", url: csv("166168828") },
  { name: "물리특별실험실",          group: "physics", url: csv("938567358") },

  // ── 화학 ──
  { name: "화학실험실1",            group: "chem",    url: csv("1350247972") },
  { name: "화학실험실2",            group: "chem",    url: csv("173381221") },
  { name: "화학R&E실",              group: "chem",    url: csv("1619936846") },
  { name: "화학첨단기기실1",         group: "chem",    url: csv("765553327") },
  { name: "화학첨단기기실2",         group: "chem",    url: csv("465082086") },
  { name: "화학시약실",             group: "chem",    url: csv("1524000102") },

  // ── 생명과학 ──
  { name: "생명과학실험실",          group: "bio",     url: csv("1516070082") },
  { name: "식물배양실",             group: "bio",     url: csv("389647746") },
  { name: "현미경실",               group: "bio",     url: csv("63565580") },
  { name: "생명과학R&E실",           group: "bio",     url: csv("2138547120") },
  { name: "분자생물학실",            group: "bio",     url: csv("1642121029") },
  { name: "생물교사실",             group: "bio",     url: csv("1054265451") },
  { name: "생명시약실",             group: "bio",     url: csv("1702942479") },

  // ── 지구과학 ──
  { name: "지구과학실험실1",         group: "earth",   url: csv("482016705") },
  { name: "지구과학실험실2",         group: "earth",   url: csv("1159490737") },
  { name: "지구과학R&E실",           group: "earth",   url: csv("1383335509") },
  { name: "지구과학첨단기기실",       group: "earth",   url: csv("1694395998") },
  { name: "지구과학특별실험실",       group: "earth",   url: csv("1161329590") }
];

const COLUMNS = ["품목명", "영문명", "CAS번호", "화학식", "수량", "위치", "장소", "분류", "별칭", "비고"];
const CATEGORIES = ["시약", "비품", "소모품"];

/* ============================================================
   관리 페이지 설정 — settings.json 을 커밋할 GitHub 저장소
   ============================================================ */
const ADMIN_REPO = {
  owner:  "GITHUB_사용자명",   // 예: youngkildong
  repo:   "리포지토리이름",     // 예: lab-search
  branch: "main",               // GitHub 기본 브랜치 (또는 "master")
  path:   "settings.json"
};
