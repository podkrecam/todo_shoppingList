"use strict";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login-required";
    }
    return Promise.reject(error);
  }
);

// DOM ELEMENTS
const name = document.getElementById("name");
const email = document.getElementById("email");
const age = document.getElementById("age");
const errorMessage = document.querySelector(".error-message");

const filterContainer = document.querySelector(".filter");
const categoryFilter = document.getElementById("category-filter");
const statusFilter = document.getElementById("status-filter");

const tasksContainer = document.querySelector(".tasks-container");
const addTaskForm = document.querySelector(".add-task-form");
const infoMessage = document.querySelector(".info-message");
const description = document.getElementById("description");
const category = document.getElementById("category");

const avatarElement = document.getElementById("avatar");
const smallAvatar = document.getElementById("small-avatar");
const accountName = document.querySelector(".account-name");
const userSettingsBtn = document.getElementById("user-settings-btn");
const saveBtn = document.querySelector(".save-btn");
const deleteAvatar = document.getElementById("delete-avatar");
const uploadAvatar = document.getElementById("upload-avatar");
const uploadFileInput = document.getElementById("upload-file");

const closeButton = document.querySelector(".close-modal");
const modal = document.querySelector(".settings-modal");
const overlay = document.querySelector(".overlay");
const logoutBtn = document.querySelector(".logout-btn");
const logoutAll = document.querySelector(".logout-all");
const deleteButtons = document.querySelector(".delete-buttons");
const deleteAccount = document.querySelector(".delete-account");

// LOAD STARTING CONTENT
window.addEventListener("DOMContentLoaded", async () => {
  const userResponse = await axios.get("users/me");
  accountName.innerHTML = userResponse.data.name.split(" ")[0];

  // LODA ALL TASKS
  await axios
    .get("/tasks")
    .then(function (response) {
      if (response.data.length === 0) {
        infoMessage.innerHTML = "You have no tasks yet.";
        return filterContainer.classList.add("hidden");
      }

      response.data.forEach((task) => {
        manageTask(task);
      });
    })
    .catch(function (error) {
      console.error("Błąd:", error);
    });

  // LOAD USER DETAILS
  await axios
    .patch("/users/me")
    .then(async (response) => {
      name.value = response.data.name;
      email.value = response.data.email;
      age.value = response.data.age;
      axios
        .get(`/users/${response.data._id}/avatar`, {
          responseType: "arraybuffer",
        })
        .then((response) => {
          if (response.data.byteLength < 4) {
            avatarElement.src = "/img/default-avatar.svg";
            return (smallAvatar.src = "/img/default-avatar.svg");
          }
          const base64Image = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          const imgData = "data:image/png;base64," + base64Image;

          avatarElement.src = imgData;
          smallAvatar.src = imgData;
        })
        .catch((error) => {
          console.error(
            "There was an error fetching the profile image:",
            error
          );
        });
    })
    .catch((error) => {
      errorMessage.innerHTML = error;
    });
});

// ADD TASK FUNCTION
function createElement(tag, className, textContent = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

// MANAGE TASK FUNCTION
function manageTask(task) {
  // CATEGORY COLORS
  const categoryColors = {
    Work: "red",
    Other: "blue",
    School: "green",
    Personal: "yellow",
  };
  const taskContainer = createElement("div", "task-container");
  taskContainer.id = task._id;

  const taskDescriptionContainer = createElement(
    "div",
    "task-description-container"
  );
  const taskDescription = createElement("input", "task-description");
  taskDescription.value = task.description;
  taskDescriptionContainer.appendChild(taskDescription);
  const taskCategory = createElement("div", "task-category", task.category);

  const taskStatusContainer = createElement("div", "task-status-container");
  let taskStatus;
  if (task.completed == false) {
    taskStatus = createElement("img", "task-status");
    taskStatus.src = "/img/uncompleted.svg";
    taskContainer.classList.add("uncompleted");
    taskStatusContainer.appendChild(taskStatus);
  } else {
    taskStatus = createElement("img", "task-status");
    taskStatus.src = "/img/completed.svg";
    taskContainer.classList.add("completed");
    taskStatusContainer.appendChild(taskStatus);
  }

  const deleteTaskContainer = createElement("div", "task-delete-container");
  const deleteTaskBtn = createElement("img", "task-delete-btn");
  deleteTaskContainer.appendChild(deleteTaskBtn);
  deleteTaskBtn.src = "/img/delete.svg";
  // SET COLOR
  taskCategory.style.color = categoryColors[task.category] || "grey";

  // ADD ELEMENTS TO THE TASK CONTAINER
  taskContainer.appendChild(taskDescriptionContainer);
  taskContainer.appendChild(taskCategory);
  taskContainer.appendChild(taskStatusContainer);
  taskContainer.appendChild(deleteTaskContainer);

  // ADD TASK CONTAINER TO UI
  if (task.completed === false) {
    tasksContainer.insertBefore(taskContainer, tasksContainer.firstChild);
  } else {
    tasksContainer.appendChild(taskContainer);
  }

  filterContainer.classList.remove("hidden");

  // DELETE TASK BUTTON
  deleteTaskBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await axios.delete(`/tasks/${taskContainer.id}`).then((response) => {
      taskContainer.remove();
      if (tasksContainer.childElementCount === 0) {
        infoMessage.innerHTML = "You have no tasks yet";
        filterContainer.classList.add("hidden");
      }
    });
  });

  taskStatus.addEventListener("click", async (e) => {
    if (taskContainer.classList.contains("uncompleted")) {
      await axios
        .patch(`/tasks/${taskContainer.id}`, { completed: true })
        .then((response) => {
          taskContainer.classList.remove("uncompleted");
          taskContainer.classList.add("completed");
          taskStatus.src = "/img/completed.svg";
          tasksContainer.appendChild(taskContainer);
          infoMessage.innerHTML =
            "Congratulations! Task completed successfully!";
          setTimeout(() => {
            infoMessage.innerHTML = "";
          }, 2000);
        });
    } else if (taskContainer.classList.contains("completed")) {
      await axios
        .patch(`/tasks/${taskContainer.id}`, { completed: false })
        .then((response) => {
          taskContainer.classList.remove("completed");
          taskContainer.classList.add("uncompleted");
          taskStatus.src = "/img/uncompleted.svg";
          tasksContainer.insertBefore(taskContainer, tasksContainer.firstChild);
        });
    }
  });

  let taskDescriptionValue = taskDescription.value;
  taskDescription.addEventListener("change", (e) => {
    if (taskDescription.value === "") {
      taskDescription.value = taskDescriptionValue;
      return (infoMessage.innerHTML = "Please type a task description");
    }
    axios
      .patch(`/tasks/${taskContainer.id}`, {
        description: taskDescription.value,
      })
      .then((response) => {
        taskDescription.value = response.data.description;
        taskDescriptionValue = task;
        infoMessage.innerHTML = "Description has been successfully updated.";
      })
      .catch((error) => {
        infoMessage.innerHTML = "Please type a task description";
        taskDescription.value = taskDescriptionValue;
      });
    infoMessage.innerHTML = "";
  });
  infoMessage.innerHTML = "";
  description.value = "";
  category.value = "";
}

