document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menuIcon");
  const menu = document.getElementById("menu");

  if (menuIcon && menu) {
    menuIcon.addEventListener("click", () => {
      menu.classList.toggle("show");
      menuIcon.classList.toggle("rotate");
    });
  }

  let currentEditId = null;

  // ------------------ REGISTER FORM ------------------
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const res = await fetch(
        "https://u05-api.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Registered successfully!");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed");
      }
    });
  }

  // ------------------ LOGIN FORM ------------------
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("https://u05-api.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.token);
          alert("Login successful!");
          window.location.href = "profile.html";
        } else {
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  // ------------------ WORKOUT FORM (CREATE) ------------------
  const workoutForm = document.getElementById("workoutForm");
  if (workoutForm) {
    workoutForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const workoutType = document.getElementById("workoutType").value;
      const duration = document.getElementById("duration").value;
      const focus = document.getElementById("focus").value;
      const goal = document.getElementById("goal").value;

      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          "https://u05-api.onrender.com/api/v1/workouts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ workoutType, duration, focus, goal }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          alert("Workout added!");
          workoutForm.reset();
          getWorkouts();
        } else {
          alert(data.message || "Failed to add workout");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong.");
      }
    });

    getWorkouts();
  }

  // ------------------ FETCH & RENDER WORKOUTS (READ) ------------------
  async function getWorkouts() {
    const token = localStorage.getItem("token");
    const workoutList = document.getElementById("workoutList");
    if (!workoutList) return;
    workoutList.innerHTML = "";

    try {
      const res = await fetch("https://u05-api.onrender.com/api/v1/workouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        data.forEach((workout) => {
          const div = document.createElement("div");
          div.classList.add("workout-card");
          div.innerHTML = `
          <h3>${workout.workoutType}</h3>
          <p>Duration: ${workout.duration} minutes</p>
          <p>Focus: ${workout.focus}</p>
          <p>Goal: ${workout.goal}</p>
          <button class="btn btn--edit" 
            data-id="${workout._id}" 
            data-type="${workout.workoutType}" 
            data-duration="${workout.duration}" 
            data-focus="${workout.focus}" 
            data-goal="${workout.goal}">
            Edit
          </button>
          <button class="btn btn--delete" data-id="${workout._id}">Delete</button>
        `;
          workoutList.appendChild(div);

          // Edit button
          const editBtn = div.querySelector(".btn--edit");
          if (editBtn) {
            editBtn.addEventListener("click", () => {
              currentEditId = editBtn.dataset.id;
              document.getElementById("editWorkoutType").value =
                editBtn.dataset.type;
              document.getElementById("editDuration").value =
                editBtn.dataset.duration;
              document.getElementById("editFocus").value =
                editBtn.dataset.focus;
              document.getElementById("editGoal").value = editBtn.dataset.goal;
              document
                .getElementById("editWorkoutSection")
                .classList.remove("hidden");
            });
          }

          // Delete button 
          const deleteBtn = div.querySelector(".btn--delete");
          if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
              const confirmed = confirm(
                "Are you sure you want to delete this workout?"
              );
              if (!confirmed) return;

              try {
                const deleteRes = await fetch(
                  `https://u05-api.onrender.com/api/v1/workouts/${workout._id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                const result = await deleteRes.json();

                if (deleteRes.ok) {
                  alert("Workout deleted!");
                  getWorkouts();
                } else {
                  alert(result.message || "Failed to delete workout.");
                }
              } catch (err) {
                console.error("Delete error:", err);
                alert("Something went wrong.");
              }
            });
          }
        });
      } else {
        alert(data.message || "Could not load workouts");
      }
    } catch (err) {
      console.error(err);
    }
  }
});
