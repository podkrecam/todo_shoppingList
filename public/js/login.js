"use strict";
const errorMessage = document.querySelector(".error-message");
const loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post("/users/login", { email, password });
    window.location.href = "/myaccount";
  } catch (error) {
    errorMessage.innerHTML = error.response.data;
  }
});
