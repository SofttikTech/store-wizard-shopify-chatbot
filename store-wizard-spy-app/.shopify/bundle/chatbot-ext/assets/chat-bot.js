document.addEventListener("DOMContentLoaded", () => {
    // Toggle ChatBot visibility
    const toggleButton = document.getElementById("chat-toggle");
    const chatContainer = document.querySelector(".chat-bot-container");
  
    toggleButton.addEventListener("click", () => {
      // Toggling visibility with display styles
      if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
        chatContainer.style.display = "block";  // Show the chat
      } else {
        chatContainer.style.display = "none";  // Hide the chat
      }
    });
    
    // ChatBot functionality
    const chatBox = document.querySelector(".chat-box");
    const messageInput = document.querySelector("#chat-message");
    const sendButton = document.querySelector("#send-button");
  
    const appendMessage = (user, text) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.innerHTML = `<strong>${user}:</strong> <span>${text}</span>`;
      chatBox.appendChild(messageDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    };
  
    const handleSend = async () => {
      const message = messageInput.value.trim();
      if (!message) return;
  
      appendMessage("You", message);
      messageInput.value = "";
  
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipResponse.json();
        const response = await fetch(
          "https://n8n.softtik.com/webhook/755917b9-0121-4543-96f8-cce968ab9e7a/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatInput: message, userIp: ip }),
          }
        );
  
        const data = await response.json();
        const botResponse = data.output || "Bot: I'm not sure how to respond to that.";
        appendMessage("Bot", botResponse);
      } catch (error) {
        console.error("Error fetching response from n8n webhook:", error);
        appendMessage("Bot", "An error occurred. Please try again later.");
      }
    };
  
    sendButton.addEventListener("click", handleSend);
  
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    });
  });
  