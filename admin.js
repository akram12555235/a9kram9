/* ============================================
   نظام لوحة التحكم الإدارية المتقدمة
   ============================================ */

// ============ بيانات الدخول الافتراضية ============
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "akram6_2024", // يمكن تغييرها
};

let currentAdminUser = null;
let currentFilter = "all";
let currentSort = "newest";

// ============ إدارة جلسة الدخول ============

function handleAdminLogin(event) {
  event.preventDefault();

  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;

  // التحقق من بيانات الدخول
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    // حفظ الجلسة
    currentAdminUser = username;
    localStorage.setItem(
      "akram6_admin_session",
      JSON.stringify({
        user: username,
        loginTime: new Date().toISOString(),
      })
    );

    // إظهار لوحة التحكم
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-dashboard").classList.remove("hidden");

    // تحديث البيانات
    updateDashboard();

    // تحديث بيانات كل 10 ثوانٍ
    setInterval(updateDashboard, 10000);

    showNotification("✅ مرحباً بك في لوحة التحكم!", "success");
  } else {
    showNotification("❌ بيانات الدخول غير صحيحة!", "error");
  }
}

function handleAdminLogout() {
  showConfirmation(
    "تسجيل الخروج",
    "هل تريد تسجيل الخروج من لوحة التحكم؟",
    () => {
      currentAdminUser = null;
      localStorage.removeItem("akram6_admin_session");
      document.getElementById("admin-dashboard").classList.add("hidden");
      document.getElementById("login-screen").style.display = "flex";
      document.getElementById("admin-username").value = "";
      document.getElementById("admin-password").value = "";
      showNotification("👋 وداعاً! تم تسجيل الخروج", "success");
    }
  );
}

// التحقق من جلسة الدخول عند التحميل
function checkAdminSession() {
  // أولاً: التحقق من أن المستخدم مسجل دخول كأدمن من النظام الرئيسي
  const isAdmin = localStorage.getItem("is_admin");
  const token = localStorage.getItem("auth_token");
  const username = localStorage.getItem("username");

  // إذا مو أدمن، ارجعه لصفحة الدخول
  if (!token || isAdmin !== "1") {
    alert("⛔ هذه الصفحة للمسؤولين فقط!");
    window.location.href = "login.html";
    return;
  }

  const session = localStorage.getItem("akram6_admin_session");
  if (session) {
    try {
      const data = JSON.parse(session);
      currentAdminUser = data.user;
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("admin-dashboard").classList.remove("hidden");
      document.getElementById("current-user").textContent = data.user;
      updateDashboard();
      setInterval(updateDashboard, 10000);
    } catch (e) {
      localStorage.removeItem("akram6_admin_session");
    }
  }
}

// ============ تحديث لوحة التحكم ============

function updateDashboard() {
  MessageStorage.cleanExpiredMessages();

  const messages = MessageStorage.getAllMessages();

  // تحديث الإحصائيات
  const stats = {
    total: messages.length,
    general: messages.filter((m) => m.type === "general").length,
    secure: messages.filter((m) => m.type === "secure").length,
    member: messages.filter((m) => m.type === "member").length,
  };

  document.getElementById("total-stats").textContent = stats.total;
  document.getElementById("general-stats").textContent = stats.general;
  document.getElementById("secure-stats").textContent = stats.secure;
  document.getElementById("member-stats").textContent = stats.member;

  document.getElementById("total-messages-count").textContent = stats.total;
  document.getElementById("new-messages-count").textContent = messages.filter(
    (m) => {
      const msgTime = new Date(m.timestamp).getTime();
      const now = new Date().getTime();
      return now - msgTime < 3600000; // آخر ساعة
    }
  ).length;

  // تحديث الرسائل الحرجة والعاجلة
  updateCriticalMessages(messages);

  // تحديث قائمة الرسائل
  loadAdminMessages();

  // تحديث الإحصائيات
  updateAnalytics(messages);
}

