/* ============================================================
   비품·시료 통합 검색기 설정 파일
   ------------------------------------------------------------
   실을 추가할 때는 아래 SOURCES 배열에 한 줄만 추가하면 됩니다.

   name  : 검색 화면 '장소' 필터에 표시될 이름
   url   : 구글시트 '웹에 게시(CSV)' 링크  또는  같은 폴더의 CSV 파일 경로

   구글시트 CSV 게시 방법은 설치안내서(설치_가이드.md)를 참고하세요.
   ============================================================ */

const SOURCES = [
  // ── 데모용: 같은 폴더의 CSV 파일 (인터넷 게시 전에도 확인 가능) ──
  { name: "물리학실험실1",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=123017136&single=true&output=csv" },
  { name: "물리학R&E실",     url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1367808534&single=true&output=csv" },
  { name: "화학시약실",       url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1524000102&single=true&output=csv" },

  // ── 실제 운영: 구글시트 CSV 게시 링크로 교체/추가 ──
  // { name: "물리특별실험실", url: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv" },
  // { name: "화학실험실1",   url: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=111&single=true&output=csv" },
  // { name: "생명시약실",     url: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=222&single=true&output=csv" },
];

/* 표준 열 이름 (구글시트 첫 행과 반드시 일치해야 합니다) */
const COLUMNS = ["품목명", "영문명", "CAS번호", "화학식", "수량", "위치", "장소", "분류", "별칭", "비고"];
