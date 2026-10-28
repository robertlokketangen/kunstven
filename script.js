"use strict";

const STORAGE_KEYS = {
  palettes: "kunstrom-palettes",
  theme: "kunstrom-theme"
};

const tabButtons = [...document.querySelectorAll("[role='tab']")];
const tabPanels = [...document.querySelectorAll("[role='tabpanel']")];
const colourOne = document.querySelector("#colour-one");
const colourTwo = document.querySelector("#colour-two");
const savedPalettesElement = document.querySelector("#saved-palettes");
const paletteMessage = document.querySelector("#palette-message");
const themeToggle = document.querySelector(".theme-toggle");
const colourTips = [
  { title: "Fargar snakkar saman.", text: "Prøv å blande komplementærfargar for eit livleg uttrykk, eller analoge fargar for ro og samanheng." },
  { title: "Start med få fargar.", text: "Avgrens paletten til tre fargar. Det gjer det lettare å skape eit tydeleg og samla uttrykk." },
  { title: "Test fargen først.", text: "Prøv fargen på ein liten bit papir før du brukar han i heile biletet. Han kan sjå annleis ut på underlaget." },
  { title: "Skap kontrast.", text: "Set ein lys farge ved sida av ein mørk for å få motivet til å tre tydelegare fram." },
  { title: "Vel ein hovudfarge.", text: "La éin farge dominere, og bruk dei andre som små aksentar. Då veit auget kvar det skal sjå." },
  { title: "Bland mjuke overgangar.", text: "Legg litt av den eine fargen i den andre om gongen. Små steg gjer blandinga enklare å styre." },
  { title: "Finn motsetnadene.", text: "Komplementærfargar ligg motsett kvarandre i fargesirkelen og gir ekstra energi når dei møtest." },
  { title: "Hald deg nær kvarandre.", text: "Analoge fargar ligg ved sida av kvarandre i fargesirkelen og passar godt når du vil skape harmoni." },
  { title: "Tenk på bakgrunnen.", text: "Ein farge kan verke heilt ulik mot ein lys eller mørk bakgrunn. Sjå fargane saman før du bestemmer deg." },
  { title: "Lys opp med kvitt.", text: "Bland inn litt kvitt for ein lysare tone, eller litt av motsett farge for ein rolegare og mindre metta tone." }
];
let activeColourTip = 0;

const promptOptions = {
  subjects: ["Fisk", "Ugle", "Troll", "Robot", "Fyrtårn", "Skog", "Fjell", "Hav", "By", "Drage"],
  techniques: ["Blyant", "Kolstift", "Akvarell", "Akryl", "Tusj", "Digital teikning", "Kollasj"],
  colours: ["Berre kalde fargar", "Berre varme fargar", "Svart kvitt", "Maks tre fargar", "Komplementærfargar"],
  challenges: ["Må innehalde rørsle", "Må bruke kontrast", "Må vise djupn", "Må vere abstrakt", "Må fortelje ei historie", "Må vise lys og skugge"]
};

const diceOptions = {
  motifs: promptOptions.subjects,
  styles: ["Kubisme", "Impresjonisme", "Ekspresjonisme", "Popkunst", "Surrealisme", "Street Art", "Naturalisme", "Fantasy"],
  materials: ["Akvarell", "Akryl", "Leire", "Kolstift", "Tusj", "Papp", "Resirkulerte material", "Digitalt"]
};