function updateCriticalMessages(messages) {
  const criticalMsgs = messages.filter((m) => m.priority === "critical");
  const urgentMsgs = messages.filter((m) => m.priority === "urgent");

  // عرض الرسائل الحرجة
  const criticalContainer = document.getElementById("critical-messages");
  if (criticalMsgs.length === 0) {
    criticalContainer.innerHTML =
      '<p class="empty-preview">لا توجد رسائل حرجة</p>';
  } else {
    criticalContainer.innerHTML = criticalMsgs
      .slice(0, 3)
      .map(
        (msg) => `
      <div class="preview-item" onclick="viewMessage('${msg.id}')">
        <div class="preview-sender">👤 ${msg.name}</div>
        <div class="preview-text">${escapeHtml(
          msg.content.substring(0, 50)
        )}</div>
      </div>
    `
      )
      .join("");
  }

  // عرض الرسائل العاجلة
  const urgentContainer = document.getElementById("urgent-messages");
  if (urgentMsgs.length === 0) {
    urgentContainer.innerHTML =
      '<p class="empty-preview">لا توجد رسائل عاجلة</p>';
  } else {
    urgentContainer.innerHTML = urgentMsgs
      .slice(0, 3)
      .map(
        (msg) => `
      <div class="preview-item" onclick="viewMessage('${msg.id}')">
        <div class="preview-sender">👤 ${msg.name}</div>
        <div class="preview-text">${escapeHtml(
          msg.content.substring(0, 50)
        )}</div>
      </div>
    `
      )
      .join("");
  }
}

// ============ عرض الرسائل في Admin ============

