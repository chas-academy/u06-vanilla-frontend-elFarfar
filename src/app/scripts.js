const API_BASE = "https://u05-api.onrender.com";

const showMessage = (msg) => alert(msg);
const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const redirect = (url) => (window.location.href = url);
const qs = (selector) => document.querySelector(selector);

//Hä
const getFormValues = (ids, stripPrefix = false) =>
  ids.reduce((acc, id) => {
    // Om stripPrefix är true, ta bort "edit" från ID och gör den första bokstaven liten, förbättrar Edit bugg. 
    const key = stripPrefix
      ? id.replace(/^edit/, "").replace(/^./, (c) => c.toLowerCase())
      : id;
    acc[key] = qs(`#${id}`).value;
    return acc;
  }, {});  // Startar med ett tomt objekt

const setFormValues = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    const el = qs(`#edit${capitalizeFirst(key)}`);
    if (el) el.value = value;
  });
};

const capitalizeFirst = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const currentEdit = {
  id: null,
};

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuIcon = qs("#menuIcon");
  const menu = qs("#menu");
  menuIcon?.addEventListener("click", () => {
    menu.classList.toggle("show");
    menuIcon.classList.toggle("rotate");
  });

  setupRegister();
  setupLogin();
  setupWorkoutForm();
  setupEditForm();
  getWorkouts();
});

// ------------------ REGISTER ------------------
function setupRegister() {
  const form = qs("#registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { username, email, password } = getFormValues([
      "username",
      "email",
      "password",
    ]);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        showMessage("Registered successfully!");
        redirect("login.html");
      } else {
        showMessage(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      showMessage("An error occurred.");
    }
  });
}

// ------------------ LOGIN ------------------
function setupLogin() {
  const form = qs("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { email, password } = getFormValues(["email", "password"]);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        showMessage("Login successful!");
        redirect("profile.html");
      } else {
        showMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong.");
    }
  });
}

// ------------------ CREATE WORKOUT ------------------
function setupWorkoutForm() {
  const form = qs("#workoutForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { workoutType, duration, focus, goal } = getFormValues([
      "workoutType",
      "duration",
      "focus",
      "goal",
    ]);

    try {
      const res = await fetch(`${API_BASE}/api/v1/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ workoutType, duration, focus, goal }),
      });

      const data = await res.json();
      if (res.ok) {
        showMessage("Workout added!");
        form.reset();
        getWorkouts();
      } else {
        showMessage(data.message || "Failed to add workout");
      }
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong.");
    }
  });
}
console.log("Sending update to:", currentEdit.id);

// ------------------ EDIT WORKOUT ------------------
function setupEditForm() {
  const form = qs("#editWorkoutForm");
  const cancelBtn = qs("#cancelEdit");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
   const { workoutType, duration, focus, goal } = getFormValues(
     ["editWorkoutType", "editDuration", "editFocus", "editGoal"],
     true
   );

    try {
      const res = await fetch(`${API_BASE}/api/v1/workouts/${currentEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          workoutType,
          duration,
          focus,
          goal,
        }),
      });

      const data = await res.json();
      console.log("Updated workout returned:", data); // LOGING EDIT ERROR
      if (res.ok) {
        showMessage("Workout updated!");
        form.reset();
        qs("#editWorkoutSection").classList.add("hidden");
        getWorkouts();
      } else {
        showMessage(data.message || "Failed to update workout");
      }
    } catch (err) {
      console.error(err);
      showMessage("Error updating workout");
    }
  });

  cancelBtn?.addEventListener("click", () => {
    form.reset();
    qs("#editWorkoutSection").classList.add("hidden");
    currentEdit.id = null;
  });
}

// ------------------ FETCH & DISPLAY WORKOUTS ------------------
async function getWorkouts() {
  const container = qs("#workoutList");
  if (!container) return;
  container.innerHTML = "";
  container.addEventListener("click", handleWorkoutButtons);

  try {
    const res = await fetch(`${API_BASE}/api/v1/workouts`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const workouts = await res.json();
    if (!res.ok)
      return showMessage(workouts.message || "Failed to load workouts");

    workouts.forEach((w) => {
      const div = document.createElement("div");
      div.className = "workout-card";
      div.innerHTML = `
        <h3>${w.workoutType}</h3>
        <p>Duration: ${w.duration} minutes</p>
        <p>Focus: ${w.focus}</p>
        <p>Goal: ${w.goal}</p>
        <button class="btn btn--edit" data-id="${w._id}" data-type="${w.workoutType}" data-duration="${w.duration}" data-focus="${w.focus}" data-goal="${w.goal}">Edit</button>
        <button class="btn btn--delete" data-id="${w._id}">Delete</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    showMessage("Failed to fetch workouts");
  }
}

async function handleWorkoutButtons(e) {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("btn--delete")) {
    if (!confirm("Delete this workout?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/workouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await res.json();

      if (res.ok) {
        showMessage("Workout deleted!");
        getWorkouts();
      } else {
        showMessage(result.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      showMessage("Error deleting workout");
    }
  }

  if (e.target.classList.contains("btn--edit")) {
    currentEdit.id = id;
    setFormValues({
      workoutType: e.target.dataset.type,
      duration: e.target.dataset.duration,
      focus: e.target.dataset.focus,
      goal: e.target.dataset.goal,
    });
    qs("#editWorkoutSection").classList.remove("hidden");
  }
}
