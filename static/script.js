// Select elements
const sendBtn = document.getElementById("send-btn");
const inputField = document.getElementById("message-input");
const chatBox = document.getElementById("chat-messages");

// Send message when button clicked
sendBtn.addEventListener("click", sendMessage);

// Send message when pressing Enter
inputField.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const messageText = inputField.value.trim();

  if (messageText === "") return;

  // Create message element
  const message = document.createElement("div");
  message.classList.add("message", "sent");
  message.innerHTML = `
    <p>${messageText}</p>
    <span class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
  `;

  // Append to chat
  chatBox.appendChild(message);

  // Auto scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  // Clear input
  inputField.value = "";
}
