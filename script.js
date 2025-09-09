let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let bin = JSON.parse(localStorage.getItem("bin")) || [];
let currentFilter = "all";

// Elements
const taskInput = document.getElementById("taskInput");
const taskDeadline = document.getElementById("taskDeadline");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const historyList = document.getElementById("historyList");
const recycleBin = document.getElementById("recycleBin");

// Save data
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("history", JSON.stringify(history));
  localStorage.setItem("bin", JSON.stringify(bin));
}

// Add Task
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const deadline = taskDeadline.value;
  if (text === "") return alert("Enter a task");

  tasks.push({ text, status: "incomplete", deadline });
  addHistory(`Added task "${text}" with deadline ${deadline || "none"}`);
  saveData();
  renderTasks();
  taskInput.value = "";
  taskDeadline.value = "";
});

// Render Tasks
function renderTasks() {
  taskList.innerHTML = "";
  tasks
    .filter(t => currentFilter === "all" || t.status === currentFilter)
    .forEach((task, index) => {
      const li = document.createElement("li");
      if (task.status === "completed") li.classList.add("completed");

      const span = document.createElement("span");
      span.textContent = `${task.text} ${task.deadline ? "(Deadline: " + task.deadline + ")" : ""}`;

      // Status dropdown
      const statusSelect = document.createElement("select");
      ["in progress", "completed", "incomplete", "postponed"].forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        if (task.status === status) option.selected = true;
        statusSelect.appendChild(option);
      });

      statusSelect.addEventListener("change", () => {
        task.status = statusSelect.value;
        addHistory(`Marked task "${task.text}" as ${task.status}`);
        saveData();
        renderTasks();

        if (task.status === "completed") {
          showCelebration();
        }
      });

      // Delete button
      const removeBtn = document.createElement("span");
      removeBtn.textContent = "🗑️";
      removeBtn.classList.add("remove-btn");
      removeBtn.addEventListener("click", () => {
        bin.push(task);
        tasks.splice(index, 1);
        addHistory(`Deleted task "${task.text}"`);
        saveData();
        renderTasks();
        renderBin();
      });

      li.appendChild(span);
      li.appendChild(statusSelect);
      li.appendChild(removeBtn);
      taskList.appendChild(li);
    });
}

// History
function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h;
    historyList.appendChild(li);
  });
}
function addHistory(action) {
  history.push(`${new Date().toLocaleString()}: ${action}`);
  saveData();
  renderHistory();
}

// Recycle Bin
function renderBin() {
  recycleBin.innerHTML = "";
  bin.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task.text;

    const restoreBtn = document.createElement("span");
    restoreBtn.textContent = "♻️ Restore";
    restoreBtn.classList.add("restore-btn");
    restoreBtn.addEventListener("click", () => {
      tasks.push(task);
      bin.splice(index, 1);
      addHistory(`Restored task "${task.text}"`);
      saveData();
      renderTasks();
      renderBin();
    });

    li.appendChild(restoreBtn);
    recycleBin.appendChild(li);
  });
}

// Filters
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.getAttribute("data-filter");
    renderTasks();
  });
});

// Toggle History & Bin
document.getElementById("toggleHistory").addEventListener("click", () => {
  historyList.style.display = historyList.style.display === "none" ? "block" : "none";
});
document.getElementById("toggleBin").addEventListener("click", () => {
  recycleBin.style.display = recycleBin.style.display === "none" ? "block" : "none";
});

// Clear buttons
document.getElementById("clearHistory").addEventListener("click", () => {
  history = [];
  saveData();
  renderHistory();
});
document.getElementById("clearBin").addEventListener("click", () => {
  bin = [];
  saveData();
  renderBin();
});

// Celebration effect 🎉
function showCelebration() {
  const msg = document.getElementById("congratsMessage");
  msg.textContent = "🎉 Congratulations! You completed a task!";
  msg.style.display = "block";
  setTimeout(() => { msg.style.display = "none"; }, 3000);

  // Balloons
  const balloonContainer = document.getElementById("balloonContainer");
  for (let i = 0; i < 10; i++) {
    const balloon = document.createElement("div");
    balloon.classList.add("balloon");
    balloon.style.left = Math.random() * 100 + "vw";
    balloon.style.background = randomColor();
    balloon.style.animationDuration = (3 + Math.random() * 2) + "s";
    balloonContainer.appendChild(balloon);
    setTimeout(() => balloon.remove(), 5000);
  }

  // Sound
  const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3");
  audio.play();
}
function randomColor() {
  const colors = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#e67e22"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ⏰ Deadline Checker
setInterval(() => {
  const now = new Date().getTime();
  tasks.forEach(task => {
    if (task.deadline && task.status !== "completed") {
      const deadlineTime = new Date(task.deadline).getTime();
      const diff = deadlineTime - now;
      if (diff > 0 && diff < 10 * 60 * 1000) { // less than 10 mins
        showReminder(task.text);
      }
    }
  });
}, 60000); // check every 1 minute

function showReminder(taskName) {
  const msg = document.getElementById("reminderMessage");
  msg.textContent = `⏰ Your time is about to lapse for the task: "${taskName}". Please do it!`;
  msg.style.display = "block";
  setTimeout(() => { msg.style.display = "none"; }, 5000);

  // Sound
  const audio = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
  audio.play();
}

// Initial render
renderTasks();
renderHistory();
renderBin();
