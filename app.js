// LIFE OS — APP LOGIC v3
// Session management, API communication, event handling.
// Seven domains: Path, Spark, Body, Finances, Relationships, Inner Game, Outer Game

const App = {
  session: null,
  isWaiting: false,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    let currentSlide = 0;
    const totalSlides = 3;
    const track = document.getElementById("carousel-track");
    const arrow = document.getElementById("carousel-arrow");
    const dots  = document.querySelectorAll(".carousel-dot");

    const advanceCarousel = () => {
      currentSlide++;
      track.style.transform = `translateX(-${currentSlide * 33.333}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));

      if (currentSlide === totalSlides - 1) {
        arrow.outerHTML = `<button class="carousel-begin" id="carousel-arrow">Begin your map</button>`;
        document.getElementById("carousel-arrow").addEventListener("click", () => this.startConversation());
      }
    };

    if (arrow) arrow.addEventListener("click", advanceCarousel);

    const sendBtn = document.getElementById("send-btn");
    const input   = document.getElementById("user-input");

    if (sendBtn) sendBtn.addEventListener("click", () => this.sendUserInput());

    if (input) {
      input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 120) + "px";
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendUserInput();
        }
      });
    }
  },

  async startConversation() {
    UI.hideWelcome();
    UI.showChat();

    const chatContainer = document.getElementById("chat-container");
    const typingEl = UI.createTypingIndicator();
    chatContainer.appendChild(typingEl);
    UI.scrollToBottom();

    try {
      const data = await this.callAPI([]);
      UI.hideTyping();
      this.handleAPIResponse(data);
    } catch (err) {
      UI.hideTyping();
      this.addAssistantMessage("Something went wrong. Please refresh and try again.");
    }
  },

  sendUserInput() {
    if (this.isWaiting) return;
    const input = document.getElementById("user-input");
    const text  = input ? input.value.trim() : "";
    if (!text) return;
    this.sendMessage(text);
  },

  sendMessage(text, suppressBubble = false) {
    if (this.isWaiting) return;
    this.isWaiting = true;

    UI.clearInput();
    UI.disableInput();

    const chatContainer = document.getElementById("chat-container");

    if (!suppressBubble) {
      const userBubble = UI.createUserMessage(text);
      chatContainer.appendChild(userBubble);
      UI.scrollToMessage(userBubble);
    }

    const typingEl = UI.createTypingIndicator();
    chatContainer.appendChild(typingEl);
    UI.showTyping();

    const messages = [{ role: "user", content: text }];

    this.callAPI(messages)
      .then(data => {
        UI.hideTyping();
        this.handleAPIResponse(data);
        this.isWaiting = false;
      })
      .catch(() => {
        UI.hideTyping();
        this.addAssistantMessage("Something went wrong. Please try again.");
        UI.enableInput();
        this.isWaiting = false;
      });
  },

  async callAPI(messages) {
    const body = { messages, session: this.session };
    const response = await fetch("/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  handleAPIResponse(data) {
    if (data.session) this.session = data.session;

    const chatContainer = document.getElementById("chat-container");

    if (data.phaseLabel) {
      UI.updateProgress(data.phaseLabel);
    }

    // Final map — special rendering
    if (data.complete && data.mapData) {
      const mapEl = this.renderFinalMap(data.mapData, data.session);
      chatContainer.appendChild(mapEl);
      setTimeout(() => mapEl.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      UI.setInputMode("none");
      return;
    }

    // Regular message
    if (data.message) {
      const msgEl = UI.createAssistantMessage(data.message);
      chatContainer.appendChild(msgEl);
      setTimeout(() => msgEl.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }

    UI.setInputMode(data.complete ? "none" : (data.inputMode || "text"));
  },

  renderFinalMap(mapData, session) {
    const wrapper = document.createElement("div");
    wrapper.className = "message message-profile";

    const domainOrder = ["path", "spark", "body", "finances", "relationships", "inner_game", "outer_game"];

    const domainLabels = {
      path:          "Path",
      spark:         "Spark",
      body:          "Body",
      finances:      "Finances",
      relationships: "Relationships",
      inner_game:    "Inner Game",
      outer_game:    "Outer Game"
    };

    const domainQuestions = {
      path:          "Am I on my path — and actually moving?",
      spark:         "Is the fire on?",
      body:          "How is this living system doing?",
      finances:      "Do I have the agency to act on what matters?",
      relationships: "Am I truly known by anyone?",
      inner_game:    "Are my stories tending me, or running me?",
      outer_game:    "Is what I'm broadcasting aligned with who I actually am?"
    };

    const domainFractals = {
      path:          "Vision",
      spark:         "Human Being",
      body:          "Nature",
      finances:      "Finance & Economy",
      relationships: "Society",
      inner_game:    "Legacy",
      outer_game:    "Society"
    };

    const domainData  = session?.domainData || {};
    const focusDomains = mapData.focus_domains || [];

    const scoreRows = domainOrder.map(id => {
      const data = domainData[id];
      if (!data) return "";
      const isFocus  = focusDomains.includes(id);
      const score    = data.score || 0;
      const barWidth = (score / 10) * 100;
      const barColor = score <= 3 ? "#e05c5c" : score <= 6 ? "#E89842" : "#5cb85c";
      return `
        <div class="map-domain-row ${isFocus ? "map-domain-focus" : ""}">
          <div class="map-domain-info">
            <div class="map-domain-name">${isFocus ? "▸ " : ""}${domainLabels[id]}</div>
            <div class="map-domain-thesis">${domainQuestions[id]}</div>
          </div>
          <div class="map-domain-bar-wrap">
            <div class="map-domain-bar" style="width:${barWidth}%;background:${barColor};"></div>
          </div>
          <div class="map-domain-right">
            <div class="map-domain-score">${score}/10</div>
            <div class="map-domain-fractal">${domainFractals[id]}</div>
          </div>
          ${isFocus ? '<div class="map-focus-tag">focus</div>' : ""}
        </div>`;
    }).join("");

    wrapper.innerHTML = `
      <div class="profile-card">
        <div class="profile-hero">
          <div class="profile-card-heading">Your Life OS Map</div>
          <div class="map-stage-badge">${mapData.stage}</div>
          <div class="map-stage-desc">${mapData.stage_description}</div>
        </div>

        <div class="profile-section">
          <div class="profile-section-label">Your Seven Domains</div>
          <div class="map-domains">${scoreRows}</div>
        </div>

        <div class="profile-section">
          <div class="profile-section-label">What The Pattern Shows</div>
          <p>${mapData.overall_reflection.replace(/\n\n/g, "</p><p>")}</p>
        </div>

        <div class="profile-section">
          <div class="profile-section-label">Your Three Focus Domains</div>
          <p>${focusDomains.map(id => domainLabels[id] || id).join("  ·  ")}</p>
          <p style="margin-top:10px;color:#8fa8be;font-size:0.92rem;">${mapData.focus_reasoning}</p>
        </div>

        ${mapData.brain_insight ? `
        <div class="profile-section">
          <div class="profile-section-label">What To Learn</div>
          <p style="color:#c8d8e8;font-size:0.92rem;">${mapData.brain_insight}</p>
        </div>` : ""}

        <div class="profile-closing">
          ${mapData.next_step}
        </div>
      </div>`;

    return wrapper;
  },

  addAssistantMessage(text) {
    const chatContainer = document.getElementById("chat-container");
    const el = UI.createAssistantMessage(text);
    chatContainer.appendChild(el);
    UI.scrollToMessage(el);
    UI.enableInput();
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());
window.App = App;
