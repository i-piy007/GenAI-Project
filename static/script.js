// Elements
const sendBtn = document.getElementById("send-btn");
const inputField = document.getElementById("message-input");
const chatBox = document.getElementById("chat-messages");
const themeToggle = document.getElementById("theme-toggle");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");

// Send message on click
sendBtn.addEventListener("click", sendMessage);

// Send message on Enter
inputField.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const messageText = inputField.value.trim();

  if (messageText === "") return;

  // Create message
  const message = document.createElement("div");
  message.classList.add("message", "sent");
  message.innerHTML = `
    <p>${messageText}</p>
    <span class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
  `;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  inputField.value = "";
}

// Toggle Settings Panel
settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent click from bubbling to document
  settingsPanel.classList.toggle("active");
});

// Close settings panel when clicking outside
document.addEventListener("click", (e) => {
  if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
    settingsPanel.classList.remove("active");
  }
});

// Theme Toggle
const themeToggleBtn = document.getElementById("theme-toggle");
themeToggleBtn.addEventListener("click", () => {
  const body = document.body;
  const isLightTheme = body.classList.toggle("light-theme");
  themeToggleBtn.textContent = isLightTheme ? "Switch to Dark" : "Switch to Light";
  
  // Save theme preference
  localStorage.setItem("theme", isLightTheme ? "light" : "dark");
});

// Load saved theme preference
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeToggleBtn.textContent = "Switch to Dark";
  }
});
