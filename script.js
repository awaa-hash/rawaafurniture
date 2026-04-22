const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const statusOptions = ["مجدول", "قيد التنفيذ", "مكتمل", "مؤجل"];
const STORAGE_KEY = "filming_schedule_github_mvp";

let photographers = [
  { id: "p1", name: "عمرو", role: "main" },
  { id: "p2", name: "أبرار", role: "main" },
  { id: "p3", name: "ابتهاج", role: "main" },
  { id: "p4", name: "أم جني", role: "coordination" }
];

let engineers = [
  { id: "e1", name: "دعاء حمزة", branch: "الدمام" },
  { id: "e2", name: "بتول رضوان", branch: "الدمام" },
  { id: "e3", name: "بتول بركات", branch: "الدمام" },
  { id: "e4", name: "وسام", branch: "الدمام" },
  { id: "e5", name: "جني", branch: "الدمام" },
  { id: "e6", name: "هديل", branch: "الدمام" },
  { id: "e7", name: "فرح", branch: "الدمام" },
  { id: "e8", name: "أحمد رضا", branch: "الدمام" },
  { id: "e9", name: "رياض", branch: "الدمام" },
  { id: "e10", name: "حمدي", branch: "الدمام" },
  { id: "e11", name: "حامد", branch: "الدمام" },
  { id: "e12", name: "سعاد صوت", branch: "الدمام" },
  { id: "e13", name: "محمد إسماعيل", branch: "الرياض" },
  { id: "e14", name: "العنود صوت", branch: "الرياض" }
];

let tasks = [
  {
    id: "w1",
    week: 1,
    date: "2026-04-27",
    main: { photographerId: "p1", engineerId: "e1", status: "مجدول", script: "" },
    coordination: { photographerId: "p4", engineerId: "e2", status: "مجدول", script: "" }
  },
  {
    id: "w2",
    week: 2,
    date: "2026-05-04",
    main: { photographerId: "p2", engineerId: "e3", status: "مجدول", script: "" },
    coordination: { photographerId: "p4", engineerId: "e4", status: "مجدول", script: "" }
  },
  {
    id: "w3",
    week: 3,
    date: "2026-05-11",
    main: { photographerId: "p3", engineerId: "e13", status: "مجدول", script: "" },
    coordination: { photographerId: "p4", engineerId: "e5", status: "مجدول", script: "" }
  },
  {
    id: "w4",
    week: 4,
    date: "2026-05-18",
    main: { photographerId: "p1", engineerId: "e6", status: "مجدول", script: "" },
    coordination: { photographerId: "p4", engineerId: "e7", status: "مجدول", script: "" }
  }
];

let currentView = "table";
let currentMonth = new Date("2026-05-01T12:00:00");
let editingTaskId = null;

function saveLocal() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ photographers, engineers, tasks })
  );
}

function loadLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.photographers) photographers = parsed.photographers;
    if (parsed.engineers) engineers = parsed.engineers;
    if (parsed.tasks) tasks = parsed.tasks;
  } catch (e) {
    console.error("Failed to load local data", e);
  }
}

function getPhotographerById(id) {
  return photographers.find((p) => p.id === id);
}

function getEngineerById(id) {
  return engineers.find((e) => e.id === id);
}

function getPhotographerName(id) {
  return getPhotographerById(id)?.name || "-";
}

function getEngineerName(id) {
  return getEngineerById(id)?.name || "-";
}

