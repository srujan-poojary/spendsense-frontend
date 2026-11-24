// SpendSense - Transactions Controller
const Transactions = {
  expenses: [],
  activeExpenseForEdit: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById("searchTransaction");
    const categorySelect = document.getElementById("categoryFilter");
    const sortSelect = document.getElementById("transactionSort");

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        Utils.debounce(() => this.load(), 300)
      );
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", () => this.load());
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", () => this.load());
    }

    // Edit modal form submission
    const editForm = document.getElementById("editExpenseForm");
    if (editForm) {
      editForm.addEventListener("submit", (e) => this.handleEditSubmit(e));
    }

    // Modal close triggers
    const closeBtn = document.getElementById("closeEditModalBtn");
    const cancelBtn = document.getElementById("cancelEditModalBtn");
    const overlay = document.getElementById("editModalOverlay");

    const closeModal = () => {
      if (overlay) overlay.classList.remove("active");
      this.activeExpenseForEdit = null;
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });
    }
  },

  async load() {
    const search = document.getElementById("searchTransaction")?.value.trim() || "";
    const category = document.getElementById("categoryFilter")?.value || "All";
    const sort = document.getElementById("transactionSort")?.value || "newest";

    const tableBody = document.getElementById("transactionTableBody");
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Loading transactions...
          </td>
        </tr>
      `;
    }

    try {
      const response = await Api.getExpenses({ search, category, sort });
      this.expenses = response.data || [];
      this.renderTable(this.expenses);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--accent-rose);">
              <i class="bi bi-exclamation-triangle-fill me-2"></i> Failed to load transactions. Check connection.
            </td>
          </tr>
        `;
      }
    }
  },

  renderTable(list) {
    const tableBody = document.getElementById("transactionTableBody");
    const countBadge = document.getElementById("transactionsCountBadge");
    if (countBadge) countBadge.textContent = `${list.length} records`;

    if (!tableBody) return;

    if (!list || list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
            <i class="bi bi-search" style="font-size: 26px; display: block; margin-bottom: 10px; opacity: 0.4;"></i>
            <p style="margin: 0; font-size: 13.5px; color: #fff; font-weight: 600;">No transactions found</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-muted);">Try adjusting your search filter or scan a receipt.</p>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list
      .map((item) => {
        const itemCount = item.items?.length || 0;
        const itemText = itemCount > 0 ? `${itemCount} item${itemCount > 1 ? "s" : ""}` : "1 item";
        return `
          <tr data-id="${item.id}">
            <td style="color: var(--text-muted); font-size: 12px; white-space: nowrap;">
              ${Utils.formatDate(item.purchase_date)}
            </td>
            <td>
              <span style="font-weight: 600; color: #ffffff;">${Utils.escapeHtml(item.merchant)}</span>
            </td>
            <td>
              <span class="category-pill">${Utils.escapeHtml(item.category || "Other")}</span>
            </td>
            <td style="color: var(--text-secondary); font-size: 12px;">
              ${itemText}
            </td>
            <td style="text-align: right; font-weight: 700; color: #ffffff; font-size: 13.5px;">
              ${Utils.formatCurrency(item.amount)}
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button type="button" class="action-btn edit-btn" data-id="${item.id}" title="Edit Expense">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="action-btn delete-btn" data-id="${item.id}" title="Delete Expense">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    // Bind edit and delete clicks
    tableBody.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.openEditModal(btn.dataset.id));
    });

    tableBody.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.handleDelete(btn.dataset.id));
    });
  },

  openEditModal(id) {
    const expense = this.expenses.find((e) => e.id === id);
    if (!expense) return;

    this.activeExpenseForEdit = expense;

    document.getElementById("editExpenseId").value = expense.id;
    document.getElementById("editMerchant").value = expense.merchant;
    document.getElementById("editCategory").value = expense.category || "Other";
    document.getElementById("editDate").value = expense.purchase_date;
    document.getElementById("editAmount").value = expense.amount;

    const overlay = document.getElementById("editModalOverlay");
    if (overlay) overlay.classList.add("active");
  },

  async handleEditSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("editExpenseId").value;
    const merchant = document.getElementById("editMerchant").value.trim();
    const category = document.getElementById("editCategory").value;
    const purchase_date = document.getElementById("editDate").value;
    const amount = parseFloat(document.getElementById("editAmount").value || 0);

    if (!merchant || !amount || amount <= 0) {
      UI.toast("Please enter a valid merchant and amount.", "warning");
      return;
    }

    try {
      await Api.updateExpense(id, {
        merchant,
        category,
        purchase_date,
        amount,
      });

      UI.toast("Expense updated successfully.", "success");
      const overlay = document.getElementById("editModalOverlay");
      if (overlay) overlay.classList.remove("active");
      await this.load();
    } catch (err) {
      console.error("Update failed:", err);
      UI.toast(err.message || "Failed to update expense.", "error");
    }
  },

  async handleDelete(id) {
    if (!confirm("Are you sure you want to delete this expense record?")) {
      return;
    }

    try {
      await Api.deleteExpense(id);
      UI.toast("Expense record deleted.", "info");
      await this.load();
    } catch (err) {
      console.error("Delete failed:", err);
      UI.toast(err.message || "Failed to delete expense.", "error");
    }
  },
};

window.Transactions = Transactions;
