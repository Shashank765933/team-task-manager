const API = "";

// ================= SIGNUP =================
function signup() {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const role = document.getElementById("signupRole").value;

  if (!email || !password) {
    alert("Fill all fields");
    return;
  }

  fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.msg);
  });
}

// ================= LOGIN =================
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(user => {
    if (user.msg) return alert(user.msg);

    localStorage.setItem("user", JSON.stringify(user));
    window.location = "dashboard.html";
  });
}

// ================= CREATE PROJECT =================
function createProject() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first");
    window.location = "index.html";
    return;
  }

  const name = document.getElementById("projectName").value.trim();

  if (!name) return alert("Enter project name");

  fetch(API + "/project", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, role: user.role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg) return alert(data.msg);

    document.getElementById("projectName").value = "";
    loadProjects();
  });
}

// ================= LOAD PROJECTS =================
function loadProjects() {
  fetch(API + "/project")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("projectList");
      list.innerHTML = "";

      data.forEach(p => {
        list.innerHTML += `
          <li>
            <span>${p.name}</span>
            <button class="delete-btn" onclick="deleteProject(${p.id})">Delete</button>
          </li>
        `;
      });
    });
}

// ================= DELETE PROJECT =================
function deleteProject(id) {
  fetch(API + "/project/" + id, { method: "DELETE" })
    .then(() => loadProjects());
}

// ================= CREATE TASK =================
function createTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const assignedTo = document.getElementById("assignedTo").value.trim();
  const deadline = document.getElementById("deadline").value;

  if (!title || !assignedTo || !deadline) {
    return alert("Fill all fields");
  }

  fetch(API + "/task", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ title, assignedTo, deadline })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg) return alert(data.msg);

    document.getElementById("taskTitle").value = "";
    document.getElementById("assignedTo").value = "";
    document.getElementById("deadline").value = "";

    loadTasks();
    loadDashboard();
  });
}

// ================= LOAD TASKS =================
function loadTasks() {
  fetch(API + "/task")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("taskList");
      list.innerHTML = "";

      data.forEach(t => {
        list.innerHTML += `
          <li>
            <span>${t.title} (${t.assignedTo}) - ${t.status}</span>
            <div class="btn-group">
              <button class="done-btn" onclick="completeTask(${t.id})">Done</button>
              <button class="delete-btn" onclick="deleteTask(${t.id})">Delete</button>
            </div>
          </li>
        `;
      });
    });
}

// ================= COMPLETE TASK =================
function completeTask(id) {
  fetch(API + "/task/" + id, { method: "PUT" })
    .then(() => {
      loadTasks();
      loadDashboard();
    });
}

// ================= DELETE TASK =================
function deleteTask(id) {
  fetch(API + "/task/" + id, { method: "DELETE" })
    .then(() => {
      loadTasks();
      loadDashboard();
    });
}

// ================= DASHBOARD =================
function loadDashboard() {
  fetch(API + "/dashboard")
    .then(res => res.json())
    .then(data => {
      const stats = document.getElementById("stats");
      if (stats) {
        stats.innerText =
          `Total: ${data.total} | Completed: ${data.completed} | Overdue: ${data.overdue}`;
      }
    });
}

// ================= AUTO LOAD =================
if (window.location.pathname.includes("dashboard")) {
  loadProjects();
  loadTasks();
  loadDashboard();
}