function loadAdminMessages() {
  let messages = MessageStorage.getAllMessages();

  // تصفية
  if (currentFilter !== "all") {
    messages = messages.filter((m) => m.type === currentFilter);
  }

  // ترتيب
  if (currentSort === "newest") {
    messages.reverse();
  } else if (currentSort === "oldest") {
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } else if (currentSort === "priority") {
    const priorityOrder = { critical: 0, urgent: 1, normal: 2 };
    messages.sort(
      (a, b) =>
        (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
    );
  }

  const container = document.getElementById("messages-container");

  if (messages.length === 0) {
    container.innerHTML = '<p class="loading">لا توجد رسائل</p>';
    return;
  }

  container.innerHTML = messages
    .map((msg) => createAdminMessageCard(msg))
    .join("");

  // إضافة مستمعات الأحداث
  document.querySelectorAll(".admin-message-card").forEach((card) => {
    card.addEventListener("click", () => {
      const msgId = card.getAttribute("data-id");
      viewMessage(msgId);
    });
  });
}

function createAdminMessageCard(msg) {
  const timestamp = new Date(msg.timestamp).toLocaleString("ar-EG");
  const typeLabel = {
    general: "عام",
    secure: "سري 🔐",
    member: "عضو 👥",
  }[msg.type];

  let content = msg.content;
  if (msg.encrypted && msg.type !== "member") {
    content = SecureMessaging.decrypt(msg.content);
  }

  const priorityClass = msg.priority || "normal";
  const priorityLabel =
    {
      critical: "🔴 حرجة",
      urgent: "🟠 عاجلة",
      normal: "🟢 عادية",
    }[msg.priority] || "";

  return `
    <div class="admin-message-card" data-id="${msg.id}">
      <div class="message-header-admin">
        <span class="message-type-admin ${msg.type}">${typeLabel}</span>
        ${
          msg.priority
            ? `<span class="message-priority ${priorityClass}">${priorityLabel}</span>`
            : ""
        }
      </div>
      <div class="message-sender-admin">👤 ${msg.name || "مجهول"}</div>
      <div class="message-time-admin">⏰ ${timestamp}</div>
      ${
        msg.subject
          ? `<div style="color: #00e0ff; font-size: 0.9rem; margin-top: 0.5rem;">📌 ${msg.subject}</div>`
          : ""
      }
      <div class="message-snippet">${escapeHtml(
        content.substring(0, 100)
      )}</div>
    </div>
  `;
}

function viewMessage(messageId) {
  const messages = MessageStorage.getAllMessages();
  const message = messages.find((m) => m.id == messageId);

  if (!message) return;

  let content = message.content;
  if (message.encrypted && message.type !== "member") {
    content = SecureMessaging.decrypt(message.content);
  }

  const timestamp = new Date(message.timestamp).toLocaleString("ar-EG");

  const typeLabel = {
    general: "عام 💬",
    secure: "سري 🔐",
    member: "عضو 👥",
  }[message.type];

  const priorityLabel =
    {
      critical: "🔴 حرجة",
      urgent: "🟠 عاجلة",
      normal: "🟢 عادية",
    }[message.priority] || "";

  const contentHtml = `
    <div class="message-detail">
      <div class="detail-header">
        <h2>تفاصيل الرسالة</h2>
      </div>
      
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">النوع:</span>
          <span class="detail-value">${typeLabel}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">المرسل:</span>
          <span class="detail-value">${message.name || "مجهول"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">البريد:</span>
          <span class="detail-value">${message.email || "لا يوجد"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الوقت:</span>
          <span class="detail-value">${timestamp}</span>
        </div>
        ${
          message.priority
            ? `
        <div class="detail-item">
          <span class="detail-label">الأولوية:</span>
          <span class="detail-value">${priorityLabel}</span>
        </div>
        `
            : ""
        }
        ${
          message.subject
            ? `
        <div class="detail-item full">
          <span class="detail-label">الموضوع:</span>
          <span class="detail-value">${message.subject}</span>
        </div>
        `
            : ""
        }
      </div>

      <div class="detail-content">
        <h3>📝 محتوى الرسالة:</h3>
        <div class="message-text">${escapeHtml(content).replace(
          /\n/g,
          "<br>"
        )}</div>
      </div>

      <div class="detail-actions">
        <button class="btn primary" onclick="copyDetailMessage('${messageId}')">📋 نسخ</button>
        <button class="btn secondary" onclick="replyToMessage('${messageId}')">💬 رد</button>
        <button class="btn danger" onclick="deleteDetailMessage('${messageId}')">🗑️ حذف</button>
      </div>
    </div>
  `;

  document.getElementById("message-detail-content").innerHTML = contentHtml;
  openModal("message-detail-modal");
}

function copyDetailMessage(messageId) {
  const messages = MessageStorage.getAllMessages();
  const message = messages.find((m) => m.id == messageId);

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

function deleteDetailMessage(messageId) {
  showConfirmation("حذف الرسالة", "هل تريد حذف هذه الرسالة؟", () => {
    if (MessageStorage.deleteMessage(parseInt(messageId))) {
      showNotification("✅ تم الحذف", "success");
      closeModal("message-detail-modal");
      loadAdminMessages();
      updateDashboard();
    }
  });
}

function replyToMessage(messageId) {
  const messages = MessageStorage.getAllMessages();
  const message = messages.find((m) => m.id == messageId);

  if (message && message.email) {
    // فتح بريد إلكتروني
    window.location.href = `mailto:${message.email}?subject=رد على: ${
      message.subject || "رسالتك"
    }`;
    showNotification("📧 فتح برنامج البريد", "success");
  } else {
    showNotification("❌ لا يوجد بريد للرد عليه", "error");
  }
}

// ============ البحث والتصفية ============

document.addEventListener("DOMContentLoaded", () => {
  // تبديل الأقسام
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".nav-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".admin-section").forEach((section) => {
        section.classList.remove("active");
      });

      const sectionId = btn.getAttribute("data-section") + "-section";
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add("active");
      }
    });
  });

  // البحث
  const searchInput = document.getElementById("message-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const messages = MessageStorage.getAllMessages();

      const filtered = messages.filter((msg) => {
        let content = msg.content;
        if (msg.encrypted && msg.type !== "member") {
          content = SecureMessaging.decrypt(msg.content);
        }
        return (
          msg.name.toLowerCase().includes(query) ||
          content.toLowerCase().includes(query) ||
          (msg.email && msg.email.toLowerCase().includes(query))
        );
      });

      const container = document.getElementById("messages-container");
      if (filtered.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد نتائج</p>';
        return;
      }

      container.innerHTML = filtered
        .map((msg) => createAdminMessageCard(msg))
        .join("");
    });
  }

  // التصفية
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      loadAdminMessages();
    });
  });

  // الترتيب
  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sort-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentSort = btn.getAttribute("data-sort");
      loadAdminMessages();
    });
  });

  // التحقق من الجلسة
  checkAdminSession();
});