const artPeriods = [
  { id: "renaissance", title: "Renessanse", years: "1400-1600", artist: "Leonardo da Vinci", description: "Renessansen sette mennesket i sentrum og henta inspirasjon frå antikken. Kunstnarane utforska perspektiv, anatomi og truverdig realisme.", short: "Fokus på perspektiv og realisme", icon: "fa-landmark" },
  { id: "barock", title: "Barokk", years: "1600-1750", artist: "Rembrandt", description: "Barokken ville gripe merksemda med dramatisk lys, sterke kontrastar og augeblinkar fulle av rørsle og kjensler.", short: "Dramatisk lys og sterke kontrastar", icon: "fa-lightbulb" },
  { id: "impressionism", title: "Impresjonisme", years: "1870-1890", artist: "Claude Monet", description: "Impresjonistane fanga lys, fargar og augeblinken. Dei måla gjerne ute og lét synlege penselstrøk bli ein del av uttrykket.", short: "Lys, fargar og augeblikk", icon: "fa-sun" },
  { id: "expressionism", title: "Ekspresjonisme", years: "1905-1925", artist: "Edvard Munch", description: "Ekspresjonistane brukte fargar, former og linjer for å vise indre kjensler og personlege opplevingar, heller enn å skildre verda nøyaktig.", short: "Kjensler og uttrykk", icon: "fa-face-surprise" },
  { id: "cubism", title: "Kubisme", years: "1907-1920", artist: "Pablo Picasso", description: "Kubismen braut motiv ned i geometriske former og viste fleire sider av same objekt på eitt og same bilete.", short: "Geometriske former", icon: "fa-cubes" },
  { id: "popart", title: "Popkunst", years: "1950-1970", artist: "Andy Warhol", description: "Popkunsten henta motiv frå reklame, teikneseriar og kvardagsliv. Ho stilte spørsmål ved skiljet mellom populærkultur og kunst.", short: "Populærkultur som kunst", icon: "fa-star" },
  { id: "streetart", title: "Street Art", years: "1980-", artist: "Banksy", description: "Street art flyttar kunsten ut i det offentlege rommet. Veggar, gater og byrom blir flater for sterke bodskap og møte med eit breitt publikum.", short: "Kunst i offentlege rom", icon: "fa-spray-can-sparkles" }
];

// Keep saved settings local to this browser and recover gracefully from invalid storage.
function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function chooseRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / delta) % 6; break;
      case g: h = (b - r) / delta + 2; break;
      default: h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

function hslToHex({ h, s, l }) {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hueSection = h / 60;
  const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const offset = l - chroma / 2;
  let rgb;

  if (hueSection < 1) rgb = [chroma, secondary, 0];
  else if (hueSection < 2) rgb = [secondary, chroma, 0];
  else if (hueSection < 3) rgb = [0, chroma, secondary];
  else if (hueSection < 4) rgb = [0, secondary, chroma];
  else if (hueSection < 5) rgb = [secondary, 0, chroma];
  else rgb = [chroma, 0, secondary];

  return rgbToHex({ r: (rgb[0] + offset) * 255, g: (rgb[1] + offset) * 255, b: (rgb[2] + offset) * 255 });
}

function updateColourWorkshop() {
  const firstHex = colourOne.value.toUpperCase();
  const secondHex = colourTwo.value.toUpperCase();
  const firstRgb = hexToRgb(firstHex);
  const secondRgb = hexToRgb(secondHex);
  const mixed = {
    r: (firstRgb.r + secondRgb.r) / 2,
    g: (firstRgb.g + secondRgb.g) / 2,
    b: (firstRgb.b + secondRgb.b) / 2
  };
  const mixedHex = rgbToHex(mixed);
  const hsl = rgbToHsl(mixed);
  const complementary = hslToHex({ ...hsl, h: (hsl.h + 180) % 360 });
  const analogousOne = hslToHex({ ...hsl, h: (hsl.h + 30) % 360 });
  const analogousTwo = hslToHex({ ...hsl, h: (hsl.h + 330) % 360 });

  document.querySelector(".mix-first").style.backgroundColor = firstHex;
  document.querySelector(".mix-second").style.backgroundColor = secondHex;
  document.querySelector(".mix-result-dot").style.backgroundColor = mixedHex;
  document.querySelector("#colour-one-value").textContent = firstHex;
  document.querySelector("#colour-two-value").textContent = secondHex;
  document.querySelector("#mix-hex").textContent = mixedHex;
  document.querySelector("#mix-rgb").textContent = `RGB ${Math.round(mixed.r)}, ${Math.round(mixed.g)}, ${Math.round(mixed.b)}`;
  document.querySelector("#colour-relations").innerHTML = [
    { label: "Komplementær", colour: complementary },
    { label: "Analog", colour: analogousOne },
    { label: "Analog", colour: analogousTwo }
  ].map(({ label, colour }) => `<div class="relation-swatch" style="background-color:${colour}"><span>${label} ${colour}</span></div>`).join("");
}

