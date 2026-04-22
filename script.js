document.addEventListener("DOMContentLoaded", () => {
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const weekDayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
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

  let currentMonth = new Date("2026-05-01T12:00:00");
  let editingTaskId = null;

  const el = {
    tableViewBtn: document.getElementById("tableViewBtn"),
    calendarViewBtn: document.getElementById("calendarViewBtn"),
    manageBtn: document.getElementById("manageBtn"),
    addTaskBtn: document.getElementById("addTaskBtn"),
    tableView: document.getElementById("tableView"),
    calendarView: document.getElementById("calendarView"),
    tasksTableBody: document.getElementById("tasksTableBody"),
    monthLabel: document.getElementById("monthLabel"),
    calendarWeekdays: document.getElementById("calendarWeekdays"),
    calendarGrid: document.getElementById("calendarGrid"),
    prevMonthBtn: document.getElementById("prevMonthBtn"),
    nextMonthBtn: document.getElementById("nextMonthBtn"),
    searchInput: document.getElementById("searchInput"),
    statusFilter: document.getElementById("statusFilter"),
    branchFilter: document.getElementById("branchFilter"),
    taskModal: document.getElementById("taskModal"),
    taskModalTitle: document.getElementById("taskModalTitle"),
    taskWeek: document.getElementById("taskWeek"),
    taskDate: document.getElementById("taskDate"),
    mainPhotographer: document.getElementById("mainPhotographer"),
    mainEngineer: document.getElementById("mainEngineer"),
    mainStatus: document.getElementById("mainStatus"),
    mainScript: document.getElementById("mainScript"),
    coordPhotographer: document.getElementById("coordPhotographer"),
    coordEngineer: document.getElementById("coordEngineer"),
    coordStatus: document.getElementById("coordStatus"),
    coordScript: document.getElementById("coordScript"),
    saveTaskBtn: document.getElementById("saveTaskBtn"),
    manageModal: document.getElementById("manageModal"),
    newPhotographerName: document.getElementById("newPhotographerName"),
    newPhotographerRole: document.getElementById("newPhotographerRole"),
    addPhotographerBtn: document.getElementById("addPhotographerBtn"),
    photographersList: document.getElementById("photographersList"),
    newEngineerName: document.getElementById("newEngineerName"),
    newEngineerBranch: document.getElementById("newEngineerBranch"),
    addEngineerBtn: document.getElementById("addEngineerBtn"),
    engineersList: document.getElementById("engineersList")
  };

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ photographers, engineers, tasks }));
  }

  function loadLocal() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.photographers)) photographers = parsed.photographers;
      if (Array.isArray(parsed.engineers)) engineers = parsed.engineers;
      if (Array.isArray(parsed.tasks)) tasks = parsed.tasks;
    } catch (e) {
      console.error(e);
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
      search: el.searchInput.value.trim().toLowerCase(),
      status: el.statusFilter.value,
      branch: el.branchFilter.value
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
        ].join(" ").toLowerCase();

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
    const filtered = getFilteredTasks();
    el.tasksTableBody.innerHTML = "";

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
        <td rowspan="2"><button type="button" class="edit-task-btn" data-id="${task.id}">تعديل</button></td>
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

      el.tasksTableBody.appendChild(tr1);
      el.tasksTableBody.appendChild(tr2);
    });

    document.querySelectorAll(".edit-task-btn").forEach((btn) => {
      btn.addEventListener("click", () => openTaskModal(btn.dataset.id));
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
    for (let day = 1; day <= totalDays; day++) days.push(new Date(year, month, day));
    while (days.length % 7 !== 0) days.push(null);

    return days;
  }

  function renderCalendar() {
    el.monthLabel.textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    el.calendarWeekdays.innerHTML = "";
    el.calendarGrid.innerHTML = "";

    weekDayNames.forEach((day) => {
      const div = document.createElement("div");
      div.textContent = day;
      el.calendarWeekdays.appendChild(div);
    });

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
        el.calendarGrid.appendChild(empty);
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
        event.addEventListener("click", () => openTaskModal(task.id));
        cell.appendChild(event);
      });

      el.calendarGrid.appendChild(cell);
    });
  }

  function populateSelect(select, items, labelFn) {
    select.innerHTML = "";
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = labelFn(item);
      select.appendChild(option);
    });
  }

  function openModal(modal) {
    modal.classList.remove("hidden");
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
  }

  function openTaskModal(taskId = null) {
    editingTaskId = taskId;

    const mainPhotographers = photographers.filter((p) => p.role === "main");
    const coordPhotographers = photographers.filter((p) => p.role === "coordination");

    populateSelect(el.mainPhotographer, mainPhotographers, (x) => x.name);
    populateSelect(el.coordPhotographer, coordPhotographers, (x) => x.name);
    populateSelect(el.mainEngineer, engineers, (x) => `${x.name} - ${x.branch}`);
    populateSelect(el.coordEngineer, engineers, (x) => `${x.name} - ${x.branch}`);

    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      el.taskModalTitle.textContent = `تعديل الأسبوع ${task.week}`;
      el.taskWeek.value = task.week;
      el.taskDate.value = task.date;
      el.mainPhotographer.value = task.main.photographerId || "";
      el.mainEngineer.value = task.main.engineerId || "";
      el.mainStatus.value = task.main.status;
      el.mainScript.value = task.main.script || "";
      el.coordPhotographer.value = task.coordination.photographerId || "";
      el.coordEngineer.value = task.coordination.engineerId || "";
      el.coordStatus.value = task.coordination.status;
      el.coordScript.value = task.coordination.script || "";
    } else {
      const nextWeek = Math.max(0, ...tasks.map((t) => t.week)) + 1;
      el.taskModalTitle.textContent = "إضافة مهمة";
      el.taskWeek.value = nextWeek;
      el.taskDate.value = "";
      el.mainPhotographer.value = mainPhotographers[0]?.id || "";
      el.mainEngineer.value = engineers[0]?.id || "";
      el.mainStatus.value = "مجدول";
      el.mainScript.value = "";
      el.coordPhotographer.value = coordPhotographers[0]?.id || "";
      el.coordEngineer.value = engineers[1]?.id || engineers[0]?.id || "";
      el.coordStatus.value = "مجدول";
      el.coordScript.value = "";
    }

    openModal(el.taskModal);
  }

  function saveTask() {
    const payload = {
      id: editingTaskId || `w${Date.now()}`,
      week: Number(el.taskWeek.value),
      date: el.taskDate.value,
      main: {
        photographerId: el.mainPhotographer.value,
        engineerId: el.mainEngineer.value,
        status: el.mainStatus.value,
        script: el.mainScript.value.trim()
      },
      coordination: {
        photographerId: el.coordPhotographer.value,
        engineerId: el.coordEngineer.value,
        status: el.coordStatus.value,
        script: el.coordScript.value.trim()
      }
    };

    if (editingTaskId) {
      tasks = tasks.map((t) => (t.id === editingTaskId ? payload : t));
    } else {
      tasks.push(payload);
    }

    saveLocal();
    closeModal(el.taskModal);
    renderAll();
  }

  function renderPeople() {
    el.photographersList.innerHTML = "";
    el.engineersList.innerHTML = "";

    photographers.forEach((item) => {
      const row = document.createElement("div");
      row.className = "list-item";
      row.innerHTML = `
        <div>
          <div>${item.name}</div>
          <small>${item.role === "main" ? "أساسي" : "تنسيقات"}</small>
        </div>
        <button type="button" class="danger remove-photographer-btn" data-id="${item.id}">حذف</button>
      `;
      el.photographersList.appendChild(row);
    });

    engineers.forEach((item) => {
      const row = document.createElement("div");
      row.className = "list-item";
      row.innerHTML = `
        <div>
          <div>${item.name}</div>
          <small>${item.branch}</small>
        </div>
        <button type="button" class="danger remove-engineer-btn" data-id="${item.id}">حذف</button>
      `;
      el.engineersList.appendChild(row);
    });

    document.querySelectorAll(".remove-photographer-btn").forEach((btn) => {
      btn.addEventListener("click", () => removePhotographer(btn.dataset.id));
    });

    document.querySelectorAll(".remove-engineer-btn").forEach((btn) => {
      btn.addEventListener("click", () => removeEngineer(btn.dataset.id));
    });
  }

  function addPhotographer() {
    const name = el.newPhotographerName.value.trim();
    const role = el.newPhotographerRole.value;
    if (!name) return;

    photographers.push({ id: `p${Date.now()}`, name, role });
    el.newPhotographerName.value = "";
    saveLocal();
    renderAll();
  }

  function addEngineer() {
    const name = el.newEngineerName.value.trim();
    const branch = el.newEngineerBranch.value;
    if (!name) return;

    engineers.push({ id: `e${Date.now()}`, name, branch });
    el.newEngineerName.value = "";
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
    el.tableView.classList.toggle("hidden", view !== "table");
    el.calendarView.classList.toggle("hidden", view !== "calendar");
    el.tableViewBtn.classList.toggle("active", view === "table");
    el.calendarViewBtn.classList.toggle("active", view === "calendar");
  }

  function renderAll() {
    renderTable();
    renderCalendar();
    renderPeople();
  }

  el.tableViewBtn.addEventListener("click", () => switchView("table"));
  el.calendarViewBtn.addEventListener("click", () => switchView("calendar"));
  el.manageBtn.addEventListener("click", () => openModal(el.manageModal));
  el.addTaskBtn.addEventListener("click", () => openTaskModal());
  el.saveTaskBtn.addEventListener("click", saveTask);
  el.addPhotographerBtn.addEventListener("click", addPhotographer);
  el.addEngineerBtn.addEventListener("click", addEngineer);
  el.prevMonthBtn.addEventListener("click", () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  el.nextMonthBtn.addEventListener("click", () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  el.searchInput.addEventListener("input", renderAll);
  el.statusFilter.addEventListener("change", renderAll);
  el.branchFilter.addEventListener("change", renderAll);

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-close");
      const target = document.getElementById(targetId);
      if (target) closeModal(target);
    });
  });

  loadLocal();
  switchView("table");
  renderAll();
});
