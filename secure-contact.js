/* ============================================
   نظام التواصل الآمن والمشفر
   ============================================ */

// ============ نظام التشفير البسيط ============
class SecureMessaging {
  // تشفير بسيط: Base64 + ROT13
  static encrypt(text) {
    // تطبيق ROT13
    const rot13 = (str) =>
      str.replace(/[a-zA-Z]/g, (c) =>
        String.fromCharCode(
          (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
        )
      );
    // تطبيق Base64
    return btoa(rot13(text));
  }

  // فك التشفير
  static decrypt(text) {
    // فك Base64 أولاً
    const rot13 = (str) =>
      str.replace(/[a-zA-Z]/g, (c) =>
        String.fromCharCode(
          (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
        )
      );
    try {
      return rot13(atob(text));
    } catch (e) {
      return text;
    }
  }
}

// ============ تخزين الرسائل ============
class MessageStorage {
  static STORAGE_KEY = "akram6_messages";
  static MAX_MESSAGES = 500;

  // حفظ رسالة
  static saveMessage(message) {
    const messages = this.getAllMessages();

    // إضافة timestamp
    message.timestamp = new Date().toISOString();
    message.id = Date.now();

    // تشفير الرسالة السرية
    if (message.type === "secure") {
      message.content = SecureMessaging.encrypt(message.content);
      message.encrypted = true;
    }

    messages.push(message);

    // إزالة الرسائل القديمة إذا تجاوز الحد
    if (messages.length > this.MAX_MESSAGES) {
      messages.shift();
    }

    // حفظ في localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
      return true;
    } catch (e) {
      console.error("خطأ في حفظ الرسالة:", e);
      return false;
    }
  }

  // الحصول على جميع الرسائل
  static getAllMessages() {
    try {
      const messages = localStorage.getItem(this.STORAGE_KEY);
      return messages ? JSON.parse(messages) : [];
    } catch (e) {
      console.error("خطأ في قراءة الرسائل:", e);
      return [];
    }
  }

  // حذف رسالة معينة
  static deleteMessage(id) {
    const messages = this.getAllMessages();
    const filtered = messages.filter((msg) => msg.id !== id);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      return false;
    }
  }

  // حذف جميع الرسائل
  static deleteAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // تصفية الرسائل
  static filterMessages(type) {
    const messages = this.getAllMessages();
    if (type === "all") return messages;
    return messages.filter((msg) => msg.type === type);
  }

  // إزالة الرسائل المحتضرة (30 دقيقة)
  static cleanExpiredMessages() {
    const messages = this.getAllMessages();
    const now = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    const filtered = messages.filter((msg) => {
      if (msg.selfDestruct) {
        const msgTime = new Date(msg.timestamp).getTime();
        return now - msgTime < thirtyMinutes;
      }
      return true;
    });

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error("خطأ في تنظيف الرسائل:", e);
    }
  }
}

// ============ معالجات النموذج ============

// معالجة التواصل العام
function handleGeneralContact(event) {
  event.preventDefault();

  const form = event.target;
  const name = form.querySelector('input[name="name"]').value;
  const email = form.querySelector('input[name="email"]').value;
  const subject = form.querySelector('input[name="subject"]').value;
  const message = form.querySelector('textarea[name="message"]').value;

  const messageObj = {
    type: "general",
    name: name,
    email: email,
    subject: subject,
    content: message,
    encrypted: false,
  };

  if (MessageStorage.saveMessage(messageObj)) {
    showNotification("✅ تم حفظ الرسالة بنجاح!", "success");
    form.reset();
    loadMessages();
  } else {
    showNotification("❌ خطأ في حفظ الرسالة", "error");
  }
}

// معالجة التواصل السري
function handleSecureContact(event) {
  event.preventDefault();

  const form = event.target;
  const passcode = form.querySelector('input[name="passcode"]').value;
  const name = form.querySelector('input[name="name"]').value;
  const email = form.querySelector('input[name="email"]').value;
  const message = form.querySelector('textarea[name="message"]').value;
  const selfDestruct = form.querySelector(
    'input[name="self-destruct"]'
  ).checked;

  const messageObj = {
    type: "secure",
    name: name,
    email: email,
    content: message,
    passcode: passcode,
    selfDestruct: selfDestruct,
    encrypted: true,
  };

  if (MessageStorage.saveMessage(messageObj)) {
    showNotification("🔐 تم حفظ الرسالة السرية بنجاح! محشفرة 100%", "success");
    form.reset();
    loadMessages();
  } else {
    showNotification("❌ خطأ في حفظ الرسالة", "error");
  }
}

