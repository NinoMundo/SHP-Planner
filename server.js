import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";
const referencePath = path.join(__dirname, "data", "residency-reference.json");
const referenceData = JSON.parse(fs.readFileSync(referencePath, "utf-8"));
const templatePath = process.env.PDF_TEMPLATE_PATH || "";

app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

function addDays(dateString, days) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildPlan(input, reference) {
  const arrival = input.arrival || null;
  const departure = input.departure || null;
  const purpose = input.purpose;
  const timeline = reference.timelines[purpose] || reference.timelines.both;

  return {
    summary: {
      citizenship: input.citizenship,
      currentResidency: input.currentResidency,
      purposeLabel: reference.purposeLabels[purpose] || purpose,
      arrival,
      departure,
    },
    steps: timeline.map((step) => ({
      ...step,
      targetDate: addDays(arrival, step.offsetDays),
    })),
    checklist: reference.checklist,
    documents: reference.documents,
  };
}

app.post("/api/plan", (req, res) => {
  const { citizenship, currentResidency, purpose, arrival, departure } = req.body || {};

  if (!citizenship || !currentResidency || !purpose || !arrival) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  const plan = buildPlan(
    { citizenship, currentResidency, purpose, arrival, departure },
    referenceData
  );

  res.json(plan);
});

app.post("/api/submit", (req, res) => {
  const { citizenship, currentResidency, purpose, arrival, departure, email } = req.body || {};

  if (!citizenship || !currentResidency || !purpose || !arrival || !email) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  const plan = buildPlan(
    { citizenship, currentResidency, purpose, arrival, departure },
    referenceData
  );

  const templateReady = templatePath && fs.existsSync(templatePath);

  res.json({
    ...plan,
    emailStatus: templateReady
      ? "queued"
      : "pending_template",
    emailNote: templateReady
      ? "PDF generation will run once SES is configured."
      : "Waiting on PDF template and SES configuration.",
  });
});

app.listen(port, host, () => {
  console.log(`SHP Planner running on http://${host}:${port}`);
});
