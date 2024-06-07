"use strict";

const loginBtn = document.querySelector(".login-btn");
const registerBtns = document.querySelectorAll(".register-btn");

loginBtn.addEventListener("click", function () {
  axios
    .get("/login")
    .then(function (response) {
      window.location.href = "/login";
    })
    .catch(function (error) {
      console.error("Błąd:", error);
    });
});

registerBtns.forEach((button) => {
  button.addEventListener("click", () => {
    axios
      .get("/register")
      .then(function (response) {
        window.location.href = "/register";
      })
      .catch(function (error) {
        console.error("Błąd:", error);
      });
  });
});