// معالجة رسالة العضو
function handleMemberContact(event) {
  event.preventDefault();

  const form = event.target;
  const memberId = form.querySelector('input[name="member-id"]').value;
  const password = form.querySelector('input[name="password"]').value;
  const name = form.querySelector('input[name="name"]').value;
  const message = form.querySelector('textarea[name="message"]').value;
  const priority = form.querySelector('select[name="priority"]').value;

  // التحقق البسيط من بيانات العضو (يمكن تحسينها)
  if (memberId.length < 3 || password.length < 4) {
    showNotification("❌ بيانات العضو غير صحيحة", "error");
    return;
  }

  const messageObj = {
    type: "member",
    memberId: memberId,
    name: name,
    content: message,
    priority: priority,
    encrypted: true,
  };

  if (MessageStorage.saveMessage(messageObj)) {
    showNotification(
      `📬 تم إرسال الرسالة بأولوية ${
        priority === "critical"
          ? "حرجة 🔴"
          : priority === "urgent"
          ? "عاجلة 🟠"
          : "عادية 🟢"
      }`,
      "success"
    );
    form.reset();
    loadMessages();
  } else {
    showNotification("❌ خطأ في حفظ الرسالة", "error");
  }
}

// ============ عرض الرسائل ============

function loadMessages(filter = "all") {
  MessageStorage.cleanExpiredMessages();

  const messages = MessageStorage.filterMessages(filter);
  const messagesList = document.getElementById("messages-list");

  // تحقق من وجود العنصر قبل التعديل
  if (!messagesList) return;

  if (messages.length === 0) {
    messagesList.innerHTML =
      '<p class="empty-message">لا توجد رسائل محفوظة</p>';
    return;
  }

  messagesList.innerHTML = messages
    .reverse()
    .map((msg) => createMessageElement(msg))
    .join("");
}

function createMessageElement(msg) {
  const timestamp = new Date(msg.timestamp).toLocaleString("ar-EG");
  const typeLabel = {
    general: "عام",
    secure: "سري 🔐",
    member: "عضو 👥",
  }[msg.type];

  // فك تشفير محتوى الرسالة إذا كانت مشفرة
  let content = msg.content;
  if (msg.encrypted && msg.type !== "member") {
    content = SecureMessaging.decrypt(msg.content);
  }

  const selfDestructLabel = msg.selfDestruct
    ? '<span style="color: #ff6b6b; margin-right: 0.5rem;">⏰ محتضرة</span>'
    : "";

  return `
    <div class="message-item" data-id="${msg.id}">
      <div class="message-header">
        <span class="message-type ${msg.type}">${typeLabel}</span>
        <span class="message-time">${timestamp}</span>
      </div>
      <div class="message-sender">👤 ${msg.name || "مجهول"}</div>
      ${
        msg.subject
          ? `<div style="color: #00e0ff; margin-bottom: 0.5rem; font-size: 0.95rem;"><strong>الموضوع:</strong> ${msg.subject}</div>`
          : ""
      }
      <div class="message-content">${escapeHtml(content)}</div>
      ${selfDestructLabel}
      ${
        msg.priority
          ? `<div style="color: #ffc107; margin-top: 0.5rem;">🚨 أولوية: ${msg.priority}</div>`
          : ""
      }
      <div class="message-actions">
        <button class="message-btn" onclick="copyToClipboard('${
          msg.id
        }')">📋 نسخ</button>
        <button class="message-btn" onclick="deleteMessage('${
          msg.id
        }')">🗑️ حذف</button>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============ الأدوات والإجراءات ============

function copyToClipboard(messageId) {
  const messages = MessageStorage.getAllMessages();
  const message = messages.find((msg) => msg.id == messageId);

  if (message) {
    let content = message.content;
    if (message.encrypted && message.type !== "member") {
      content = SecureMessaging.decrypt(message.content);
    }

    navigator.clipboard.writeText(content).then(() => {
      showNotification("📋 تم النسخ!", "success");
    });
  }
}

function deleteMessage(messageId) {
  showConfirmation("حذف الرسالة", "هل تريد حذف هذه الرسالة بشكل نهائي؟", () => {
    if (MessageStorage.deleteMessage(parseInt(messageId))) {
      showNotification("🗑️ تم حذف الرسالة", "success");
      loadMessages();
    }
  });
}

function clearAllMessages() {
  showConfirmation(
    "حذف جميع الرسائل",
    "⚠️ هذا الإجراء نهائي! هل تريد حذف جميع الرسائل؟",
    () => {
      if (MessageStorage.deleteAll()) {
        showNotification("✅ تم حذف جميع الرسائل", "success");
        loadMessages();
      }
    }
  );
}

function exportMessages() {
  const messages = MessageStorage.getAllMessages();

  if (messages.length === 0) {
    showNotification("❌ لا توجد رسائل للتصدير", "error");
    return;
  }

  // تحضير البيانات للتصدير
  const exportData = messages.map((msg) => {
    let content = msg.content;
    if (msg.encrypted && msg.type !== "member") {
      content = SecureMessaging.decrypt(msg.content);
    }
    return {
      ...msg,
      content: content,
    };
  });

  // إنشاء ملف JSON
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `messages-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  showNotification("📥 تم التحميل بنجاح!", "success");
}

