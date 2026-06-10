(function () {
  "use strict";

  const namesInput = document.getElementById("names");
  const countEl = document.getElementById("count");
  const makeBtn = document.getElementById("makeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const resultEl = document.getElementById("result");

  const TEACHER = "선생님";

  // 그룹 카드에 순서대로 적용할 뉴트럴 surface
  const BLOCKS = ["g1", "g2", "g3", "g4", "g5", "g6"];

  // 입력 텍스트 → 이름 배열 (줄바꿈/쉼표 구분, 빈칸·중복 제거)
  function parseNames(text) {
    const seen = new Set();
    const names = [];
    text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((name) => {
        const key = name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          names.push(name);
        }
      });
    return names;
  }

  // Fisher–Yates 셔플
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 2인 1조로 묶기. 홀수면 선생님을 합류시켜 모든 팀을 2인으로.
  function makeTeams(names) {
    let pool = names.slice();
    let teacherAdded = false;
    if (pool.length % 2 === 1) {
      pool.push(TEACHER);
      teacherAdded = true;
    }
    // 선생님 추가 후 다시 섞어 위치가 고정되지 않도록 함
    pool = shuffle(pool);
    const teams = [];
    for (let i = 0; i < pool.length; i += 2) {
      teams.push(pool.slice(i, i + 2));
    }
    return { teams, teacherAdded };
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function memberHTML(name) {
    const isTeacher = name === TEACHER;
    return `
      <div class="member${isTeacher ? " is-teacher" : ""}">
        <span class="member-name">${escapeHTML(name)}</span>
      </div>`;
  }

  function updateCount() {
    countEl.textContent = `${parseNames(namesInput.value).length}명`;
  }

  function render(teams, total, teacherAdded) {
    let summary = `${total}명 · ${teams.length}개 팀`;
    if (teacherAdded) summary += " · 선생님 합류";

    const cards = teams
      .map((team, idx) => {
        const block = BLOCKS[idx % BLOCKS.length];
        return `
          <div class="team-card ${block}">
            ${team.map(memberHTML).join("")}
          </div>`;
      })
      .join("");

    resultEl.innerHTML = `
      <div class="result-header">
        <h2>팀 편성 결과</h2>
        <span class="summary">${summary}</span>
      </div>
      <div class="teams-grid">${cards}</div>`;
  }

  function handleMake() {
    const names = parseNames(namesInput.value);
    if (names.length < 1) {
      resultEl.innerHTML = `<p class="empty">팀을 짜려면 이름을 1명 이상 입력하세요.</p>`;
      return;
    }
    const { teams, teacherAdded } = makeTeams(names);
    render(teams, names.length, teacherAdded);
    document.body.classList.add("has-result");
  }

  function handleClear() {
    namesInput.value = "";
    resultEl.innerHTML = "";
    document.body.classList.remove("has-result");
    updateCount();
    namesInput.focus();
  }

  namesInput.addEventListener("input", updateCount);
  makeBtn.addEventListener("click", handleMake);
  clearBtn.addEventListener("click", handleClear);

  updateCount();
})();
