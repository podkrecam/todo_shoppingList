"use strict";
const errorMessage = document.querySelector(".error-message");
const registerForm = document.querySelector(".register-form");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  console.log(name);
  const email = document.getElementById("email").value.trim();
  console.log(email);
  const password = document.getElementById("password").value.trim();

  try {
    const response = await axios.post("/users/register", {
      name,
      email,
      password,
    });
    window.location.href = "/myaccount";
  } catch (error) {
    if (error.response.data.startsWith("E11000")) {
      return (errorMessage.innerHTML =
        "This email address is already registered.");
    }
    if (error.response.data.includes("password: Path")) {
      return (errorMessage.innerHTML = "Type your password");
    }
    if (error.response.data.includes("`name`")) {
      return (errorMessage.innerHTML = "Type your name");
    }
    console.log(error.response.data);
    errorMessage.innerHTML = error.response.data.slice(
      error.response.data.lastIndexOf(":") + 2
    );
  }
});
