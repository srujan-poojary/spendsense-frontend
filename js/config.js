// SpendSense - Frontend Configuration
const CONFIG = {
  // Public Supabase configuration (safe for client-side usage with RLS)
  SUPABASE_URL: "https://blhsniiwarnghmggficb.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaHNuaWl3YXJuZ2htZ2dmaWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MDg3MTMsImV4cCI6MjExMTA4NDcxM30.zS5HFLARIFInNFeIaMtqttcCkrqMK4gj12tQnNpwa9E",

  // SpendSense Backend API URL
  // Local: uses http://localhost:3000
  // Production (Vercel): point to your deployed Render backend service URL
  API_URL:
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? (window.location.port === "3000" ? window.location.origin : "http://localhost:3000")
      : "https://spendsense-backend.onrender.com",

  // Default monthly budget in INR (₹)
  DEFAULT_MONTHLY_BUDGET: 20000,
};

window.CONFIG = CONFIG;
