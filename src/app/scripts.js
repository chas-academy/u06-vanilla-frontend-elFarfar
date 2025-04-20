//toggle menu (navbar)

const menuIcon = document.getElementById("menuIcon");
const menu = document.getElementById("menu");

menuIcon.addEventListener("click", () => {
  menu.classList.toggle("show");
  menuIcon.classList.toggle("rotate");
});

//registerFORM

document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("https://u05-api.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Registered successfully!");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Registration failed");
    }
  });
//Login-Form
  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("https://your-api-url.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      // Redirect to profile or dashboard
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed");
    }
  });

//API FETCH

const apiBaseUrl = "https://u05-api.onrender.com/api/auth"; // <- update with your actual deployed backend URL

// Dummy example data
const userData = {
  username: "testuser",
  email: "test@example.com",
  password: "123456",
};

document.getElementById("registerBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    console.log("Register:", data);
  } catch (err) {
    console.error("Register error:", err);
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await res.json();
    console.log("Login:", data);
    localStorage.setItem("token", data.token); // optional: save token for authenticated requests
  } catch (err) {
    console.error("Login error:", err);
  }
});
