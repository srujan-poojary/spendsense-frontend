// SpendSense - Receipt Scanner Controller
const ReceiptScanner = {
  selectedFile: null,
  extractedData: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("receiptInput");
    const uploadBtn = document.getElementById("uploadBtn");
    const saveBtn = document.getElementById("saveExpense");
    const addItemBtn = document.getElementById("addItemBtn");
    const cancelScanBtn = document.getElementById("cancelScanBtn");
    const changeImageBtn = document.getElementById("changeImageBtn");

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", () => fileInput.click());
    }

    if (changeImageBtn && fileInput) {
      changeImageBtn.addEventListener("click", () => fileInput.click());
    }

    if (dropZone && fileInput) {
      dropZone.addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
          fileInput.click();
        }
      });

      ["dragenter", "dragover"].forEach((evt) => {
        dropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("drag-over");
        });
      });

      ["dragleave", "dragend"].forEach((evt) => {
        dropZone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("drag-over");
        });
      });

      dropZone.addEventListener("drop", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("drag-over");
        const file = e.dataTransfer?.files?.[0];
        if (file) this.handleFile(file);
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) this.handleFile(file);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveExpense());
    }

    if (addItemBtn) {
      addItemBtn.addEventListener("click", () => this.addItemRow("", 0));
    }

    if (cancelScanBtn) {
      cancelScanBtn.addEventListener("click", () => this.resetScanner());
    }
  },

  /**
   * 1-Click Fast Sample Receipt Scanner
   */
  async triggerSampleScan(sampleId) {
    const emptyPlaceholder = document.getElementById("scannerEmptyPlaceholder");
    const reviewCard = document.getElementById("receiptReviewCard");
    const pipelineStatus = document.getElementById("pipelineStatus");
    const stepCompress = document.getElementById("stepCompress");
    const stepOcr = document.getElementById("stepOcr");
    const stepExtract = document.getElementById("stepExtract");

    if (emptyPlaceholder) emptyPlaceholder.style.display = "none";
    if (reviewCard) reviewCard.style.display = "none";
    if (pipelineStatus) pipelineStatus.style.display = "block";

    // Fast animated step progression
    if (stepCompress) {
      stepCompress.className = "pipeline-step completed";
      stepCompress.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>1. Sample Receipt Cached & Ready</span>`;
    }

    if (stepOcr) {
      stepOcr.className = "pipeline-step active";
      stepOcr.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> <span>2. Gemini Multimodal OCR extracting line items...</span>`;
    }

    try {
      const response = await Api.scanReceipt(null, null, sampleId);
      const extracted = response.data;
      this.extractedData = extracted;

      if (stepOcr) {
        stepOcr.className = "pipeline-step completed";
        stepOcr.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>2. Gemini OCR parsed lines & totals</span>`;
      }

      if (stepExtract) {
        stepExtract.className = "pipeline-step completed";
        stepExtract.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>3. Itemized Breakdown Ready</span>`;
      }

      setTimeout(() => {
        this.populateReviewForm(extracted);
        UI.toast(`Extracted ${extracted.merchant} (${Utils.formatCurrency(extracted.amount)})! Review and save.`, "success");
      }, 250);
    } catch (err) {
      console.error("Sample scan error:", err);
      UI.toast(err.message || "Failed to scan sample receipt.", "error");
    }
  },

  async handleFile(file) {
    if (!file.type.startsWith("image/")) {
      UI.toast("Please upload a valid receipt image (JPEG, PNG, WEBP).", "warning");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      UI.toast("File size exceeds 15MB limit. Please choose a smaller image.", "error");
      return;
    }

    this.selectedFile = file;

    // Show image preview
    const previewContainer = document.getElementById("previewContainer");
    const preview = document.getElementById("receiptPreview");
    if (previewContainer && preview) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
      previewContainer.style.display = "block";
    }

    // Hide review form and placeholder
    const reviewCard = document.getElementById("receiptReviewCard");
    const emptyPlaceholder = document.getElementById("scannerEmptyPlaceholder");
    if (reviewCard) reviewCard.style.display = "none";
    if (emptyPlaceholder) emptyPlaceholder.style.display = "none";

    // Trigger AI Scan
    await this.scanReceipt();
  },

  async scanReceipt() {
    if (!this.selectedFile) return;

    const pipelineStatus = document.getElementById("pipelineStatus");
    const stepCompress = document.getElementById("stepCompress");
    const stepOcr = document.getElementById("stepOcr");
    const stepExtract = document.getElementById("stepExtract");

    if (pipelineStatus) pipelineStatus.style.display = "block";

    // Stage 1: Compression
    if (stepCompress) {
      stepCompress.className = "pipeline-step active";
      stepCompress.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> <span>1. Optimizing receipt image...</span>`;
    }

    try {
      const compressed = await Utils.compressImage(this.selectedFile, 1600, 1600, 0.85);
      const base64 = await Utils.fileToBase64(compressed);

      if (stepCompress) {
        stepCompress.className = "pipeline-step completed";
        stepCompress.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>1. Image optimized (${Math.round(compressed.size / 1024)} KB)</span>`;
      }

      // Stage 2: OCR with Gemini
      if (stepOcr) {
        stepOcr.className = "pipeline-step active";
        stepOcr.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> <span>2. Gemini Vision OCR extracting merchant & lines...</span>`;
      }

      const response = await Api.scanReceipt(base64, compressed.type);
      const extracted = response.data;
      this.extractedData = extracted;

      if (stepOcr) {
        stepOcr.className = "pipeline-step completed";
        stepOcr.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>2. Gemini OCR parsed: ${Utils.escapeHtml(extracted.merchant)} (${Utils.formatCurrency(extracted.amount)})</span>`;
      }

      // Stage 3: Structured formatting
      if (stepExtract) {
        stepExtract.className = "pipeline-step completed";
        stepExtract.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>3. ${extracted.items?.length || 1} line items extracted</span>`;
      }

      setTimeout(() => {
        this.populateReviewForm(extracted);
        UI.toast(`Receipt parsed! Found ${extracted.items?.length || 0} items from ${extracted.merchant}.`, "success");
      }, 300);
    } catch (err) {
      console.error("Receipt scan failed:", err);
      if (stepOcr) {
        stepOcr.className = "pipeline-step";
        stepOcr.style.color = "var(--accent-rose)";
        stepOcr.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> <span>OCR failed: ${Utils.escapeHtml(err.message)}</span>`;
      }
      UI.toast(err.message || "Failed to scan receipt. Please check server connection.", "error", 6000);
    }
  },

  populateReviewForm(data) {
    const reviewCard = document.getElementById("receiptReviewCard");
    const emptyPlaceholder = document.getElementById("scannerEmptyPlaceholder");
    if (!reviewCard) return;

    if (emptyPlaceholder) emptyPlaceholder.style.display = "none";

    const merchantInput = document.getElementById("reviewMerchant");
    const categorySelect = document.getElementById("reviewCategory");
    const dateInput = document.getElementById("reviewDate");
    const amountInput = document.getElementById("reviewAmount");
    const itemsContainer = document.getElementById("receiptItemsList");
    const categoryBadge = document.getElementById("extractedCategoryBadge");

    if (merchantInput) merchantInput.value = data.merchant || "";
    if (categorySelect) categorySelect.value = data.category || "Other";
    if (categoryBadge) categoryBadge.textContent = data.category || "Other";
    if (dateInput) dateInput.value = data.purchase_date || new Date().toISOString().split("T")[0];
    if (amountInput) amountInput.value = data.amount || 0;

    // Render items
    if (itemsContainer) {
      itemsContainer.innerHTML = "";
      if (data.items && data.items.length > 0) {
        data.items.forEach((item) => this.addItemRow(item.name, item.price));
      } else {
        this.addItemRow(data.merchant || "General Item", data.amount || 0);
      }
    }

    reviewCard.style.display = "block";
    reviewCard.scrollIntoView({ behavior: "smooth", block: "start" });
  },

  addItemRow(name = "", price = 0) {
    const container = document.getElementById("receiptItemsList");
    if (!container) return;

    const row = document.createElement("div");
    row.className = "item-row";
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.alignItems = "center";
    row.innerHTML = `
      <input type="text" class="input-control item-name" placeholder="Item description" value="${Utils.escapeHtml(name)}" style="flex: 2;">
      <div style="flex: 1; position: relative;">
        <input type="number" step="0.01" class="input-control item-price" placeholder="0.00" value="${price}">
      </div>
      <button type="button" class="action-btn delete-btn remove-item-btn" title="Remove Item">
        <i class="bi bi-trash"></i>
      </button>
    `;

    // Recalculate total when item prices change
    row.querySelector(".item-price").addEventListener("input", () => this.recalculateTotal());
    row.querySelector(".remove-item-btn").addEventListener("click", () => {
      row.remove();
      this.recalculateTotal();
    });

    container.appendChild(row);
  },

  recalculateTotal() {
    const itemPrices = document.querySelectorAll("#receiptItemsList .item-price");
    let sum = 0;
    itemPrices.forEach((input) => {
      sum += parseFloat(input.value) || 0;
    });

    const amountInput = document.getElementById("reviewAmount");
    if (amountInput && sum > 0) {
      amountInput.value = sum.toFixed(2);
    }
  },

  async saveExpense() {
    const merchant = document.getElementById("reviewMerchant")?.value.trim();
    const category = document.getElementById("reviewCategory")?.value;
    const purchase_date = document.getElementById("reviewDate")?.value;
    const amount = parseFloat(document.getElementById("reviewAmount")?.value || 0);

    if (!merchant) {
      UI.toast("Please enter a merchant name.", "warning");
      return;
    }

    if (!amount || amount <= 0) {
      UI.toast("Total amount must be greater than zero.", "warning");
      return;
    }

    // Gather line items
    const items = [];
    document.querySelectorAll("#receiptItemsList .item-row").forEach((row) => {
      const name = row.querySelector(".item-name")?.value.trim() || "Item";
      const price = parseFloat(row.querySelector(".item-price")?.value || 0);
      items.push({ name, price });
    });

    const saveBtn = document.getElementById("saveExpense");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `Saving...`;
    }

    try {
      await Api.createExpense({
        merchant,
        category,
        purchase_date,
        amount,
        items,
      });

      UI.toast(`Expense of ${Utils.formatCurrency(amount)} recorded!`, "success");

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (err) {
      console.error("Save expense error:", err);
      UI.toast(err.message || "Failed to save expense. Please try again.", "error");
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="bi bi-check-lg"></i> Save Expense`;
      }
    }
  },

  resetScanner() {
    this.selectedFile = null;
    this.extractedData = null;

    const fileInput = document.getElementById("receiptInput");
    if (fileInput) fileInput.value = "";

    const previewContainer = document.getElementById("previewContainer");
    const preview = document.getElementById("receiptPreview");
    if (preview) preview.src = "";
    if (previewContainer) previewContainer.style.display = "none";

    const reviewCard = document.getElementById("receiptReviewCard");
    if (reviewCard) reviewCard.style.display = "none";

    const pipelineStatus = document.getElementById("pipelineStatus");
    if (pipelineStatus) pipelineStatus.style.display = "none";

    const emptyPlaceholder = document.getElementById("scannerEmptyPlaceholder");
    if (emptyPlaceholder) emptyPlaceholder.style.display = "block";
  },
};

window.ReceiptScanner = ReceiptScanner;
