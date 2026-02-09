const plannerForm = document.getElementById("plannerForm");
const previewMap = {
  citizenship: "Not set",
  currentResidency: "Not set",
  purpose: "Not set",
  email: "Not set",
  arrival: "Not set",
  departure: "Not set",
};

const purposeLabels = {
  tax: "Establish tax residency",
  move: "Move to Paraguay",
  both: "Both tax residency and relocation",
};

const previewElements = document.querySelectorAll("[data-preview]");
const timelineList = document.getElementById("timelineList");
const checklistList = document.getElementById("checklistList");
const documentsList = document.getElementById("documentsList");
const roadmap = document.getElementById("roadmap");
const emailStatus = document.getElementById("emailStatus");

function setPreviewValue(key, value) {
  const display = value?.trim() ? value : previewMap[key];
  previewElements.forEach((element) => {
    if (element.dataset.preview === key) {
      element.textContent = display;
    }
  });
}

plannerForm.addEventListener("input", (event) => {
  const { name, value } = event.target;
  if (!name) return;

  if (name === "purpose") {
    setPreviewValue(name, purposeLabels[value] || previewMap.purpose);
    return;
  }

  setPreviewValue(name, value);
});

plannerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(plannerForm);
  const payload = Object.fromEntries(formData.entries());

  const summary = {
    citizenship: payload.citizenship,
    currentResidency: payload.currentResidency,
    purpose: purposeLabels[payload.purpose] || payload.purpose,
    email: payload.email,
    arrival: payload.arrival,
    departure: payload.departure || "Not set",
  };

  Object.entries(summary).forEach(([key, value]) => {
    setPreviewValue(key, value);
  });

  fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to build plan.");
      }
      return response.json();
    })
    .then((plan) => {
      timelineList.innerHTML = "";
      plan.steps.forEach((step) => {
        const item = document.createElement("li");
        const dateLabel = step.targetDate ? ` (${step.targetDate})` : "";
        item.textContent = `${step.title}${dateLabel} — ${step.description}`;
        timelineList.appendChild(item);
      });

      checklistList.innerHTML = "";
      plan.checklist.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = entry;
        checklistList.appendChild(item);
      });

      documentsList.innerHTML = "";
      plan.documents.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = entry;
        documentsList.appendChild(item);
      });

      emailStatus.textContent = plan.emailNote || "Plan generated.";
      roadmap.scrollIntoView({ behavior: "smooth", block: "start" });
    })
    .catch(() => {
      timelineList.innerHTML = "<li>We could not build the plan yet.</li>";
      emailStatus.textContent = "We could not prepare your PDF yet.";
    });
});