// ============ الإحصائيات ============

function updateAnalytics(messages) {
  // توزيع الرسائل
  const typeCounts = {
    general: messages.filter((m) => m.type === "general").length,
    secure: messages.filter((m) => m.type === "secure").length,
    member: messages.filter((m) => m.type === "member").length,
  };

  // الأولويات
  const priorityCounts = {
    critical: messages.filter((m) => m.priority === "critical").length,
    urgent: messages.filter((m) => m.priority === "urgent").length,
    normal: messages.filter((m) => m.priority === "normal").length,
  };

  // رسم الرسم البياني
  drawChart(typeCounts);

  // تحديث جدول الإحصائيات
  const tbody = document.getElementById("analytics-tbody");
  tbody.innerHTML = `
    <tr>
      <td>عام</td>
      <td>${typeCounts.general}</td>
      <td>${
        messages.length > 0
          ? ((typeCounts.general / messages.length) * 100).toFixed(1)
          : 0
      }%</td>
      <td>${messages.length > 0 ? "نشطة" : "—"}</td>
    </tr>
    <tr>
      <td>سري</td>
      <td>${typeCounts.secure}</td>
      <td>${
        messages.length > 0
          ? ((typeCounts.secure / messages.length) * 100).toFixed(1)
          : 0
      }%</td>
      <td>${messages.length > 0 ? "مشفرة" : "—"}</td>
    </tr>
    <tr>
      <td>أعضاء</td>
      <td>${typeCounts.member}</td>
      <td>${
        messages.length > 0
          ? ((typeCounts.member / messages.length) * 100).toFixed(1)
          : 0
      }%</td>
      <td>${messages.length > 0 ? "نشطة" : "—"}</td>
    </tr>
  `;

  // تحديث الأولويات
  const priorityStats = document.getElementById("priority-stats");
  const total =
    priorityCounts.critical + priorityCounts.urgent + priorityCounts.normal ||
    1;

  priorityStats.innerHTML = `
    <div class="priority-item">
      <span style="min-width: 60px;">🔴 حرجة</span>
      <div class="priority-bar">
        <div class="priority-fill" style="width: ${
          (priorityCounts.critical / total) * 100
        }%; background: #ff6b6b;">
          ${priorityCounts.critical}
        </div>
      </div>
    </div>
    <div class="priority-item">
      <span style="min-width: 60px;">🟠 عاجلة</span>
      <div class="priority-bar">
        <div class="priority-fill" style="width: ${
          (priorityCounts.urgent / total) * 100
        }%; background: #ffa726;">
          ${priorityCounts.urgent}
        </div>
      </div>
    </div>
    <div class="priority-item">
      <span style="min-width: 60px;">🟢 عادية</span>
      <div class="priority-bar">
        <div class="priority-fill" style="width: ${
          (priorityCounts.normal / total) * 100
        }%; background: #4caf50;">
          ${priorityCounts.normal}
        </div>
      </div>
    </div>
  `;
}

