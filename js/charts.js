// SpendSense - Chart.js Visualizations
const Charts = {
  categoryChart: null,
  overviewCategoryChart: null,
  monthlyTrendChart: null,
  overviewTrendChart: null,

  CHART_COLORS: [
    "#4F8CFF", // Primary blue
    "#39D98A", // Emerald green
    "#FFB020", // Amber warning
    "#FF6B6B", // Rose danger
    "#A78BFA", // Violet
    "#38BDF8", // Sky blue
    "#F472B6", // Pink
    "#FBBF24", // Yellow
    "#2DD4BF", // Teal
    "#818CF8", // Indigo
    "#94A3B8", // Muted slate
  ],

  /**
   * Render or update all dashboard & analytics charts
   */
  renderCharts(stats, expenses) {
    if (!window.Chart) {
      console.warn("Chart.js not loaded.");
      return;
    }

    this.renderCategoryChart(stats.categoryDistribution || {});
    this.renderMonthlyTrendChart(stats.monthlyTrend || {});
  },

  /**
   * Category spending distribution (Donut)
   */
  renderCategoryChart(distribution) {
    const labels = Object.keys(distribution);
    const data = Object.values(distribution);

    // Overview mini category chart
    const overviewCanvas = document.getElementById("overviewCategoryChart");
    if (overviewCanvas) {
      if (this.overviewCategoryChart) {
        this.overviewCategoryChart.destroy();
      }

      if (labels.length === 0) {
        this.renderEmptyChart(overviewCanvas, "No category spending yet");
      } else {
        this.overviewCategoryChart = new Chart(overviewCanvas, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: this.CHART_COLORS.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "#94A3B8",
                  font: { family: "Plus Jakarta Sans", size: 11 },
                  boxWidth: 12,
                  padding: 12,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => ` ${context.label}: ${Utils.formatCurrency(context.raw)}`,
                },
              },
            },
            cutout: "70%",
          },
        });
      }
    }

    // Analytics full category chart
    const fullCanvas = document.getElementById("analyticsCategoryChart");
    if (fullCanvas) {
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      if (labels.length === 0) {
        this.renderEmptyChart(fullCanvas, "No category data available");
      } else {
        this.categoryChart = new Chart(fullCanvas, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: this.CHART_COLORS.slice(0, labels.length),
                borderWidth: 2,
                borderColor: "#131F31",
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: "#CBD5E1",
                  font: { family: "Plus Jakarta Sans", size: 12 },
                  padding: 14,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const total = data.reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                    return ` ${context.label}: ${Utils.formatCurrency(context.raw)} (${pct}%)`;
                  },
                },
              },
            },
            cutout: "65%",
          },
        });
      }
    }
  },

  /**
   * Monthly spending history (Bar/Line)
   */
  renderMonthlyTrendChart(trendData) {
    const labels = Object.keys(trendData).sort();
    const data = labels.map((k) => trendData[k]);

    // Format labels to Month Year e.g. "Nov 2026"
    const formattedLabels = labels.map((k) => {
      const [y, m] = k.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    });

    const canvas = document.getElementById("monthlyTrendChart");
    const analyticsCanvas = document.getElementById("analyticsMonthlyChart");
    
    [canvas, analyticsCanvas].forEach((c) => {
      if (!c) return;
      if (labels.length === 0) {
        this.renderEmptyChart(c, "No monthly history yet");
        return;
      }
      const ctx = c.getContext("2d");
      new Chart(c, {
        type: "bar",
        data: {
          labels: formattedLabels,
          datasets: [
            {
              label: "Total Spending",
              data,
              backgroundColor: "#3B82F6",
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: 36,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#94A3B8",
                font: { family: "Plus Jakarta Sans", size: 11 },
              },
            },
            y: {
              grid: { color: "rgba(255, 255, 255, 0.05)" },
              ticks: {
                color: "#94A3B8",
                font: { family: "Plus Jakarta Sans", size: 11 },
                callback: (value) => "₹" + Number(value).toLocaleString("en-IN"),
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Spending: ${Utils.formatCurrency(context.raw)}`,
              },
            },
          },
        },
      });
    });
  },

  renderEmptyChart(canvas, message) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "13px Plus Jakarta Sans, sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  },

  refresh() {
    if (window.Dashboard && window.Dashboard.currentStats) {
      this.renderCharts(window.Dashboard.currentStats, window.Dashboard.currentExpenses || []);
    }
  },
};

window.Charts = Charts;