// ADD TASKS
addTaskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!description.value.trim()) {
    return (infoMessage.textContent = "Please type a task description");
  }
  if (category.value === "") {
    return (infoMessage.textContent = "Please choose category");
  }

  await axios
    .post("/tasks", {
      description: description.value,
      category: category.value,
    })
    .then((response) => {
      manageTask(response.data);
    });
});

// FILTER TASKS
const handleFilterChange = () => {
  const categoryValue = categoryFilter.value;
  const statusValue = statusFilter.value;

  tasksContainer.innerHTML = "";

  axios
    .get(`/tasks?category=${categoryValue}&completed=${statusValue}`)
    .then((response) => {
      response.data.forEach((task) => {
        manageTask(task);
      });
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error);
    });
};
categoryFilter.addEventListener("change", handleFilterChange);
statusFilter.addEventListener("change", handleFilterChange);

// SETTINGS MODAL WINDOW
function closeModal() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  errorMessage.innerHTML = "";
  deleteButtons.classList.add("hidden");
  deleteAccount.classList.remove("hidden");
}
function openModal() {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}
closeButton.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});
userSettingsBtn.addEventListener("click", openModal);

// UPDATE USER PROFILE
saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const response = await axios
    .patch("/users/me", {
      name: name.value,
      email: email.value,
      age: age.value,
    })
    .then((response) => {
      if (response.status === 200) {
        errorMessage.innerHTML = "Saved succesfully";
        accountName.innerHTML = response.data.name.split(" ")[0];
      }
    })
    .catch((error) => {
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
      if (error.response.data.includes("Cast to Number")) {
        return (errorMessage.innerHTML = "Age must be a number");
      }
      errorMessage.innerHTML = error.response.data.slice(
        error.response.data.lastIndexOf(":") + 2
      );
    });
});

// DELETE AVATAR
deleteAvatar.addEventListener("click", async (e) => {
  e.preventDefault();
  await axios
    .delete("/users/me/avatar")
    .then((response) => {
      avatar.src = "/img/default-avatar.svg";
      smallAvatar.src = "/img/default-avatar.svg";
      errorMessage.innerHTML = "Your avatar has been successfully removed.";
    })
    .catch((error) => {
      errorMessage.innerHTML = error;
    });
});
// UPLOAD NEW AVATAR
uploadAvatar.addEventListener("click", () => {
  uploadFileInput.click();
});
uploadFileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) {
    return (errorMessage.innerHTML = "Please select a file.");
  }

  const data = new FormData();
  data.append("avatar", file);

  // GET NEW AVATAR AFTER UPDATE
  try {
    await axios.post("/users/me/avatar", data, {
      headers: {
        "Content-Type": `multipart/form-data;`,
      },
    });

    const userResponse = await axios.get("users/me");
    const avatarResponse = await axios.get(
      `/users/${userResponse.data._id}/avatar`,
      {
        responseType: "arraybuffer",
      }
    );

    const base64Image = btoa(
      new Uint8Array(avatarResponse.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    const imgData = "data:image/png;base64," + base64Image;

    avatarElement.src = imgData;
    smallAvatar.src = imgData;

    errorMessage.innerHTML = "Avatar uploaded successfully.";
  } catch (error) {
    errorMessage.innerHTML = error.response.data;
  }
});

// LOGOUT BUTTON
logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await axios
    .post("/users/logout")
    .then(() => {
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("Błąd:", error);
    });
});

// LOGOUT ALL SESSIONS
logoutAll.addEventListener("click", async (e) => {
  await axios
    .post("/users/logoutAll")
    .then(() => {
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("Błąd:", error);
    });
});

// DELETE ACCOUNT
deleteAccount.addEventListener("click", (e) => {
  deleteButtons.classList.remove("hidden");
  deleteAccount.classList.add("hidden");
  modal.style.height = "max-height";

  document.querySelector(".yes-btn").addEventListener("click", async (e) => {
    await axios.delete("/users/me");
    window.location.href = "/";
  });
  document.querySelector(".no-btn").addEventListener("click", () => {
    deleteButtons.classList.add("hidden");
    deleteAccount.classList.remove("hidden");
  });
});
