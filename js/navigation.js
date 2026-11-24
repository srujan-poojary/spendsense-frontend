// SpendSense - Navigation Controller
const Navigation = {
  activePage: "overview",

  init() {
    this.bindNavLinks();
    this.bindMobileSidebar();
    this.bindGlobalPageTriggers();
  },

  bindNavLinks() {
    const navButtons = document.querySelectorAll(".sidebar-nav .nav-link");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const pageId = btn.dataset.page;
        if (pageId) {
          this.navigateTo(pageId);
        }
      });
    });
  },

  bindMobileSidebar() {
    const toggle = document.getElementById("sidebarToggle");
    const sidebar = document.querySelector(".sidebar");

    if (toggle && sidebar) {
      toggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
      });

      // Close sidebar when clicking any nav item on mobile
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          sidebar.classList.remove("show");
        });
      });
    }
  },

  bindGlobalPageTriggers() {
    // Any element with data-page outside sidebar (e.g. Quick Scan hero button)
    document.querySelectorAll("[data-page]:not(.nav-link)").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const pageId = el.dataset.page;
        if (pageId) {
          this.navigateTo(pageId);
        }
      });
    });
  },

  navigateTo(pageId) {
    const targetSection = document.getElementById(pageId);
    if (!targetSection) {
      console.warn(`Target page #${pageId} not found.`);
      return;
    }

    // Update nav links active class
    document.querySelectorAll(".sidebar-nav .nav-link").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === pageId);
    });

    // Hide all pages, reveal target
    document.querySelectorAll(".page").forEach((section) => {
      section.style.display = "none";
      section.classList.remove("active-page");
    });

    targetSection.style.display = "block";
    targetSection.classList.add("active-page");
    this.activePage = pageId;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Trigger page-specific refresh if needed
    if (pageId === "transactions" && window.Transactions) {
      window.Transactions.refresh();
    } else if (pageId === "analytics" && window.Charts) {
      window.Charts.refresh();
    }
  },
};

window.Navigation = Navigation;
