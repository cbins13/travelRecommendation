// Get all navigation links
const navLinks = document.querySelectorAll("nav a");

// Get the current URL path
const currentPath = window.location.pathname;

// Loop through each link and add the 'active' class if it matches the current path
navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPath.split("/").pop()) {
    link.classList.add("active");
  }
});

// Fetch travel data and render a few sample recommendations
document.addEventListener("DOMContentLoaded", () => {
  const homeSection = document.getElementById("home");
  if (!homeSection) return;

  // Always create and style the results container dynamically
  const resultsContainer = document.createElement("div");
  resultsContainer.id = "results";
  // Position and layout: right half, stacked by columns, with 500px min card width
  resultsContainer.style.position = "absolute";
  resultsContainer.style.top = "15%";
  resultsContainer.style.right = "0";
  resultsContainer.style.width = "50%";
  resultsContainer.style.padding = "16px";
  resultsContainer.style.boxSizing = "border-box";
  resultsContainer.style.zIndex = "4";
  resultsContainer.style.display = "grid";
  resultsContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(500px, 1fr))";
  resultsContainer.style.gap = "24px";
  resultsContainer.style.color = "#000"; // Force black text within results
  homeSection.appendChild(resultsContainer);

  function createCard(item) {
    const card = document.createElement("article");
    card.style.border = "1px solid #e0e0e0";
    card.style.borderRadius = "8px";
    card.style.overflow = "hidden";
    card.style.background = "#fff";
    card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
    card.style.width = "100%";
    card.style.minWidth = "500px";
    card.style.minHeight = "500px";
    card.style.boxSizing = "border-box";
    card.style.display = "flex";
    card.style.flexDirection = "column";

    const img = document.createElement("img");
    img.src = item.imageUrl || "";
    img.alt = item.name || "destination";
    img.style.width = "100%";
    img.style.height = "300px";
    img.style.objectFit = "cover";

    const body = document.createElement("div");
    body.style.padding = "12px";

    const title = document.createElement("h4");
    title.textContent = item.name || "Unknown";
    title.style.margin = "0 0 8px";

    const desc = document.createElement("p");
    desc.textContent = item.description || "";
    desc.style.margin = "0";
    desc.style.fontSize = "0.9rem";
    desc.style.lineHeight = "1.3";

    body.appendChild(title);
    body.appendChild(desc);
    card.appendChild(img);
    card.appendChild(body);

    // Placeholder Visit button (no listener attached)
    const visitBtn = document.createElement("button");
    visitBtn.type = "button";
    visitBtn.textContent = "Visit";
    visitBtn.style.margin = "12px";
    visitBtn.style.alignSelf = "flex-start";
    visitBtn.style.padding = "10px 16px";
    visitBtn.style.border = "none";
    visitBtn.style.borderRadius = "6px";
    visitBtn.style.background = "#333";
    visitBtn.style.color = "#fff";
    card.appendChild(visitBtn);

    return card;
  }

  function clearResults() {
    resultsContainer.innerHTML = "";
  }

  function renderItems(items) {
    clearResults();
    items.forEach(item => resultsContainer.appendChild(createCard(item)));
  }

  // Cache data after fetch; display only on Search click
  let travelData = null;
  fetch("./travel_recommendation_api.json")
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load JSON: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log("Travel data loaded:", data);
      travelData = data;
    })
    .catch(error => {
      console.error("Error loading travel_recommendation_api.json:", error);
    });

  // Wire up Search and Clear buttons
  const searchContainer = document.querySelector("nav .search");
  if (!searchContainer) return;
  const searchInput = searchContainer.querySelector("input");
  const buttons = searchContainer.querySelectorAll("button");
  const searchButton = buttons[0];
  const clearButton = buttons[1];

  function normalizeKeyword(value) {
    if (!value) return "";
    const v = value.trim().toLowerCase();
    // handle common plural forms
    if (v === "beach" || v === "beaches") return "beach";
    if (v === "temple" || v === "temples") return "temple";
    if (v === "country" || v === "countries") return "country";
    return v;
  }

  function handleSearch() {
    if (!travelData) return;
    const keyword = normalizeKeyword(searchInput ? searchInput.value : "");
    if (!keyword) {
      clearResults();
      return;
    }

    let results = [];

    if (keyword === "beach") {
      const list = Array.isArray(travelData.beaches) ? travelData.beaches : [];
      results = list.slice(0, 2);
    } else if (keyword === "temple") {
      const list = Array.isArray(travelData.temples) ? travelData.temples : [];
      results = list.slice(0, 2);
    } else if (keyword === "country") {
      // Aggregate cities across all countries and show at least two
      const countries = Array.isArray(travelData.countries) ? travelData.countries : [];
      const allCities = countries.flatMap(c => Array.isArray(c.cities) ? c.cities : []);
      results = allCities.slice(0, 2);
    } else {
      // Try to match a country by name (case-insensitive, partial match)
      const countries = Array.isArray(travelData.countries) ? travelData.countries : [];
      const matched = countries.find(c => typeof c.name === "string" && c.name.toLowerCase().includes(keyword));
      if (matched && Array.isArray(matched.cities)) {
        results = matched.cities.slice(0, 2);
      } else {
        results = [];
      }
    }

    renderItems(results);
  }

  if (searchButton) {
    searchButton.addEventListener("click", (e) => {
      e.preventDefault();
      handleSearch();
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (searchInput) searchInput.value = "";
      clearResults();
      if (searchInput) searchInput.focus();
    });
  }
});

