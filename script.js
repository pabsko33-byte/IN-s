// ===== DASHBOARD : sélection d'actif =====
const marketRows = document.querySelectorAll(".market-row");
const chartSymbol = document.getElementById("chart-symbol");
const chartPrice = document.getElementById("chart-price");
const chartChange = document.getElementById("chart-change");

if (marketRows.length && chartSymbol && chartPrice && chartChange) {
  marketRows.forEach((row) => {
    row.addEventListener("click", () => {
      marketRows.forEach((r) => r.classList.remove("is-selected"));
      row.classList.add("is-selected");

      const sym = row.dataset.symbol;
      const price = row.dataset.price;
      const change = row.dataset.change;

      chartSymbol.textContent = sym;
      chartPrice.textContent =
        sym === "Bitcoin" ? `${Number(price).toLocaleString("fr-FR")} $` : `${price} pts`;
      chartChange.textContent = change;
      chartChange.style.color =
        change && change.trim().startsWith("-") ? "#fb7185" : "#f97316";
    });
  });
}

// ===== FAQ =====
document.querySelectorAll(".faq-item").forEach((item) => {
  const header = item.querySelector(".faq-header");
  const toggle = item.querySelector(".faq-toggle");

  header.addEventListener("click", () => {
    const open = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
    if (!open) item.classList.add("open");
    if (toggle) toggle.textContent = item.classList.contains("open") ? "−" : "+";
  });
});

// ===== SIMULATION =====
function computeScenario(initial, monthly, years, annualRate) {
  const months = years * 12;
  const r = annualRate / 100 / 12;
  let value = initial;
  let totalContrib = initial;

  for (let i = 0; i < months; i++) {
    value = value * (1 + r) + monthly;
    totalContrib += monthly;
  }
  return { value, totalContrib, perf: value - totalContrib };
}

const simButton = document.getElementById("sim-run");
if (simButton) {
  simButton.addEventListener("click", () => {
    const initial = Number(document.getElementById("sim-initial").value || 0);
    const monthly = Number(document.getElementById("sim-monthly").value || 0);
    const years = Number(document.getElementById("sim-years").value || 0);
    const rate = Number(document.getElementById("sim-rate").value || 0);

    if (years <= 0 || rate <= 0) {
      alert("Donne au moins un horizon et un taux > 0.");
      return;
    }

    const pessRate = rate - 2;
    const medRate = rate;
    const optRate = rate + 2;

    const pess = computeScenario(initial, monthly, years, Math.max(pessRate, 0.1));
    const med = computeScenario(initial, monthly, years, medRate);
    const opt = computeScenario(initial, monthly, years, optRate);

    function fmt(x) {
      return Math.round(x).toLocaleString("fr-FR") + " €";
    }

    document.getElementById("pess-total").textContent = fmt(pess.totalContrib);
    document.getElementById("pess-value").textContent = fmt(pess.value);
    document.getElementById("pess-perf").textContent = fmt(pess.perf);

    document.getElementById("med-total").textContent = fmt(med.totalContrib);
    document.getElementById("med-value").textContent = fmt(med.value);
    document.getElementById("med-perf").textContent = fmt(med.perf);

    document.getElementById("opt-total").textContent = fmt(opt.totalContrib);
    document.getElementById("opt-value").textContent = fmt(opt.value);
    document.getElementById("opt-perf").textContent = fmt(opt.perf);

    // barres hauteur relative
    const maxVal = Math.max(pess.value, med.value, opt.value);
    const hp = (pess.value / maxVal) * 100;
    const hm = (med.value / maxVal) * 100;
    const ho = (opt.value / maxVal) * 100;

    document.getElementById("bar-pess").style.height = `${hp}%`;
    document.getElementById("bar-med").style.height = `${hm}%`;
    document.getElementById("bar-opt").style.height = `${ho}%`;
  });
}

// ===== ASSISTANT =====
const assistantLog = document.getElementById("assistant-log");
const assistantInput = document.getElementById("assistant-input");
const assistantSend = document.getElementById("assistant-send");

const cannedAnswers = {
  "livret-etf":
    "Le livret protège les 6–12 prochains mois de dépenses. Au-delà, chaque euro laissé dessus n’est plus investi. La logique SIC : 1) coussin de sécurité sur livret, 2) socle diversifié via ETF pour le temps long.",
  horizon:
    "L’horizon, c’est la durée pendant laquelle tu peux laisser l’argent investi sans en avoir besoin. Plus l’horizon est long, plus on peut accepter de volatilité à court terme.",
  risque:
    "La tolérance au risque, ce n’est pas aimer ou non la bourse. C’est ta capacité à supporter des variations sans vendre dans la panique. On l’évalue avec des scénarios chiffrés, pas avec un feeling.",
  crypto:
    "Dans le club, la crypto est traitée comme une poche expérimentale, jamais comme le cœur du patrimoine. On travaille surtout la notion de volatilité extrême et de risque de perte totale.",
};

function appendMessage(text, from = "bot") {
  if (!assistantLog) return;
  const wrapper = document.createElement("div");
  wrapper.className = "msg " + (from === "you" ? "msg-you" : "msg-bot");
  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  assistantLog.appendChild(wrapper);
  assistantLog.scrollTop = assistantLog.scrollHeight;
}

if (assistantSend && assistantInput) {
  assistantSend.addEventListener("click", () => {
    const q = assistantInput.value.trim();
    if (!q) return;
    appendMessage(q, "you");
    assistantInput.value = "";

    // réponse simple (placeholder pour future API IA)
    let response =
      "Pour l’instant, je ne peux pas personnaliser la réponse. Le club utilisera ce module comme base pour un futur modèle d’IA côté serveur.";
    appendMessage(response, "bot");
  });

  assistantInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      assistantSend.click();
    }
  });

  document.querySelectorAll(".topic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.topic;
      const baseQuestion =
        key === "livret-etf"
          ? "Livret ou ETF pour le long terme ?"
          : key === "horizon"
          ? "Comment choisir un horizon de placement raisonnable ?"
          : key === "risque"
          ? "Comment réfléchir à ma tolérance au risque ?"
          : "Quelle place donner à la crypto dans un portefeuille étudiant ?";

      assistantInput.value = baseQuestion;
      assistantSend.click();

      const answer = cannedAnswers[key];
      if (answer) {
        appendMessage(answer, "bot");
      }
    });
  });
}
// ========== SCROLL REVEAL ==========

const sicRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const el = entry.target;

      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        // Si tu veux que ça ne se joue qu'une seule fois :
        sicRevealObserver.unobserve(el);
      }
    });
  },
  {
    threshold: 0.15, // l’élément devient visible quand ~15 % est dans l’écran
  }
);

// On cible tous les éléments à animer
document.querySelectorAll('.reveal').forEach((el) => {
  sicRevealObserver.observe(el);
});
