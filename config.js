const SOURCES = [
  // ── 데모용: 같은 폴더의 CSV 파일 (인터넷 게시 전에도 확인 가능) ──
   { name: "물리학실험실1",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=123017136&single=true&output=csv" },
   { name: "물리학실험실2",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1168434556&single=true&output=csv" },
   { name: "물리R&E실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1367808534&single=true&output=csv" },
   { name: "물리첨단기기실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=166168828&single=true&output=csv" },
   { name: "물리특별실험실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=938567358&single=true&output=csv" },
   { name: "화학실험실1",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1350247972&single=true&output=csv" },
   { name: "화학실험실2",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=173381221&single=true&output=csv" },
   { name: "화학R&E실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1619936846&single=true&output=csv" },
   { name: "화학첨단기기실1",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=765553327&single=true&output=csv" },
   { name: "화학첨단기기실2",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=465082086&single=true&output=csv" },
   { name: "화학시약실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1524000102&single=true&output=csv" },
   { name: "생명과학실험실1",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1642121029&single=true&output=csv" },
   { name: "생명과학실험실2",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=63565580&single=true&output=csv" },
   { name: "생명과학R&E실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=2138547120&single=true&output=csv" },
   { name: "생명과학첨단기기실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1054265451&single=true&output=csv" },
   { name: "생명시약실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1702942479&single=true&output=csv" },
   { name: "지구과학학실험실1",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=482016705&single=true&output=csv" },
   { name: "지구과학학실험실2",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1159490737&single=true&output=csv" },
   { name: "지구과학R&E실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1383335509&single=true&output=csv" },
   { name: "지구과학첨단기기실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1694395998&single=true&output=csv" },
   { name: "지구과학특별실험실",   url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwYv6VSQ5BHEs5ABvlFJCGm7W9FiWfohCniPSCu85rbnKg06iT2X3LIa53qMMZk0jYL8aQA7FID8wC/pub?gid=1161329590&single=true&output=csv" },

];

const COLUMNS = ["품목명", "영문명", "CAS번호", "화학식", "수량", "위치", "장소", "분류", "별칭", "비고"];
