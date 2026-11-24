// SpendSense - Demo Mode Controller
const DemoManager = {
  STORAGE_KEY_MODE: "spendsense_demo_mode",
  STORAGE_KEY_DATA: "spendsense_demo_expenses",

  DEMO_USER: {
    id: "demo-user-777",
    email: "alex.vance@demo.spendsense.ai",
    user_metadata: {
      full_name: "Alex Vance",
      name: "Alex Vance",
      avatar_url: null,
    },
    app_metadata: {
      provider: "Demo Sandbox",
    },
    created_at: "2026-10-15T10:00:00.000Z",
  },

  SAMPLE_RECEIPTS: [
    {
      id: "sample-cafe",
      name: "☕ Blue Tokai Coffee",
      category: "Food & Dining",
      amount: 560,
      badge: "Cafe Slip",
      items: [
        { name: "Iced Spanish Latte", price: 290 },
        { name: "Almond Croissant", price: 270 },
      ],
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "sample-groceries",
      name: "🛒 Nature's Basket",
      category: "Groceries",
      amount: 2840,
      badge: "Supermarket Bill",
      items: [
        { name: "Organic Almond Milk (1L)", price: 340 },
        { name: "Sourdough Loaf", price: 280 },
        { name: "Honeycrisp Apples (1kg)", price: 420 },
        { name: "Extra Virgin Olive Oil (500ml)", price: 1250 },
        { name: "Greek Yogurt x4", price: 550 },
      ],
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "sample-electronics",
      name: "💻 Croma Megastore",
      category: "Shopping",
      amount: 6499,
      badge: "Tech Invoice",
      items: [
        { name: "65W GaN Fast Charger", price: 2499 },
        { name: "Braided USB-C Cable (2m)", price: 1200 },
        { name: "Wireless Charging Pad", price: 2800 },
      ],
      date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    },
  ],

  getInitialSeedExpenses() {
    const today = new Date();
    const daysAgo = (days) => {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      return d.toISOString().split("T")[0];
    };

    return [
      {
        id: "demo-exp-1",
        merchant: "Whole Foods Market",
        category: "Groceries",
        amount: 3420,
        purchase_date: daysAgo(0),
        items: [
          { name: "Organic Almond Milk", price: 340 },
          { name: "Sourdough Bread", price: 280 },
          { name: "Honeycrisp Apples (1kg)", price: 450 },
          { name: "Extra Virgin Olive Oil", price: 1450 },
          { name: "Greek Yogurt (Pack of 4)", price: 900 },
        ],
      },
      {
        id: "demo-exp-2",
        merchant: "Blue Tokai Coffee Roasters",
        category: "Food & Dining",
        amount: 560,
        purchase_date: daysAgo(1),
        items: [
          { name: "Iced Spanish Latte", price: 290 },
          { name: "Almond Croissant", price: 270 },
        ],
      },
      {
        id: "demo-exp-3",
        merchant: "Uber Technologies",
        category: "Transport",
        amount: 680,
        purchase_date: daysAgo(2),
        items: [{ name: "Airport Ride (Terminal 2)", price: 680 }],
      },
      {
        id: "demo-exp-4",
        merchant: "Apple Store",
        category: "Shopping",
        amount: 8900,
        purchase_date: daysAgo(4),
        items: [
          { name: "MagSafe Fast Charger 2m", price: 4500 },
          { name: "AirPods Pro Case", price: 4400 },
        ],
      },
      {
        id: "demo-exp-5",
        merchant: "Netflix Entertainment",
        category: "Subscriptions",
        amount: 649,
        purchase_date: daysAgo(6),
        items: [{ name: "Premium Ultra HD 4K Plan", price: 649 }],
      },
      {
        id: "demo-exp-6",
        merchant: "Airtel Xstream Fiber",
        category: "Utilities",
        amount: 1179,
        purchase_date: daysAgo(8),
        items: [{ name: "300Mbps Unlimited Internet", price: 1179 }],
      },
      {
        id: "demo-exp-7",
        merchant: "Apollo Pharmacy",
        category: "Healthcare",
        amount: 940,
        purchase_date: daysAgo(11),
        items: [
          { name: "Multivitamin Complex", price: 620 },
          { name: "Bandage & First Aid Kit", price: 320 },
        ],
      },
      {
        id: "demo-exp-8",
        merchant: "Blinkit Instant Mart",
        category: "Groceries",
        amount: 1420,
        purchase_date: daysAgo(13),
        items: [
          { name: "Avocados (Twin Pack)", price: 360 },
          { name: "Perrier Sparkling Water x4", price: 640 },
          { name: "85% Dark Chocolate", price: 420 },
        ],
      },
      {
        id: "demo-exp-9",
        merchant: "Social Bar & Kitchen",
        category: "Food & Dining",
        amount: 2450,
        purchase_date: daysAgo(16),
        items: [
          { name: "Craft Smash Burgers x2", price: 1100 },
          { name: "Signature Mocktails x2", price: 750 },
          { name: "Truffle Parmesan Fries", price: 600 },
        ],
      },
      {
        id: "demo-exp-10",
        merchant: "Spotify AB",
        category: "Subscriptions",
        amount: 179,
        purchase_date: daysAgo(18),
        items: [{ name: "Individual Premium Monthly", price: 179 }],
      },
      {
        id: "demo-exp-11",
        merchant: "IndiGo Airlines",
        category: "Travel",
        amount: 4200,
        purchase_date: daysAgo(21),
        items: [{ name: "BLR to BOM Flight 6E-241", price: 4200 }],
      },
      {
        id: "demo-exp-12",
        merchant: "Zara Retail",
        category: "Shopping",
        amount: 3190,
        purchase_date: daysAgo(24),
        items: [{ name: "Tailored Linen Shirt", price: 3190 }],
      },
      {
        id: "demo-exp-13",
        merchant: "BESCOM Electricity Board",
        category: "Utilities",
        amount: 1850,
        purchase_date: daysAgo(27),
        items: [{ name: "Residential Electricity Bill", price: 1850 }],
      },
      {
        id: "demo-exp-14",
        merchant: "Coursera Inc",
        category: "Education",
        amount: 1499,
        purchase_date: daysAgo(29),
        items: [{ name: "AI & Machine Learning Specialization", price: 1499 }],
      },
    ];
  },

  isDemoMode() {
    return localStorage.getItem(this.STORAGE_KEY_MODE) === "true";
  },

  async enterDemoMode() {
    localStorage.setItem(this.STORAGE_KEY_MODE, "true");
    if (!localStorage.getItem(this.STORAGE_KEY_DATA)) {
      this.resetDemoData();
    }
    if (!localStorage.getItem("spendsense_demo_monthly_budget")) {
      localStorage.setItem("spendsense_demo_monthly_budget", "35000");
    }
    // Cleanly sign out any live Supabase session so it does not collide
    if (window.supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {}
    }
    window.location.href = "dashboard.html";
  },

  exitDemoMode() {
    localStorage.setItem(this.STORAGE_KEY_MODE, "false");
    window.location.href = "index.html";
  },

  resetDemoData() {
    const seed = this.getInitialSeedExpenses();
    localStorage.setItem(this.STORAGE_KEY_DATA, JSON.stringify(seed));
    return seed;
  },

  getExpensesRaw() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_DATA);
      if (!stored) {
        return this.resetDemoData();
      }
      return JSON.parse(stored);
    } catch {
      return this.resetDemoData();
    }
  },

  saveExpensesRaw(list) {
    localStorage.setItem(this.STORAGE_KEY_DATA, JSON.stringify(list));
  },

  // ════════════════ IN-MEMORY QUERY & MUTATION ════════════════
  getExpenses(options = {}) {
    let list = this.getExpensesRaw();

    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.merchant.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.items && e.items.some((i) => i.name.toLowerCase().includes(q)))
      );
    }

    if (options.category && options.category !== "All") {
      list = list.filter((e) => e.category === options.category);
    }

    if (options.sort === "oldest") {
      list.sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));
    } else if (options.sort === "highest") {
      list.sort((a, b) => b.amount - a.amount);
    } else if (options.sort === "lowest") {
      list.sort((a, b) => a.amount - b.amount);
    } else {
      // Default: newest
      list.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
    }

    return Promise.resolve({
      status: "success",
      count: list.length,
      data: list,
    });
  },

  createExpense(data) {
    const list = this.getExpensesRaw();
    const newExpense = {
      id: "demo-exp-" + Date.now(),
      merchant: data.merchant || "Untitled Merchant",
      category: data.category || "Other",
      amount: parseFloat(data.amount) || 0,
      purchase_date: data.purchase_date || new Date().toISOString().split("T")[0],
      items: Array.isArray(data.items) ? data.items : [],
    };

    list.unshift(newExpense);
    this.saveExpensesRaw(list);

    return Promise.resolve({
      status: "success",
      message: "Demo expense created",
      data: newExpense,
    });
  },

  updateExpense(id, data) {
    const list = this.getExpensesRaw();
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        merchant: data.merchant || list[idx].merchant,
        category: data.category || list[idx].category,
        amount: parseFloat(data.amount) || list[idx].amount,
        purchase_date: data.purchase_date || list[idx].purchase_date,
        items: data.items || list[idx].items,
      };
      this.saveExpensesRaw(list);
      return Promise.resolve({ status: "success", data: list[idx] });
    }
    return Promise.reject(new Error("Expense not found"));
  },

  deleteExpense(id) {
    let list = this.getExpensesRaw();
    list = list.filter((e) => e.id !== id);
    this.saveExpensesRaw(list);
    return Promise.resolve({ status: "success", message: "Deleted" });
  },

  getStats(budget = 35000) {
    const list = this.getExpensesRaw();
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let totalLifetimeSpent = 0;
    let currentMonthSpent = 0;
    const categoryDistribution = {};
    const monthlyTrend = {};

    list.forEach((item) => {
      const amt = Number(item.amount) || 0;
      totalLifetimeSpent += amt;

      const dateStr = item.purchase_date || "";
      const monthKey = dateStr.slice(0, 7);

      if (monthKey === currentMonthKey) {
        currentMonthSpent += amt;
      }

      if (monthKey) {
        monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + amt;
      }

      const cat = item.category || "Other";
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + amt;
    });

    // Find top category
    let topCategory = "None";
    let topCategoryAmount = 0;
    Object.entries(categoryDistribution).forEach(([cat, val]) => {
      if (val > topCategoryAmount) {
        topCategoryAmount = val;
        topCategory = cat;
      }
    });

    // Active cycle spend resolution (if current month has 0, pick latest active month)
    const sortedMonths = Object.keys(monthlyTrend).sort();
    const latestMonthKey = sortedMonths[sortedMonths.length - 1];
    const latestMonthSpent = latestMonthKey ? monthlyTrend[latestMonthKey] || 0 : 0;

    let effectiveMonthlySpent = currentMonthSpent;
    let billingPeriodLabel = "Current billing period";
    if (currentMonthSpent === 0 && totalLifetimeSpent > 0 && latestMonthKey) {
      effectiveMonthlySpent = latestMonthSpent;
      const [y, mStr] = latestMonthKey.split("-");
      const dateObj = new Date(Number(y), Number(mStr) - 1, 1);
      const monthName = dateObj.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      billingPeriodLabel = `${monthName} (Active cycle)`;
    }

    const budgetRemaining = budget - effectiveMonthlySpent;
    const budgetUsagePercent = budget > 0 ? Math.round((effectiveMonthlySpent / budget) * 100) : 0;
    const currentDay = now.getDate();
    const dailyAverage = currentDay > 0 ? Math.round(effectiveMonthlySpent / currentDay) : 0;

    // Discretionary ratio
    const discretionaryCats = ["Food & Dining", "Shopping", "Entertainment", "Subscriptions", "Travel"];
    const discSum = Object.entries(categoryDistribution).reduce((acc, [c, v]) => {
      return discretionaryCats.includes(c) ? acc + v : acc;
    }, 0);
    const discretionaryRatio = totalLifetimeSpent > 0 ? Math.round((discSum / totalLifetimeSpent) * 100) : 0;

    // Line-item beverage detection
    let bevCount = 0;
    let bevTotal = 0;
    const bevExamples = [];
    const beverageKeywords = ["coffee", "latte", "tea", "cooler", "shake", "milk", "drink", "soda", "cappuccino", "juice"];
    list.forEach((e) => {
      (e.items || []).forEach((i) => {
        const name = String(i.name || "").toLowerCase();
        if (beverageKeywords.some((kw) => name.includes(kw))) {
          bevCount++;
          bevTotal += Number(i.price) || 0;
          if (bevExamples.length < 3) bevExamples.push(i.name);
        }
      });
    });

    const topCatShare = totalLifetimeSpent > 0 ? Math.round((topCategoryAmount / totalLifetimeSpent) * 100) : 0;
    const sortedByAmt = [...list].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
    const largest = sortedByAmt[0];
    const largestAmt = Number(largest?.amount) || 0;
    const largestBudgetShare = budget > 0 ? Math.round((largestAmt / budget) * 100) : 0;

    const cards = [];
    if (largest && largestBudgetShare >= 15) {
      cards.push({
        type: "alert",
        icon: "bi-lightning-charge",
        title: "Single High-Ticket Outing",
        detail: `${largest.merchant} (₹${largestAmt.toLocaleString("en-IN")}) consumed ${largestBudgetShare}% of your ₹${budget.toLocaleString("en-IN")} monthly budget.`,
        badge: `${largestBudgetShare}% of Budget`,
      });
    }

    if (bevCount > 0 && bevTotal > 0) {
      cards.push({
        type: "itemized",
        icon: "bi-cup-hot",
        title: "Beverage & Add-On Impact",
        detail: `${bevCount} specialty drinks (${bevExamples.join(", ")}) totaled ₹${bevTotal.toLocaleString("en-IN")}.`,
        badge: `₹${bevTotal.toLocaleString("en-IN")} in drinks`,
      });
    } else {
      cards.push({
        type: "itemized",
        icon: "bi-diagram-3",
        title: "Category Concentration",
        detail: `${topCategory} represents ${topCatShare}% of all recorded spending (₹${topCategoryAmount.toLocaleString("en-IN")}).`,
        badge: `${topCatShare}% Share`,
      });
    }

    cards.push({
      type: "runway",
      icon: "bi-shield-check",
      title: "Runway & Pacing",
      detail: `₹${budgetRemaining.toLocaleString("en-IN")} remaining. Discretionary spending sits at ${discretionaryRatio}% of total outflows.`,
      badge: `₹${budgetRemaining.toLocaleString("en-IN")} Left`,
    });

    const aiIntelligence = {
      headline: topCatShare >= 70
        ? `Heavy ${topCategory} Concentration (${topCatShare}%) — ${largest?.merchant || "Dining"} Outing Drove Spend`
        : `Spending Well-Controlled: ₹${budgetRemaining.toLocaleString("en-IN")} Safety Margin Available`,
      summary: `You have logged ₹${totalLifetimeSpent.toLocaleString("en-IN")} across ${list.length} receipts. ${topCategory} is your primary category (${topCatShare}%). Discretionary spending represents ${discretionaryRatio}% of your outflows.`,
      healthScore: budgetUsagePercent < 75 ? 94 : 78,
      healthLabel: budgetUsagePercent < 75 ? "Optimal" : "Moderate",
      cards,
      actionableTip: bevTotal >= 500
        ? `Target Add-Ons: Specialty drinks and coffees accounted for ₹${bevTotal.toLocaleString("en-IN")}. Capping cafe drinks could unlock ~₹${Math.round(bevTotal * 0.5).toLocaleString("en-IN")} in monthly savings.`
        : `Maintain Velocity: Your current burn rate provides steady buffer. Continue logging receipts to build reliable multi-week category baselines.`,
      dominantMerchant: largest?.merchant || "None",
      dominantCategory: topCategory,
      discretionaryRatio,
    };

    return Promise.resolve({
      status: "success",
      data: {
        metrics: {
          monthlyBudget: budget,
          currentMonthSpent: effectiveMonthlySpent,
          rawCurrentMonthSpent: currentMonthSpent,
          billingPeriodLabel,
          budgetRemaining,
          budgetUsagePercent,
          dailyAverage,
          totalLifetimeSpent,
          transactionCount: list.length,
          topCategory,
          topCategoryAmount,
          insight: aiIntelligence.summary,
          healthScore: aiIntelligence.healthScore,
          healthLabel: aiIntelligence.healthLabel,
        },
        aiIntelligence,
        categoryDistribution,
        monthlyTrend,
        recentExpenses: list.slice(0, 5),
      },
    });
  },

  /**
   * Fast Simulated Gemini Vision OCR in Demo Mode
   * Completes in ~600ms without touching slow servers
   */
  async simulateScanReceipt(sampleOrFile) {
    // If a sample template is provided
    if (typeof sampleOrFile === "string" && sampleOrFile.startsWith("sample-")) {
      const match = this.SAMPLE_RECEIPTS.find((s) => s.id === sampleOrFile);
      if (match) {
        await new Promise((r) => setTimeout(r, 650));
        return {
          status: "success",
          data: {
            merchant: match.name.replace(/^[^\w]+/, "").trim(),
            category: match.category,
            purchase_date: match.date,
            amount: match.amount,
            tax: Math.round(match.amount * 0.05),
            items: match.items,
          },
        };
      }
    }

    // Generic upload simulation
    await new Promise((r) => setTimeout(r, 750));
    return {
      status: "success",
      data: {
        merchant: "Starbucks Coffee",
        category: "Food & Dining",
        purchase_date: new Date().toISOString().split("T")[0],
        amount: 480.0,
        tax: 24.0,
        items: [
          { name: "Caffe Latte (Grande)", price: 295.0 },
          { name: "Blueberry Muffin", price: 185.0 },
        ],
      },
    };
  },
};

window.DemoManager = DemoManager;