function showNextColourTip() {
  activeColourTip = (activeColourTip + 1) % colourTips.length;
  const tip = colourTips[activeColourTip];
  document.querySelector("#colour-tip-title").textContent = tip.title;
  document.querySelector("#colour-tip-text").textContent = tip.text;
  document.querySelector("#colour-tip-count").textContent = `TIPS ${String(activeColourTip + 1).padStart(2, "0")} / ${colourTips.length}`;
}

function renderPalettes() {
  const palettes = readStorage(STORAGE_KEYS.palettes, []);
  document.querySelector("#palette-count").textContent = String(palettes.length);
  if (!palettes.length) {
    savedPalettesElement.innerHTML = '<p class="empty-state">Palettane dine kjem til å dukke opp her.</p>';
    return;
  }

  savedPalettesElement.innerHTML = palettes.map((palette) => `
    <article class="palette-card">
      <div class="palette-colours" aria-label="Fargane i paletten ${escapeHtml(palette.name)}">${palette.colours.map((colour) => `<span style="background-color:${colour}" title="${colour}"></span>`).join("")}</div>
      <div class="palette-meta"><strong>${escapeHtml(palette.name)}</strong><span class="palette-hex">${palette.colours.map((colour) => colour.slice(1)).join(" · ")}</span><button class="delete-palette" type="button" data-delete-palette="${palette.id}" aria-label="Slett paletten ${escapeHtml(palette.name)}"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button></div>
    </article>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function savePalette() {
  const palettes = readStorage(STORAGE_KEYS.palettes, []);
  const nameInput = document.querySelector("#palette-name");
  const name = nameInput.value.trim() || `Palett ${palettes.length + 1}`;
  palettes.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    colours: [colourOne.value.toUpperCase(), colourTwo.value.toUpperCase(), document.querySelector("#mix-hex").textContent]
  });

  if (!writeStorage(STORAGE_KEYS.palettes, palettes)) {
    paletteMessage.textContent = "Kunne ikkje lagre paletten i denne nettlesaren.";
    return;
  }
  nameInput.value = "";
  paletteMessage.textContent = `«${name}» er lagra.`;
  renderPalettes();
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggle.innerHTML = `<i class="fa-regular ${isDark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
  themeToggle.setAttribute("aria-label", isDark ? "Byt til lys modus" : "Byt til mørk modus");
  writeStorage(STORAGE_KEYS.theme, theme);
}

function setActiveTab(tabName, moveFocus = false) {
  tabButtons.forEach((button) => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  tabPanels.forEach((panel) => {
    const active = panel.dataset.panel === tabName;
    panel.hidden = !active;
    panel.classList.toggle("is-visible", active);
  });
  if (moveFocus) document.querySelector(`#tab-${tabName}`).focus();
}

function generatePrompt() {
  const subject = chooseRandom(promptOptions.subjects);
  const article = { Ugle: "Ei", Troll: "Eit", Fyrtårn: "Eit", Fjell: "Eit", Hav: "Eit" }[subject] || "Ein";
  document.querySelector("#prompt-subject").textContent = `${article} ${subject.toLowerCase()}`;
  document.querySelector("#prompt-technique").textContent = chooseRandom(promptOptions.techniques);
  document.querySelector("#prompt-colour").textContent = chooseRandom(promptOptions.colours);
  document.querySelector("#prompt-challenge").textContent = chooseRandom(promptOptions.challenges);
  const card = document.querySelector("#prompt-card");
  card.classList.remove("is-refreshing");
  requestAnimationFrame(() => card.classList.add("is-refreshing"));
  const count = Number(document.querySelector("#prompt-index").dataset.count || 1) + 1;
  document.querySelector("#prompt-index").dataset.count = String(count);
  document.querySelector("#prompt-index").textContent = `IDÉ ${String(count).padStart(2, "0")}`;
}

function rollDice() {
  const stage = document.querySelector("#dice-stage");
  stage.classList.remove("is-rolling");
  document.querySelector("#dice-message").textContent = "Terningane er i lufta …";
  requestAnimationFrame(() => stage.classList.add("is-rolling"));
  window.setTimeout(() => {
    document.querySelector("#die-motif").textContent = chooseRandom(diceOptions.motifs);
    document.querySelector("#die-style").textContent = chooseRandom(diceOptions.styles);
    document.querySelector("#die-material").textContent = chooseRandom(diceOptions.materials);
    document.querySelector("#dice-message").textContent = "Der har du noko å jobbe vidare med!";
  }, 420);
}

function renderTimeline() {
  document.querySelector("#timeline-track").innerHTML = artPeriods.map((period) => `
    <button class="era-card" type="button" data-era="${period.id}" aria-label="Les meir om ${period.title}, ${period.years}">
      <span class="era-art ${period.id}" aria-hidden="true"><i class="fa-solid ${period.icon}"></i></span>
      <span class="era-info"><span class="era-years">${period.years}</span><h3>${period.title}</h3><p>${period.short}</p><span class="era-artist"><i class="fa-regular fa-user" aria-hidden="true"></i>${period.artist}</span></span>
    </button>`).join("");
}

function openPeriod(periodId) {
  const period = artPeriods.find((item) => item.id === periodId);
  if (!period) return;
  document.querySelector("#modal-years").textContent = period.years;
  document.querySelector("#modal-title").textContent = period.title;
  document.querySelector("#modal-artist").textContent = `Kunstnar: ${period.artist}`;
  document.querySelector("#modal-description").textContent = period.description;
  document.querySelector("#modal-art").className = `modal-art ${period.id}`;
  document.querySelector("#art-modal").showModal();
  document.querySelector("#modal-close").focus();
}

// Tabs support both pointer activation and the expected arrow-key navigation.
tabButtons.forEach((button, index) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  button.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabButtons.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabButtons[nextIndex].dataset.tab, true);
  });
});

