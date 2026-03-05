// LIFE OS — UI COMPONENTS v3
// Builds DOM elements. No API calls, no business logic.

const UI = {

  createAssistantMessage(text) {
    const div = document.createElement("div");
    div.className = "message message-assistant";
    div.textContent = text;
    return div;
  },

  createUserMessage(text) {
    const div = document.createElement("div");
    div.className = "message message-user";
    div.textContent = text;
    return div;
  },

  createTypingIndicator() {
    const div = document.createElement("div");
    div.className = "typing-indicator active";
    div.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>`;
    return div;
  },

  showTyping() {
    document.querySelectorAll(".typing-indicator").forEach(el => el.classList.add("active"));
  },

  hideTyping() {
    document.querySelectorAll(".typing-indicator").forEach(el => el.remove());
  },

  updateProgress(label) {
    const container = document.getElementById("progress-container");
    const labelEl   = document.getElementById("progress-label");
    const fill      = document.getElementById("progress-fill");

    if (container) container.style.display = "";
    if (labelEl && label) labelEl.textContent = label;

    if (fill && label) {
      const domainMatch = label.match(/(\d+) of 7/);
      if (domainMatch) {
        const idx = parseInt(domainMatch[1]);
        const pct = Math.round(((idx - 1) / 7) * 80) + 10;
        fill.style.width = pct + "%";
      } else if (label.includes("Brain")) {
        fill.style.width = "90%";
      } else if (label.includes("Map")) {
        fill.style.width = "100%";
      }
    }
  },

  setInputMode(mode) {
    const inputArea = document.getElementById("input-area");
    const input     = document.getElementById("user-input");
    const sendBtn   = document.getElementById("send-btn");

    if (!inputArea) return;

    if (mode === "none") {
      inputArea.style.display = "none";
      return;
    }

    inputArea.style.display = "";
    if (input)   { input.disabled = false; input.placeholder = "Type your answer..."; input.focus(); }
    if (sendBtn) sendBtn.disabled = false;
  },

  disableInput() {
    const input   = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    if (input)   input.disabled   = true;
    if (sendBtn) sendBtn.disabled = true;
  },

  enableInput() {
    const input   = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    if (input)   input.disabled   = false;
    if (sendBtn) sendBtn.disabled = false;
  },

  clearInput() {
    const input = document.getElementById("user-input");
    if (input) { input.value = ""; input.style.height = "auto"; }
  },

  scrollToMessage(el) {
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  },

  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  },

  hideWelcome() {
    const w = document.getElementById("welcome-screen");
    if (w) w.style.display = "none";
  },

  showChat() {
    const c = document.getElementById("chat-area");
    if (c) c.style.display = "flex";
  }
};

window.UI = UI;
