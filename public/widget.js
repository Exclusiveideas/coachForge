(function () {
  "use strict";

  // Inject styles once
  if (!document.getElementById("cf-widget-styles")) {
    var style = document.createElement("style");
    style.id = "cf-widget-styles";
    style.textContent = [
      ".cf-widget *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
      ".cf-btn{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:16px;background:#E8853D;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 24px rgba(0,0,0,.2);z-index:99998;transition:transform .2s}",
      ".cf-btn:hover{transform:scale(1.08)}",
      ".cf-modal{position:fixed;bottom:96px;right:24px;width:400px;height:600px;background:#1a1a1a;border-radius:20px;border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 40px rgba(0,0,0,.4);z-index:99999;display:none;flex-direction:column;overflow:hidden}",
      ".cf-modal.open{display:flex}",
      "@media(max-width:480px){.cf-modal{bottom:0;right:0;width:100%;height:100%;border-radius:0}}",
      ".cf-header{padding:16px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:12px}",
      ".cf-avatar{width:40px;height:40px;background:rgba(232,133,61,.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px}",
      ".cf-header-info{flex:1}",
      ".cf-header-name{color:#fff;font-size:14px;font-weight:600}",
      ".cf-header-sub{color:rgba(255,255,255,.5);font-size:12px}",
      ".cf-status{width:10px;height:10px;background:#22c55e;border-radius:50%}",
      ".cf-close{background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:18px;padding:4px}",
      ".cf-close:hover{color:#fff}",
      ".cf-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}",
      ".cf-msg{max-width:80%;padding:10px 16px;border-radius:16px;font-size:14px;line-height:1.5;word-wrap:break-word}",
      ".cf-msg.assistant{background:rgba(255,255,255,.1);color:rgba(255,255,255,.9);align-self:flex-start;border-bottom-left-radius:4px}",
      ".cf-msg.user{background:#E8853D;color:#fff;align-self:flex-end;border-bottom-right-radius:4px;white-space:pre-wrap}",
      ".cf-thinking{display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:16px;background:rgba(255,255,255,.1);align-self:flex-start;border-bottom-left-radius:4px}",
      ".cf-thinking-text{color:rgba(255,255,255,.6);font-size:14px;font-style:italic}",
      ".cf-thinking-dots{display:flex;gap:3px;align-items:center}",
      ".cf-thinking-dot{width:6px;height:6px;background:rgba(232,133,61,.7);border-radius:50%;animation:cf-ripple 1.2s ease-in-out infinite}",
      ".cf-thinking-dot:nth-child(2){animation-delay:200ms}",
      ".cf-thinking-dot:nth-child(3){animation-delay:400ms}",
      "@keyframes cf-ripple{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.4);opacity:1}}",
      ".cf-msg.assistant .cf-md-h1{font-size:16px;font-weight:700;margin:8px 0 4px;line-height:1.3}",
      ".cf-msg.assistant .cf-md-h1:first-child{margin-top:0}",
      ".cf-msg.assistant .cf-md-h2{font-size:15px;font-weight:700;margin:6px 0 3px;line-height:1.3}",
      ".cf-msg.assistant .cf-md-h2:first-child{margin-top:0}",
      ".cf-msg.assistant .cf-md-h3{font-size:14px;font-weight:700;margin:4px 0 2px;line-height:1.3}",
      ".cf-msg.assistant .cf-md-h3:first-child{margin-top:0}",
      ".cf-msg.assistant .cf-md-p{margin:0 0 8px}",
      ".cf-msg.assistant .cf-md-p:last-child{margin-bottom:0}",
      ".cf-msg.assistant strong{font-weight:600}",
      ".cf-msg.assistant em{font-style:italic}",
      ".cf-msg.assistant .cf-md-ul,.cf-msg.assistant .cf-md-ol{margin:0 0 8px;padding-left:20px;list-style-position:outside}",
      ".cf-msg.assistant .cf-md-ul:last-child,.cf-msg.assistant .cf-md-ol:last-child{margin-bottom:0}",
      ".cf-msg.assistant .cf-md-ul{list-style-type:disc}",
      ".cf-msg.assistant .cf-md-ol{list-style-type:decimal}",
      ".cf-msg.assistant .cf-md-li,.cf-msg.assistant .cf-md-oli{line-height:1.5;margin:2px 0}",
      ".cf-msg.assistant .cf-md-bq{border-left:2px solid rgba(232,133,61,.5);padding-left:12px;margin:8px 0;color:rgba(255,255,255,.7);font-style:italic}",
      ".cf-msg.assistant .cf-md-code{background:rgba(255,255,255,.1);border-radius:4px;padding:1px 6px;font-size:12px;font-family:monospace}",
      ".cf-msg.assistant .cf-md-pre{margin:8px 0;background:rgba(0,0,0,.3);border-radius:8px;padding:12px;overflow-x:auto}",
      ".cf-msg.assistant .cf-md-pre:last-child{margin-bottom:0}",
      ".cf-msg.assistant .cf-md-codeblock{font-size:12px;font-family:monospace;white-space:pre;display:block}",
      ".cf-msg.assistant .cf-md-a{color:#E8853D;text-decoration:underline;text-underline-offset:2px}",
      ".cf-msg.assistant .cf-md-a:hover{color:#D4742F}",
      ".cf-msg.assistant .cf-md-hr{border:none;border-top:1px solid rgba(255,255,255,.1);margin:12px 0}",
      ".cf-input-area{padding:12px;border-top:1px solid rgba(255,255,255,.1);display:flex;gap:8px}",
      ".cf-input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 16px;color:#fff;font-size:14px;outline:none}",
      ".cf-input::placeholder{color:rgba(255,255,255,.3)}",
      ".cf-input:focus{border-color:rgba(232,133,61,.5)}",
      ".cf-send{width:40px;height:40px;background:#E8853D;border:none;border-radius:12px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:background .2s}",
      ".cf-send:hover{background:#D4742F}",
      ".cf-send:disabled{opacity:.5;cursor:default}",
      ".cf-footer{text-align:center;padding:8px;color:rgba(255,255,255,.2);font-size:11px}",
      ".cf-footer a{color:rgba(255,255,255,.3);text-decoration:none}",
      ".cf-footer-actions{display:flex;justify-content:center;gap:12px;padding:4px 12px 8px}",
      ".cf-footer-btn{background:none;border:none;color:rgba(255,255,255,.3);font-size:11px;cursor:pointer;padding:2px 4px}",
      ".cf-footer-btn:hover{color:rgba(255,255,255,.6)}",
      ".cf-widget-inline{display:flex;width:100%}",
      ".cf-widget-inline.cf-align-center{justify-content:center}",
      ".cf-widget-inline.cf-align-left{justify-content:flex-start}",
      ".cf-widget-inline.cf-align-right{justify-content:flex-end}",
      ".cf-widget-inline .cf-modal{position:static;display:flex;bottom:auto;right:auto;z-index:auto}",
      "@media(max-width:480px){.cf-widget-inline .cf-modal{width:100%;height:600px;border-radius:20px}}",
      ".cf-feedback{flex:1;padding:16px;display:flex;flex-direction:column;gap:12px}",
      ".cf-feedback label{color:rgba(255,255,255,.7);font-size:13px;font-weight:500}",
      ".cf-feedback input,.cf-feedback textarea{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;color:#fff;font-size:14px;outline:none;width:100%;font-family:inherit}",
      ".cf-feedback textarea{flex:1;resize:none;min-height:100px}",
      ".cf-feedback input:focus,.cf-feedback textarea:focus{border-color:rgba(232,133,61,.5)}",
      ".cf-fb-actions{display:flex;gap:8px}",
      ".cf-fb-submit{flex:1;padding:10px;background:#E8853D;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer}",
      ".cf-fb-submit:hover{background:#D4742F}",
      ".cf-fb-cancel{padding:10px 16px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);border:none;border-radius:8px;font-size:14px;cursor:pointer}",
      ".cf-fb-cancel:hover{background:rgba(255,255,255,.15)}",
    ].join("\n");
    document.head.appendChild(style);
  }

  var THINKING_TEXTS = [
    "Pondering your question",
    "Crafting a thoughtful response",
    "Digging into my knowledge base",
    "Connecting the dots",
    "Thinking this through",
    "Analyzing your question",
    "Putting thoughts together",
    "Reflecting on this",
    "Considering the best approach",
    "Gathering my thoughts",
    "Processing your message",
    "Working through this",
    "Formulating a response",
    "Let me think about that",
    "Exploring possibilities",
    "Weighing different angles",
    "Synthesizing an answer",
    "Mulling this over",
    "Assembling my thoughts",
    "Brewing up a response",
  ];

  function esc(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderMarkdown(text) {
    var html = esc(text);
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre class="cf-md-pre"><code class="cf-md-codeblock">' + code.trim() + "</code></pre>";
    });
    html = html.replace(/`([^`]+)`/g, '<code class="cf-md-code">$1</code>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="cf-md-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="cf-md-h2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="cf-md-h1">$1</h1>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="cf-md-bq">$1</blockquote>');
    html = html.replace(/^---$/gm, '<hr class="cf-md-hr">');
    html = html.replace(/^[-*] (.+)$/gm, '<li class="cf-md-li">$1</li>');
    html = html.replace(/((?:<li class="cf-md-li">.*<\/li>\n?)+)/g, '<ul class="cf-md-ul">$1</ul>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="cf-md-oli">$1</li>');
    html = html.replace(/((?:<li class="cf-md-oli">.*<\/li>\n?)+)/g, '<ol class="cf-md-ol">$1</ol>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="cf-md-a" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^(?!<[houblpra])((?!<).+)$/gm, '<p class="cf-md-p">$1</p>');
    html = html.replace(/\n{2,}/g, "");
    html = html.replace(/\n/g, "");
    return html;
  }

  // Initialize a single widget instance
  function initWidget(el) {
    var coachId = el.getAttribute("data-coach-id") || el.getAttribute("data-cf-coach-id");
    if (!coachId) return;

    var mode = el.getAttribute("data-mode") || "floating";
    var isInline = mode === "inline";
    var align = el.getAttribute("data-align") || "center";
    var targetSelector = el.getAttribute("data-container");

    // Determine API base from the script src, or fall back to current origin
    var srcAttr = el.getAttribute("src") || "";
    var apiBase = srcAttr
      ? srcAttr.replace(/\/widget\.js.*$/, "")
      : window.location.origin;

    var SESSION_KEY = "cf_session_" + coachId;
    var HISTORY_KEY = "cf_history_" + coachId;
    var SESSION_EXPIRY = 24 * 60 * 60 * 1000;

    var coach = null;
    var messages = [];
    var sessionId = "";
    var isOpen = isInline;
    var isStreaming = false;
    var currentView = "chat";
    var currentThinkingText = "";

    function getSession() {
      try {
        var stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
          var data = JSON.parse(stored);
          if (Date.now() - data.createdAt < SESSION_EXPIRY) return data;
        }
      } catch (e) {}
      var newSession = {
        id: "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return newSession;
    }

    function loadHistory() {
      try {
        var stored = localStorage.getItem(HISTORY_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return [];
    }

    function saveHistory() {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-50)));
      } catch (e) {}
    }

    function pickThinkingText() {
      currentThinkingText = THINKING_TEXTS[Math.floor(Math.random() * THINKING_TEXTS.length)];
    }

    // Build DOM
    var container = document.createElement("div");
    var btn = null;
    var modal = document.createElement("div");
    modal.className = "cf-modal";

    if (isInline) {
      container.className = "cf-widget cf-widget-inline cf-align-" + align;
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (target) {
        target.appendChild(container);
      } else if (el.parentNode && el.tagName === "SCRIPT") {
        el.parentNode.insertBefore(container, el);
      } else if (el.tagName !== "SCRIPT") {
        // el is a container div itself — render inside it
        el.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
      container.appendChild(modal);
    } else {
      container.className = "cf-widget";
      document.body.appendChild(container);
      btn = document.createElement("button");
      btn.className = "cf-btn";
      btn.title = "Chat with coach";
      container.appendChild(btn);
      container.appendChild(modal);
    }

    function render() {
      if (btn) {
        btn.textContent = isOpen ? "\u2715" : (coach ? coach.emoji : "\uD83D\uDCAC");
        btn.style.background = isOpen ? "rgba(255,255,255,.15)" : "#E8853D";
        btn.style.color = isOpen ? "#4A3728" : "";
        btn.style.fontSize = isOpen ? "20px" : "24px";
      }

      modal.className = isOpen ? "cf-modal open" : "cf-modal";
      if (!isOpen) return;

      modal.innerHTML = "";

      var header = document.createElement("div");
      header.className = "cf-header";
      header.innerHTML =
        '<div class="cf-avatar">' + (coach ? coach.emoji : "\uD83D\uDCAC") + "</div>" +
        '<div class="cf-header-info">' +
        '<div class="cf-header-name">' + esc(coach ? coach.name : "Coach") + "</div>" +
        '<div class="cf-header-sub">AI Coach \u00B7 ' + esc(coach ? coach.tone : "") + "</div>" +
        "</div>" +
        '<div class="cf-status"></div>';
      modal.appendChild(header);

      if (currentView === "feedback") {
        renderFeedbackForm();
        return;
      }

      var msgContainer = document.createElement("div");
      msgContainer.className = "cf-messages";
      for (var i = 0; i < messages.length; i++) {
        var isLastMsg = i === messages.length - 1;
        var isEmpty = !messages[i].content;

        if (isStreaming && isLastMsg && messages[i].role === "assistant" && isEmpty) {
          var thinking = document.createElement("div");
          thinking.className = "cf-thinking";
          thinking.innerHTML =
            '<span class="cf-thinking-text">' + esc(currentThinkingText) + '</span>' +
            '<span class="cf-thinking-dots">' +
            '<span class="cf-thinking-dot"></span>' +
            '<span class="cf-thinking-dot"></span>' +
            '<span class="cf-thinking-dot"></span>' +
            '</span>';
          msgContainer.appendChild(thinking);
          continue;
        }

        var msg = document.createElement("div");
        msg.className = "cf-msg " + messages[i].role;
        if (messages[i].role === "assistant") {
          msg.innerHTML = renderMarkdown(messages[i].content);
        } else {
          msg.textContent = messages[i].content;
        }
        msgContainer.appendChild(msg);
      }
      modal.appendChild(msgContainer);
      requestAnimationFrame(function () {
        msgContainer.scrollTop = msgContainer.scrollHeight;
      });

      var inputArea = document.createElement("div");
      inputArea.className = "cf-input-area";
      var input = document.createElement("input");
      input.className = "cf-input";
      input.placeholder = "Ask me anything...";
      input.disabled = isStreaming;
      var sendBtn = document.createElement("button");
      sendBtn.className = "cf-send";
      sendBtn.innerHTML = "\u2192";
      sendBtn.disabled = isStreaming;
      inputArea.appendChild(input);
      inputArea.appendChild(sendBtn);
      modal.appendChild(inputArea);

      function doSend() {
        var text = input.value.trim();
        if (!text || isStreaming) return;
        input.value = "";
        sendMessage(text);
      }
      sendBtn.onclick = doSend;
      input.onkeydown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          doSend();
        }
      };
      input.focus();

      var footerActions = document.createElement("div");
      footerActions.className = "cf-footer-actions";
      var fbBtn = document.createElement("button");
      fbBtn.className = "cf-footer-btn";
      fbBtn.textContent = "Send Feedback";
      fbBtn.onclick = function () {
        currentView = "feedback";
        render();
      };
      footerActions.appendChild(fbBtn);
      modal.appendChild(footerActions);

      var footer = document.createElement("div");
      footer.className = "cf-footer";
      footer.innerHTML = "Powered by <strong>CoachForge</strong>";
      modal.appendChild(footer);
    }

    function renderFeedbackForm() {
      var form = document.createElement("div");
      form.className = "cf-feedback";

      var subjectLabel = document.createElement("label");
      subjectLabel.textContent = "Subject";
      form.appendChild(subjectLabel);
      var subjectInput = document.createElement("input");
      subjectInput.type = "text";
      subjectInput.placeholder = "e.g. Great experience!";
      form.appendChild(subjectInput);

      var contentLabel = document.createElement("label");
      contentLabel.textContent = "Your feedback";
      form.appendChild(contentLabel);
      var contentInput = document.createElement("textarea");
      contentInput.placeholder = "Tell us what you think...";
      form.appendChild(contentInput);

      var actions = document.createElement("div");
      actions.className = "cf-fb-actions";

      var cancelBtn = document.createElement("button");
      cancelBtn.className = "cf-fb-cancel";
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = function () {
        currentView = "chat";
        render();
      };

      var submitBtn = document.createElement("button");
      submitBtn.className = "cf-fb-submit";
      submitBtn.textContent = "Submit Feedback";
      submitBtn.onclick = function () {
        var subject = subjectInput.value.trim();
        var content = contentInput.value.trim();
        if (!subject || !content) return;

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        fetch(apiBase + "/api/public/chat/" + coachId + "/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId,
            subject: subject,
            content: content,
          }),
        })
          .then(function (res) {
            if (res.ok) {
              currentView = "chat";
              messages.push({
                role: "assistant",
                content: "Thanks for your feedback! \uD83D\uDE4F",
              });
              saveHistory();
              render();
            } else {
              submitBtn.textContent = "Failed. Try again.";
              submitBtn.disabled = false;
            }
          })
          .catch(function () {
            submitBtn.textContent = "Failed. Try again.";
            submitBtn.disabled = false;
          });
      };

      actions.appendChild(cancelBtn);
      actions.appendChild(submitBtn);
      form.appendChild(actions);
      modal.appendChild(form);

      var footer = document.createElement("div");
      footer.className = "cf-footer";
      footer.innerHTML = "Powered by <strong>CoachForge</strong>";
      modal.appendChild(footer);
    }

    function sendMessage(text) {
      messages.push({ role: "user", content: text });
      messages.push({ role: "assistant", content: "" });
      isStreaming = true;
      pickThinkingText();
      render();

      var history = messages.slice(0, -2).map(function (m) {
        return { role: m.role, content: m.content };
      });

      fetch(apiBase + "/api/public/chat/" + coachId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          conversationHistory: history.slice(-10),
        }),
      })
        .then(function (res) {
          if (!res.ok || !res.body) throw new Error("Request failed");
          var reader = res.body.getReader();
          var decoder = new TextDecoder();

          function read() {
            reader.read().then(function (result) {
              if (result.done) {
                isStreaming = false;
                saveHistory();
                render();
                return;
              }

              var chunk = decoder.decode(result.value);
              var lines = chunk.split("\n");

              for (var i = 0; i < lines.length; i++) {
                if (lines[i].indexOf("data: ") === 0) {
                  try {
                    var data = JSON.parse(lines[i].slice(6));
                    if (data.type === "content") {
                      messages[messages.length - 1].content += data.content;
                      render();
                    }
                  } catch (e) {}
                }
              }

              read();
            });
          }
          read();
        })
        .catch(function () {
          messages[messages.length - 1].content = "Sorry, something went wrong. Please try again.";
          isStreaming = false;
          saveHistory();
          render();
        });
    }

    if (btn) {
      btn.onclick = function () {
        isOpen = !isOpen;
        currentView = "chat";
        render();
      };
    }

    var session = getSession();
    sessionId = session.id;
    messages = loadHistory();

    fetch(apiBase + "/api/public/chat/" + coachId)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.coach) {
          coach = data.coach;
          if (btn) btn.textContent = coach.emoji;
          if (messages.length === 0) {
            messages.push({ role: "assistant", content: coach.welcomeMessage });
            saveHistory();
          }
          render();
        }
      })
      .catch(function (err) {
        console.error("CoachForge: Failed to load coach config", err);
      });
  }

  // Initialize all uninitialized widget script tags
  var scripts = document.querySelectorAll('script[data-coach-id][src*="widget.js"]');
  for (var i = 0; i < scripts.length; i++) {
    if (!scripts[i].__cfInit) {
      scripts[i].__cfInit = true;
      initWidget(scripts[i]);
    }
  }

  // Also support container divs for frameworks (Next.js, React) that inject scripts dynamically
  var containers = document.querySelectorAll("[data-cf-coach-id]:not([data-cf-init])");
  for (var j = 0; j < containers.length; j++) {
    containers[j].setAttribute("data-cf-init", "true");
    initWidget(containers[j]);
  }
})();