colourOne.addEventListener("input", updateColourWorkshop);
colourTwo.addEventListener("input", updateColourWorkshop);
document.querySelector("#next-colour-tip").addEventListener("click", showNextColourTip);
document.querySelector("#save-palette").addEventListener("click", savePalette);
document.querySelector("#palette-name").addEventListener("keydown", (event) => {
  if (event.key === "Enter") savePalette();
});
savedPalettesElement.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-palette]");
  if (!button) return;
  const updated = readStorage(STORAGE_KEYS.palettes, []).filter((palette) => palette.id !== button.dataset.deletePalette);
  writeStorage(STORAGE_KEYS.palettes, updated);
  renderPalettes();
});
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});
document.querySelector("#generate-prompt").addEventListener("click", generatePrompt);
document.querySelector("#roll-dice").addEventListener("click", rollDice);
document.querySelector("#timeline-track").addEventListener("click", (event) => {
  const card = event.target.closest("[data-era]");
  if (card) openPeriod(card.dataset.era);
});
document.querySelectorAll(".timeline-scroll").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#timeline-viewport").scrollBy({ left: button.dataset.direction === "right" ? 440 : -440, behavior: "smooth" });
  });
});
document.querySelector("#modal-close").addEventListener("click", () => document.querySelector("#art-modal").close());
document.querySelector("#art-modal").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

setTheme(readStorage(STORAGE_KEYS.theme, "light"));
updateColourWorkshop();
renderPalettes();
renderTimeline();