function getEngineerBranch(id) {
  return getEngineerById(id)?.branch || "-";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function getBadgeClass(name) {
  if (name === "عمرو") return "badge badge-teal";
  if (name === "أبرار") return "badge badge-blue";
  if (name === "ابتهاج") return "badge badge-violet";
  return "badge badge-rose";
}

function getFilters() {
  return {
    search: document.getElementById("searchInput").value.trim().toLowerCase(),
    status: document.getElementById("statusFilter").value,
    branch: document.getElementById("branchFilter").value
  };
}

function getFilteredTasks() {
  const filters = getFilters();

  return tasks
    .map((task) => ({
      ...task,
      mainPhotographerName: getPhotographerName(task.main.photographerId),
      coordPhotographerName: getPhotographerName(task.coordination.photographerId),
      mainEngineerName: getEngineerName(task.main.engineerId),
      coordEngineerName: getEngineerName(task.coordination.engineerId),
      mainBranch: getEngineerBranch(task.main.engineerId),
      coordBranch: getEngineerBranch(task.coordination.engineerId)
    }))
    .filter((task) => {
      const text = [
        task.week,
        task.mainPhotographerName,
        task.coordPhotographerName,
        task.mainEngineerName,
        task.coordEngineerName,
        task.main.script,
        task.coordination.script
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(filters.search);
      const matchesStatus =
        filters.status === "الكل" ||
        task.main.status === filters.status ||
        task.coordination.status === filters.status;
      const matchesBranch =
        filters.branch === "الكل" ||
        task.mainBranch === filters.branch ||
        task.coordBranch === filters.branch;

      return matchesSearch && matchesStatus && matchesBranch;
    })
    .sort((a, b) => a.week - b.week);
}

function renderTable() {
  const tbody = document.getElementById("tasksTableBody");
  const filtered = getFilteredTasks();

  tbody.innerHTML = "";

  filtered.forEach((task) => {
    const tr1 = document.createElement("tr");
    tr1.innerHTML = `
      <td rowspan="2">${task.week}</td>
      <td rowspan="2">${formatDate(task.date)}</td>
      <td>الحلقة الأساسية</td>
      <td><span class="${getBadgeClass(task.mainPhotographerName)}">${task.mainPhotographerName}</span></td>
      <td>${task.mainEngineerName}</td>
      <td>${task.mainBranch}</td>
      <td>${task.main.status}</td>
      <td>${task.main.script || "—"}</td>
      <td rowspan="2"><button onclick="openTaskModal('${task.id}')"><i data-feather></i>تعديل</button></td>
    `;

    const tr2 = document.createElement("tr");
    tr2.innerHTML = `
      <td>التنسيقات</td>
      <td><span class="${getBadgeClass(task.coordPhotographerName)}">${task.coordPhotographerName}</span></td>
      <td>${task.coordEngineerName}</td>
      <td>${task.coordBranch}</td>
      <td>${task.coordination.status}</td>
      <td>${task.coordination.script || "—"}</td>
    `;

    tbody.appendChild(tr1);
    tbody.appendChild(tr2);
  });
}

function buildCalendarDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startIndex = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const days = [];

  for (let i = 0; i < startIndex; i++) days.push(null);
  for (let day = 1; day <= totalDays; day++) {
    days.push(new Date(year, month, day));
  }
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function renderCalendar() {
  document.getElementById("monthLabel").textContent =
    `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const weekdays = document.getElementById("calendarWeekdays");
  weekdays.innerHTML = "";
  weekDayNames.forEach((day) => {
    const div = document.createElement("div");
    div.textContent = day;
    weekdays.appendChild(div);
  });

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const filtered = getFilteredTasks();
  const map = {};
  filtered.forEach((task) => {
    if (!map[task.date]) map[task.date] = [];
    map[task.date].push(task);
  });

  buildCalendarDays(currentMonth).forEach((dateObj) => {
    if (!dateObj) {
      const empty = document.createElement("div");
      empty.className = "calendar-empty";
      grid.appendChild(empty);
      return;
    }

    const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = dateObj.getDate();
    cell.appendChild(num);

    (map[key] || []).forEach((task) => {
      const event = document.createElement("div");
      event.className = "day-event";
      event.innerHTML = `
        <div><strong>أسبوع ${task.week}</strong></div>
        <div>${task.mainPhotographerName} × ${task.mainEngineerName}</div>
        <div>${task.coordPhotographerName} × ${task.coordEngineerName}</div>
      `;
      event.onclick = () => openTaskModal(task.id);
      cell.appendChild(event);
    });

    grid.appendChild(cell);
  });
}

function populateSelect(selectId, items, valueKey = "id", labelFn = (x) => x.name) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueKey];
    option.textContent = labelFn(item);
    select.appendChild(option);
  });
}

function openTaskModal(taskId = null) {
  editingTaskId = taskId;

  const mainPhotographers = photographers.filter((p) => p.role === "main");
  const coordPhotographers = photographers.filter((p) => p.role === "coordination");

  populateSelect("mainPhotographer", mainPhotographers);
  populateSelect("coordPhotographer", coordPhotographers);
  populateSelect("mainEngineer", engineers, "id", (x) => `${x.name} - ${x.branch}`);
  populateSelect("coordEngineer", engineers, "id", (x) => `${x.name} - ${x.branch}`);

  if (taskId) {
    const task = tasks.find((t) => t.id === taskId);
    document.getElementById("taskModalTitle").textContent = `تعديل الأسبوع ${task.week}`;
    document.getElementById("taskWeek").value = task.week;
    document.getElementById("taskDate").value = task.date;
    document.getElementById("mainPhotographer").value = task.main.photographerId || "";
    document.getElementById("mainEngineer").value = task.main.engineerId || "";
    document.getElementById("mainStatus").value = task.main.status;
    document.getElementById("mainScript").value = task.main.script || "";
    document.getElementById("coordPhotographer").value = task.coordination.photographerId || "";
    document.getElementById("coordEngineer").value = task.coordination.engineerId || "";
    document.getElementById("coordStatus").value = task.coordination.status;
    document.getElementById("coordScript").value = task.coordination.script || "";
  } else {
    document.getElementById("taskModalTitle").textContent = "إضافة مهمة";
    const nextWeek = Math.max(0, ...tasks.map((t) => t.week)) + 1;
    document.getElementById("taskWeek").value = nextWeek;
    document.getElementById("taskDate").value = "";
    document.getElementById("mainPhotographer").value = mainPhotographers[0]?.id || "";
    document.getElementById("mainEngineer").value = engineers[0]?.id || "";
    document.getElementById("mainStatus").value = "مجدول";
    document.getElementById("mainScript").value = "";
    document.getElementById("coordPhotographer").value = coordPhotographers[0]?.id || "";
    document.getElementById("coordEngineer").value = engineers[1]?.id || engineers[0]?.id || "";
    document.getElementById("coordStatus").value = "مجدول";
    document.getElementById("coordScript").value = "";
  }

  openModal("taskModal");
}

function saveTask() {
  const payload = {
    id: editingTaskId || `w${Date.now()}`,
    week: Number(document.getElementById("taskWeek").value),
    date: document.getElementById("taskDate").value,
    main: {
      photographerId: document.getElementById("mainPhotographer").value,
      engineerId: document.getElementById("mainEngineer").value,
      status: document.getElementById("mainStatus").value,
      script: document.getElementById("mainScript").value.trim()
    },
    coordination: {
      photographerId: document.getElementById("coordPhotographer").value,
      engineerId: document.getElementById("coordEngineer").value,
      status: document.getElementById("coordStatus").value,
      script: document.getElementById("coordScript").value.trim()
    }
  };

  if (editingTaskId) {
    tasks = tasks.map((t) => (t.id === editingTaskId ? payload : t));
  } else {
    tasks.push(payload);
  }

  saveLocal();
  closeModal("taskModal");
  renderAll();
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function renderPeople() {
  const photographersList = document.getElementById("photographersList");
  const engineersList = document.getElementById("engineersList");

  photographersList.innerHTML = "";
  engineersList.innerHTML = "";

  photographers.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <div>${item.name}</div>
        <small>${item.role === "main" ? "أساسي" : "تنسيقات"}</small>
      </div>
      <button class="danger" onclick="removePhotographer('${item.id}')">حذف</button>
    `;
    photographersList.appendChild(row);
  });

  engineers.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <div>${item.name}</div>
        <small>${item.branch}</small>
      </div>
      <button class="danger" onclick="removeEngineer('${item.id}')">حذف</button>
    `;
    engineersList.appendChild(row);
  });
}

function addPhotographer() {
  const name = document.getElementById("newPhotographerName").value.trim();
  const role = document.getElementById("newPhotographerRole").value;
  if (!name) return;

  photographers.push({
    id: `p${Date.now()}`,
    name,
    role
  });

  document.getElementById("newPhotographerName").value = "";
  saveLocal();
  renderAll();
}

function addEngineer() {
  const name = document.getElementById("newEngineerName").value.trim();
  const branch = document.getElementById("newEngineerBranch").value;
  if (!name) return;

  engineers.push({
    id: `e${Date.now()}`,
    name,
    branch
  });

  document.getElementById("newEngineerName").value = "";
  saveLocal();
  renderAll();
}

function removePhotographer(id) {
  photographers = photographers.filter((p) => p.id !== id);
  tasks = tasks.map((task) => ({
    ...task,
    main: {
      ...task.main,
      photographerId: task.main.photographerId === id ? "" : task.main.photographerId
    },
    coordination: {
      ...task.coordination,
      photographerId: task.coordination.photographerId === id ? "" : task.coordination.photographerId
    }
  }));

  saveLocal();
  renderAll();
}

function removeEngineer(id) {
  engineers = engineers.filter((e) => e.id !== id);
  tasks = tasks.map((task) => ({
    ...task,
    main: {
      ...task.main,
      engineerId: task.main.engineerId === id ? "" : task.main.engineerId
    },
    coordination: {
      ...task.coordination,
      engineerId: task.coordination.engineerId === id ? "" : task.coordination.engineerId
    }
  }));

  saveLocal();
  renderAll();
}

function switchView(view) {
  currentView = view;
  document.getElementById("tableView").classList.toggle("hidden", view !== "table");
  document.getElementById("calendarView").classList.toggle("hidden", view !== "calendar");
  document.getElementById("tableViewBtn").classList.toggle("active", view === "table");
  document.getElementById("calendarViewBtn").classList.toggle("active", view === "calendar");
}

function renderAll() {
  renderTable();
  renderCalendar();
  renderPeople();
}

document.getElementById("tableViewBtn").addEventListener("click", () => switchView("table"));
document.getElementById("calendarViewBtn").addEventListener("click", () => switchView("calendar"));
document.getElementById("manageBtn").addEventListener("click", () => openModal("manageModal"));
document.getElementById("addTaskBtn").addEventListener("click", () => openTaskModal());
document.getElementById("saveTaskBtn").addEventListener("click", saveTask);
document.getElementById("addPhotographerBtn").addEventListener("click", addPhotographer);
document.getElementById("addEngineerBtn").addEventListener("click", addEngineer);
document.getElementById("prevMonthBtn").addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  renderCalendar();
});
document.getElementById("nextMonthBtn").addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  renderCalendar();
});

document.getElementById("searchInput").addEventListener("input", renderAll);
document.getElementById("statusFilter").addEventListener("change", renderAll);
document.getElementById("branchFilter").addEventListener("change", renderAll);

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

loadLocal();
switchView("table");
renderAll();