function drawChart(typeCounts) {
  const canvas = document.getElementById("messages-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // مسح الـ canvas
  ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
  ctx.fillRect(0, 0, width, height);

  // البيانات
  const data = [typeCounts.general, typeCounts.secure, typeCounts.member];
  const labels = ["عام 💬", "سري 🔐", "أعضاء 👥"];
  const colors = ["#08f7a3", "#ffc107", "#4cafff"];

  const total = data.reduce((a, b) => a + b, 1);
  let currentX = 20;

  data.forEach((value, index) => {
    const percentage = (value / total) * 100;
    const barWidth = (percentage / 100) * (width - 60);

    // رسم القطاع
    ctx.fillStyle = colors[index];
    ctx.fillRect(currentX, 40, barWidth, 30);

    // النص
    ctx.fillStyle = "#e0f2ff";
    ctx.font = "14px Arial";
    ctx.fillText(labels[index], currentX + 5, 100);
    ctx.fillText(`${value} (${percentage.toFixed(1)}%)`, currentX + 5, 120);

    currentX += barWidth + 10;
  });
}

// ============ إجراءات الإعدادات ============

function deleteAllData() {
  showConfirmation(
    "⚠️ حذف جميع البيانات",
    "هذا الإجراء نهائي! هل تريد حذف جميع الرسائل المحفوظة؟",
    () => {
      if (MessageStorage.deleteAll()) {
        showNotification("✅ تم حذف جميع البيانات", "success");
        updateDashboard();
      }
    }
  );
}

function exportAllData() {
  const messages = MessageStorage.getAllMessages();

  if (messages.length === 0) {
    showNotification("❌ لا توجد بيانات للتصدير", "error");
    return;
  }

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

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `admin-export-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  showNotification("📥 تم التصدير بنجاح!", "success");
}

function refreshData() {
  updateDashboard();
  showNotification("🔄 تم تحديث البيانات", "success");
}

function changePassword() {
  const newPassword = prompt("🔐 أدخل كلمة المرور الجديدة:");
  if (newPassword && newPassword.length >= 6) {
    ADMIN_CREDENTIALS.password = newPassword;
    localStorage.setItem("akram6_admin_password", newPassword);
    showNotification("✅ تم تغيير كلمة المرور بنجاح", "success");
  } else if (newPassword) {
    showNotification("❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
  }
}

// ============ Modal ============

let confirmCallback = null;

function showConfirmation(title, message, callback) {
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-message").textContent = message;
  confirmCallback = callback;
  openModal("confirm-modal");
}

function confirmDelete() {
  if (confirmCallback) {
    confirmCallback();
  }
  closeModal("confirm-modal");
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

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});

// ============ إشعارات ============

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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

// ============ أنماط إضافية ============

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

  .message-detail {
    color: #e0f2ff;
  }

  .detail-header {
    margin-bottom: 1.5rem;
    border-bottom: 2px solid rgba(8, 247, 163, 0.3);
    padding-bottom: 1rem;
  }

  .detail-header h2 {
    color: #08f7a3;
    margin: 0;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .detail-item {
    background: rgba(8, 247, 163, 0.1);
    padding: 1rem;
    border-radius: 6px;
    border-right: 3px solid #08f7a3;
  }

  .detail-item.full {
    grid-column: 1 / -1;
  }

  .detail-label {
    display: block;
    color: #00e0ff;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    font-weight: 600;
  }

  .detail-value {
    display: block;
    color: #08f7a3;
    font-size: 1rem;
  }

  .detail-content {
    background: rgba(0, 0, 0, 0.3);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .detail-content h3 {
    color: #08f7a3;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .message-text {
    background: rgba(0, 0, 0, 0.5);
    padding: 1rem;
    border-radius: 6px;
    line-height: 1.8;
    color: #e0f2ff;
    max-height: 400px;
    overflow-y: auto;
  }

  .detail-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
`;
document.head.appendChild(style);