function showStats() {
  const messages = MessageStorage.getAllMessages();

  const stats = {
    total: messages.length,
    general: messages.filter((m) => m.type === "general").length,
    secure: messages.filter((m) => m.type === "secure").length,
    member: messages.filter((m) => m.type === "member").length,
  };

  const statsHtml = `
    <div class="stat-item">
      <div class="stat-label">إجمالي الرسائل</div>
      <div class="stat-value">${stats.total}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">رسائل عام</div>
      <div class="stat-value">${stats.general}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">رسائل سرية</div>
      <div class="stat-value">${stats.secure}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">رسائل الأعضاء</div>
      <div class="stat-value">${stats.member}</div>
    </div>
  `;

  document.getElementById("stats-content").innerHTML = statsHtml;
  openModal("stats-modal");
}

// ============ إدارة النوافذ المنبثقة ============

let confirmCallback = null;

function showConfirmation(title, message, callback) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-message").textContent = message;
  confirmCallback = callback;
  openModal("confirmation-modal");
}

function confirmAction() {
  if (confirmCallback) {
    confirmCallback();
  }
  closeModal("confirmation-modal");
}

function cancelAction() {
  confirmCallback = null;
  closeModal("confirmation-modal");
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

// إغلاق النافذ عند الضغط خارجها
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});

// ============ إشعارات (Toast) ============

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${
      type === "success"
        ? "rgba(76, 175, 80, 0.9)"
        : type === "error"
        ? "rgba(244, 67, 54, 0.9)"
        : "rgba(8, 247, 163, 0.9)"
    };
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 2000;
    animation: slideIn 0.3s ease;
    font-weight: 600;
    max-width: 300px;
    word-wrap: break-word;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// ============ تبديل الأقسام ============

document.addEventListener("DOMContentLoaded", () => {
  // تبديل بين أنواع التواصل
  const contactBtns = document.querySelectorAll(".contact-btn");
  contactBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // إزالة الـ active من جميع الأزرار
      contactBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // إخفاء جميع النماذج
      document.querySelectorAll(".contact-form-section").forEach((section) => {
        section.classList.remove("active");
      });

      // عرض النموذج المطلوب
      const type = btn.getAttribute("data-type");
      const form = document.getElementById(`${type}-form`);
      if (form) {
        form.classList.add("active");
      }
    });
  });

  // تبديل تصفية الرسائل
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      loadMessages(filter);
    });
  });

  // تحميل الرسائل عند الفتح
  loadMessages();

  // تحديث الرسائل كل 10 ثواني
  setInterval(() => {
    loadMessages();
  }, 10000);

  // السنة في التذييل
  document.getElementById("year").textContent = new Date().getFullYear();
});

// ============ إضافة أنماط الإشعارات ============
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
