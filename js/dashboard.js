// SpendSense - Dashboard Controller
const Dashboard = {
  currentStats: null,
  currentExpenses: [],

  CATEGORY_ICONS: {
    "Food & Dining": "bi-cup-hot",
    "Groceries": "bi-cart",
    "Shopping": "bi-bag",
    "Transport": "bi-car-front",
    "Entertainment": "bi-film",
    "Utilities": "bi-lightning-charge",
    "Healthcare": "bi-heart-pulse",
    "Education": "bi-book",
    "Travel": "bi-airplane",
    "Subscriptions": "bi-arrow-repeat",
    "Other": "bi-tag",
  },

  getMonthlyBudget(userId) {
    const isDemo = window.DemoManager && DemoManager.isDemoMode();
    if (isDemo) {
      const demoStored = localStorage.getItem("spendsense_demo_monthly_budget");
      return demoStored ? Number(demoStored) : 35000;
    }
    const uid = userId || window.currentUser?.id;
    if (uid) {
      const userStored = localStorage.getItem(`spendsense_budget_${uid}`);
      if (userStored) return Number(userStored);
    }
    const stored = localStorage.getItem("spendsense_monthly_budget");
    return stored ? Number(stored) : CONFIG.DEFAULT_MONTHLY_BUDGET;
  },

  setMonthlyBudget(amount, userId) {
    const isDemo = window.DemoManager && DemoManager.isDemoMode();
    if (isDemo) {
      localStorage.setItem("spendsense_demo_monthly_budget", amount);
      return;
    }
    const uid = userId || window.currentUser?.id;
    if (uid) {
      localStorage.setItem(`spendsense_budget_${uid}`, amount);
    }
    localStorage.setItem("spendsense_monthly_budget", amount);
  },

  async load() {
    try {
      const budget = this.getMonthlyBudget();
      const statsRes = await Api.getStats(budget);
      const stats = statsRes.data || {
        metrics: {
          monthlyBudget: budget,
          currentMonthSpent: 0,
          budgetRemaining: budget,
          budgetUsagePercent: 0,
          dailyAverage: 0,
          totalLifetimeSpent: 0,
          transactionCount: 0,
          topCategory: "None",
          topCategoryAmount: 0,
          insight: "Upload your first receipt to generate automated spending intelligence.",
          healthScore: 95,
          healthLabel: "Excellent",
        },
        categoryDistribution: {},
        monthlyTrend: {},
        recentExpenses: [],
      };

      this.currentStats = stats;

      const expRes = await Api.getExpenses({ sort: "newest" });
      const expenses = expRes.data || [];
      this.currentExpenses = expenses;

      this.renderSummaryMetrics(stats.metrics);
      this.renderAiCoach(stats.aiIntelligence, stats.metrics);
      this.renderRecentTransactions(stats.recentExpenses || expenses.slice(0, 5));
      this.bindAiRefresh();

      // Render Charts
      if (window.Charts) {
        Charts.renderCharts(stats, expenses);
      }
    } catch (err) {
      console.warn("Dashboard load notice:", err);
      // Fallback
      this.renderSummaryMetrics({
        totalLifetimeSpent: 0,
        currentMonthSpent: 0,
        budgetRemaining: this.getMonthlyBudget(),
        transactionCount: 0,
      });
      this.renderRecentTransactions([]);
    }
  },

  renderSummaryMetrics(m) {
    const totalSpentEl = document.getElementById("totalSpent");
    const monthlySpentEl = document.getElementById("monthlySpent");
    const monthlyTitleEl = document.getElementById("monthlySpentTitle");
    const monthlySubEl = document.getElementById("monthlySpentSubtitle");
    const budgetLeftEl = document.getElementById("budgetLeft");
    const countEl = document.getElementById("transactionCount");
    const usageLabel = document.getElementById("budgetUsageLabel");

    if (totalSpentEl) totalSpentEl.textContent = Utils.formatCurrency(m.totalLifetimeSpent);
    if (monthlySpentEl) monthlySpentEl.textContent = Utils.formatCurrency(m.currentMonthSpent);
    if (monthlySubEl && m.billingPeriodLabel) {
      monthlySubEl.textContent = m.billingPeriodLabel;
    }
    if (budgetLeftEl) {
      budgetLeftEl.textContent = Utils.formatCurrency(m.budgetRemaining);
      budgetLeftEl.style.color = m.budgetRemaining < 0 ? "var(--accent-rose)" : "var(--accent-emerald)";
    }
    if (countEl) countEl.textContent = m.transactionCount || 0;
    if (usageLabel) {
      usageLabel.textContent = m.budgetRemaining < 0 ? "Budget exceeded" : "Within monthly limit";
    }
  },

  renderAiCoach(ai, m) {
    const headlineEl = document.getElementById("aiInsightHeadline");
    const summaryEl = document.getElementById("aiInsightSummary");
    const cardsContainer = document.getElementById("aiCardsContainer");
    const tipEl = document.getElementById("aiActionableTip");
    const budgetPercent = document.getElementById("budgetUsagePercent");
    const progressBar = document.getElementById("budgetProgressBar");

    // Populate Budget Progress Bar & Header
    const pct = Math.min(100, Math.max(0, m?.budgetUsagePercent || 0));
    if (budgetPercent) budgetPercent.textContent = `${pct}% Used`;
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
      if (pct > 90) progressBar.style.background = "var(--accent-rose)";
      else if (pct > 75) progressBar.style.background = "var(--accent-amber)";
      else progressBar.style.background = "var(--accent-emerald)";
    }

    // Populate Enriched Budget & Pacing Elements
    if (m) {
      const barSpent = document.getElementById("budgetBarSpent");
      const barLimit = document.getElementById("budgetBarLimit");
      const barCycle = document.getElementById("budgetBarCycleLabel");
      const tileSpent = document.getElementById("tileSpentActive");
      const tileSpentPct = document.getElementById("tileSpentPercent");
      const tileBuffer = document.getElementById("tileBufferLeft");
      const tileBufferStatus = document.getElementById("tileBufferStatus");
      const tileDaily = document.getElementById("tileDailyAllowance");
      const tileDailyStatus = document.getElementById("tileDailyStatus");

      const spent = m.currentMonthSpent || 0;
      const budget = m.monthlyBudget || 20000;
      const buffer = m.budgetRemaining || (budget - spent);

      // Remaining days in month
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysLeft = Math.max(1, lastDay - now.getDate() + 1);
      const safeDailyCap = Math.round(Math.max(0, buffer) / daysLeft);

      if (barSpent) barSpent.textContent = Utils.formatCurrency(spent);
      if (barLimit) barLimit.textContent = Utils.formatCurrency(budget);
      if (barCycle && m.billingPeriodLabel) barCycle.textContent = m.billingPeriodLabel;

      if (tileSpent) tileSpent.textContent = Utils.formatCurrency(spent);
      if (tileSpentPct) tileSpentPct.textContent = `${pct}% of budget`;

      if (tileBuffer) {
        tileBuffer.textContent = Utils.formatCurrency(buffer);
        tileBuffer.style.color = buffer < 0 ? "var(--accent-rose)" : "var(--accent-emerald)";
      }
      if (tileBufferStatus) {
        tileBufferStatus.textContent = buffer < 0 ? "Over budget" : (pct > 80 ? "Tight buffer" : "Safe buffer");
      }

      if (tileDaily) tileDaily.textContent = `${Utils.formatCurrency(safeDailyCap)}/day`;
      if (tileDailyStatus) {
        tileDailyStatus.textContent = `${daysLeft} days remaining`;
      }

      // Pacing Narrative Box
      const narrativeEl = document.getElementById("budgetPacingNarrative");
      const iconEl = document.getElementById("budgetPacingIcon");
      const boxEl = document.getElementById("budgetPacingBox");
      if (narrativeEl && boxEl) {
        if (pct > 90) {
          narrativeEl.textContent = `Warning: ${pct}% of monthly budget depleted. Only ${Utils.formatCurrency(buffer)} remains. Freeze discretionary dining & shopping.`;
          boxEl.style.background = "rgba(244, 63, 94, 0.08)";
          boxEl.style.borderColor = "rgba(244, 63, 94, 0.25)";
          if (iconEl) { iconEl.className = "bi bi-exclamation-triangle-fill"; iconEl.style.color = "var(--accent-rose)"; }
        } else if (pct > 70) {
          narrativeEl.textContent = `Pacing Notice: ${pct}% budget consumed. Maintain a daily cap of ~${Utils.formatCurrency(safeDailyCap)}/day to finish within limits.`;
          boxEl.style.background = "rgba(245, 158, 11, 0.08)";
          boxEl.style.borderColor = "rgba(245, 158, 11, 0.25)";
          if (iconEl) { iconEl.className = "bi bi-exclamation-circle-fill"; iconEl.style.color = "var(--accent-amber)"; }
        } else {
          narrativeEl.textContent = `Sustainable Velocity: You have ${Utils.formatCurrency(buffer)} buffer remaining. Safe daily runway is ~${Utils.formatCurrency(safeDailyCap)}/day.`;
          boxEl.style.background = "rgba(16, 185, 129, 0.08)";
          boxEl.style.borderColor = "rgba(16, 185, 129, 0.25)";
          if (iconEl) { iconEl.className = "bi bi-shield-check"; iconEl.style.color = "var(--accent-emerald)"; }
        }
      }
    }

    if (ai) {
      if (headlineEl && ai.headline) headlineEl.textContent = ai.headline;
      if (summaryEl && ai.summary) summaryEl.textContent = ai.summary;
      if (tipEl && ai.actionableTip) tipEl.textContent = ai.actionableTip;

      if (cardsContainer && Array.isArray(ai.cards)) {
        cardsContainer.innerHTML = ai.cards
          .map((card) => `
            <div class="ai-insight-card">
              <div class="ai-insight-card-header">
                <div class="ai-insight-card-title">
                  <i class="bi ${card.icon || 'bi-stars'}" style="color: #60a5fa;"></i>
                  <span>${Utils.escapeHtml(card.title)}</span>
                </div>
                ${card.badge ? `<span class="ai-insight-card-badge">${Utils.escapeHtml(card.badge)}</span>` : ''}
              </div>
              <p class="ai-insight-card-detail">${Utils.escapeHtml(card.detail)}</p>
            </div>
          `)
          .join("");
      }
    } else if (m?.insight) {
      if (summaryEl) summaryEl.textContent = m.insight;
    }
  },

  bindAiRefresh() {
    const refreshAiBtn = document.getElementById("refreshAiInsightsBtn");
    if (!refreshAiBtn || refreshAiBtn.dataset.bound) return;
    refreshAiBtn.dataset.bound = "true";

    refreshAiBtn.addEventListener("click", async () => {
      refreshAiBtn.disabled = true;
      refreshAiBtn.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> Thinking...`;
      try {
        const budget = this.getMonthlyBudget();
        const liveRes = await Api.getLiveAiInsights(budget);
        if (liveRes && liveRes.data) {
          this.renderAiCoach(liveRes.data, this.currentStats?.metrics || {});
          if (window.UI) UI.toast("AI spending intelligence updated!", "success");
        }
      } catch (err) {
        console.warn("Live AI insights failed:", err);
        if (window.UI) UI.toast("Spending intelligence updated.", "info");
      } finally {
        refreshAiBtn.disabled = false;
        refreshAiBtn.innerHTML = `<i class="bi bi-arrow-clockwise"></i> Re-Analyze`;
      }
    });
  },

  renderRecentTransactions(recentList) {
    const tbody = document.getElementById("recentTransactions");
    if (!tbody) return;

    if (!recentList || recentList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; padding: 36px 12px; color: var(--text-muted);">
            <i class="bi bi-receipt" style="font-size: 24px; display: block; margin-bottom: 8px; opacity: 0.4;"></i>
            No expenses recorded yet.<br>
            <a href="scan.html" class="btn-secondary btn-sm" style="margin-top: 10px;">
              <i class="bi bi-camera"></i> Scan First Receipt
            </a>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = recentList
      .slice(0, 5)
      .map((item) => {
        const icon = this.CATEGORY_ICONS[item.category] || "bi-tag";
        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="bi ${icon} text-muted"></i>
                <div>
                  <span style="font-weight: 600; color: #fff;">${Utils.escapeHtml(item.merchant)}</span>
                  <div style="font-size: 11px; color: var(--text-muted);">${Utils.formatShortDate(item.purchase_date)}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="category-pill">${Utils.escapeHtml(item.category || "Other")}</span>
            </td>
            <td style="text-align: right; font-weight: 700; color: #ffffff;">
              ${Utils.formatCurrency(item.amount)}
            </td>
          </tr>
        `;
      })
      .join("");
  },

  async refresh() {
    await this.load();
  },
};

window.Dashboard = Dashboard;
