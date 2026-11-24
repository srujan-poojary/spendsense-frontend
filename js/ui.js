// SpendSense - UI Component Helpers
const UI = {
  TOAST_ICONS: {
    success: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  },

  /**
   * Display modern toast notification (capped to at most 2 active, no duplicate spam)
   */
  toast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    // Prevent duplicate active toasts with the identical message
    const existingToasts = container.querySelectorAll(".toast-text");
    for (const t of existingToasts) {
      if (t.textContent === message) return;
    }

    // Keep at most 2 active toasts on screen
    while (container.children.length >= 2) {
      const oldest = container.firstChild;
      if (oldest) oldest.remove();
    }

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    const iconClass = this.TOAST_ICONS[type] || this.TOAST_ICONS.info;

    toast.innerHTML = `
      <i class="bi ${iconClass} toast-icon"></i>
      <span class="toast-text">${Utils.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close">
        <i class="bi bi-x"></i>
      </button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-visible"));

    const remove = () => {
      toast.classList.remove("toast-visible");
      toast.classList.add("toast-hide");
      setTimeout(() => toast.remove(), 250);
    };

    toast.querySelector(".toast-close").addEventListener("click", remove);
    if (duration > 0) {
      setTimeout(remove, duration);
    }
  },

  /**
   * Sleek in-app Sign Out confirmation popup
   */
  showLogoutModal() {
    let overlay = document.getElementById("logoutModalOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "logoutModalOverlay";
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 16px;
      `;
      overlay.innerHTML = `
        <div style="background: #121215; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px; width: 100%; max-width: 350px; padding: 24px 22px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7); text-align: center;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.28); color: #f43f5e; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 20px;">
            <i class="bi bi-box-arrow-right"></i>
          </div>
          <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 6px;">Sign Out</h3>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 20px;">
            Are you sure you want to exit your session? You can sign back in anytime.
          </p>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-secondary" id="logoutCancelBtn" style="flex: 1; justify-content: center; padding: 9px; font-size: 12.5px;">
              Cancel
            </button>
            <button type="button" class="btn-primary" id="logoutConfirmBtn" style="flex: 1; justify-content: center; padding: 9px; font-size: 12.5px; background: #e11d48; border-color: #e11d48;">
              Sign Out
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    return new Promise((resolve) => {
      overlay.style.display = "flex";
      const cancelBtn = document.getElementById("logoutCancelBtn");
      const confirmBtn = document.getElementById("logoutConfirmBtn");

      const close = (confirmed) => {
        overlay.style.display = "none";
        resolve(confirmed);
      };

      cancelBtn.onclick = () => close(false);
      overlay.onclick = (e) => {
        if (e.target === overlay) close(false);
      };
      confirmBtn.onclick = () => close(true);
    });
  },

  /**
   * Modern Promise-based confirmation modal
   */
  confirm(message, options = {}) {
    const overlay = document.getElementById("confirmOverlay");
    const titleEl = document.getElementById("confirmTitle");
    const msgEl = document.getElementById("confirmMessage");
    const okBtn = document.getElementById("confirmOkBtn");
    const cancelBtn = document.getElementById("confirmCancelBtn");
    const iconEl = document.getElementById("confirmIcon");

    if (!overlay) return Promise.resolve(window.confirm(message));

    titleEl.textContent = options.title || "Are you sure?";
    msgEl.textContent = message;
    okBtn.textContent = options.confirmText || "Confirm";
    cancelBtn.textContent = options.cancelText || "Cancel";

    if (options.confirmIcon && iconEl) {
      iconEl.innerHTML = `<i class="bi ${options.confirmIcon}"></i>`;
    } else if (iconEl) {
      iconEl.innerHTML = `<i class="bi bi-exclamation-triangle"></i>`;
    }

    overlay.classList.add("show");

    return new Promise((resolve) => {
      const cleanup = () => {
        overlay.classList.remove("show");
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
      };

      const onOk = () => {
        cleanup();
        resolve(true);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
    });
  },

  showLoader(text = "AI is preparing your workspace...") {
    const loader = document.getElementById("loader");
    if (!loader) return;
    const textEl = loader.querySelector("h4");
    if (textEl) textEl.textContent = text;
    loader.style.display = "flex";
    loader.classList.remove("hidden");
  },

  hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("hidden");
    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  },
};

window.UI = UI;
window.showToast = (msg, type, dur) => UI.toast(msg, type, dur);
window.confirmDialog = (msg, opt) => UI.confirm(msg, opt);
