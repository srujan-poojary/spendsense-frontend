// SpendSense - API Client
const Api = {
  /**
   * Helper to retrieve active Supabase JWT
   */
  async getAuthToken() {
    if (window.currentSession?.access_token) {
      return window.currentSession.access_token;
    }
    if (window.supabaseClient) {
      const { data } = await supabaseClient.auth.getSession();
      return data.session?.access_token || null;
    }
    return null;
  },

  /**
   * Generic request helper with timeout
   */
  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const url = `${CONFIG.API_URL}${endpoint}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for AI vision

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`Backend request notice on ${endpoint}:`, err.message);
      // Only fallback to DemoManager IF the session is explicitly in Demo Mode!
      if (window.DemoManager && DemoManager.isDemoMode() && !endpoint.includes("/api/receipts/scan")) {
        console.info("⚡ Routing to local DemoManager engine for instant response.");
        return this.routeToDemoFallback(endpoint, options);
      }
      throw err;
    }
  },

  routeToDemoFallback(endpoint, options) {
    if (endpoint.startsWith("/api/expenses/stats")) {
      const urlParams = new URLSearchParams(endpoint.split("?")[1] || "");
      const budget = Number(urlParams.get("budget")) || 35000;
      return DemoManager.getStats(budget);
    }
    if (endpoint.startsWith("/api/expenses")) {
      if (options.method === "POST") {
        return DemoManager.createExpense(JSON.parse(options.body));
      }
      return DemoManager.getExpenses();
    }
    return Promise.resolve({ status: "success", data: [] });
  },

  /**
   * Check backend server health
   */
  async checkHealth() {
    return this.request("/api/health");
  },

  /**
   * Scan receipt image via backend Gemini Vision proxy
   * When an image is provided, ALWAYS calls the real multimodal Gemini model!
   */
  async scanReceipt(base64Image, mimeType = "image/jpeg", sampleId = null) {
    // 1-Click sample test buttons use fast pre-computed sample
    if (sampleId && window.DemoManager) {
      return DemoManager.simulateScanReceipt(sampleId);
    }

    // For any real uploaded receipt image, ALWAYS call the live Gemini Vision backend
    return this.request("/api/receipts/scan", {
      method: "POST",
      body: JSON.stringify({
        image: base64Image,
        mimeType,
      }),
    });
  },

  /**
   * Fetch all expenses
   */
  async getExpenses(options = {}) {
    if (window.DemoManager && DemoManager.isDemoMode()) {
      return DemoManager.getExpenses(options);
    }

    const params = new URLSearchParams();
    if (options.search) params.append("search", options.search);
    if (options.category && options.category !== "All") params.append("category", options.category);
    if (options.sort) params.append("sort", options.sort);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/api/expenses${query}`);
  },

  /**
   * Get dashboard aggregated stats
   */
  async getStats(budget) {
    if (window.DemoManager && DemoManager.isDemoMode()) {
      return DemoManager.getStats(budget);
    }

    const query = budget ? `?budget=${budget}` : "";
    return this.request(`/api/expenses/stats${query}`);
  },

  /**
   * Request live Gemini-powered AI Spending Intelligence analysis
   */
  async getLiveAiInsights(budget) {
    if (window.DemoManager && DemoManager.isDemoMode()) {
      const res = await DemoManager.getStats(budget);
      return { success: true, data: res.data?.aiIntelligence };
    }

    const query = budget ? `?budget=${budget}` : "";
    return this.request(`/api/expenses/ai-insights${query}`);
  },

  /**
   * Create expense
   */
  async createExpense(expenseData) {
    if (window.DemoManager && DemoManager.isDemoMode()) {
      return DemoManager.createExpense(expenseData);
    }

    return this.request("/api/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
  },

  /**
   * Update expense
   */
  async updateExpense(id, expenseData) {
    if (window.DemoManager && DemoManager.isDemoMode()) {
      return DemoManager.updateExpense(id, expenseData);
    }

    return this.request(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    });
  },

  /**
   * Delete expense
   */
  async deleteExpense(id) {
    if (window.DemoManager && DemoManager.isDemoMode()) {
      return DemoManager.deleteExpense(id);
    }

    return this.request(`/api/expenses/${id}`, {
      method: "DELETE",
    });
  },
};

window.Api = Api;
