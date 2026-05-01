const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ================= USERS =================
let users = [
  { email: "admin@test.com", password: "123", role: "admin" },
  { email: "member@test.com", password: "123", role: "member" }
];

// ================= DATA =================
let projects = [];
let tasks = [];

// ================= SIGNUP =================
app.post("/signup", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.json({ msg: "All fields required" });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({ msg: "User already exists" });
  }

  users.push({ email, password, role });
  res.json({ msg: "Signup successful" });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) return res.json({ msg: "Invalid credentials" });

  res.json(user);
});

// ================= PROJECT =================
app.post("/project", (req, res) => {
  if (req.body.role !== "admin") {
    return res.json({ msg: "Only admin can create project" });
  }

  if (!req.body.name) {
    return res.json({ msg: "Project name required" });
  }

  const project = {
    id: Date.now(),
    name: req.body.name
  };

  projects.push(project);
  res.json(projects);
});

app.get("/project", (req, res) => {
  res.json(projects);
});

app.delete("/project/:id", (req, res) => {
  projects = projects.filter(p => p.id != req.params.id);
  res.json(projects);
});

// ================= TASK =================
app.post("/task", (req, res) => {
  const { title, assignedTo, deadline } = req.body;

  if (!title || !assignedTo || !deadline) {
    return res.json({ msg: "All fields required" });
  }

  const task = {
    id: Date.now(),
    title,
    assignedTo,
    deadline,
    status: "pending"
  };

  tasks.push(task);
  res.json(tasks);
});

app.get("/task", (req, res) => {
  res.json(tasks);
});

app.put("/task/:id", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (task) task.status = "completed";
  res.json(tasks);
});

app.delete("/task/:id", (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);
  res.json(tasks);
});

// ================= DASHBOARD =================
app.get("/dashboard", (req, res) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const overdue = tasks.filter(
    t => new Date(t.deadline) < new Date() && t.status !== "completed"
  ).length;

  res.json({ total, completed, overdue });
});


// ================= SERVE FRONTEND =================

// VERY IMPORTANT: correct path
const frontendPath = path.join(__dirname, "../frontend");

// serve static files
app.use(express.static(frontendPath));

// root route
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// fallback (for all routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


// ================= PORT =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});