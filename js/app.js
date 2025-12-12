const app = document.getElementById("app");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const yearFromInput = document.getElementById("yearFrom");
const yearToInput = document.getElementById("yearTo");
const ratingFilter = document.getElementById("ratingFilter");
const favoritesBtn = document.getElementById("favoritesBtn");

let mediaList = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let showingFavorites = false;

// Fetch Data
const fetchMedia = async () => {
    try {
        const res = await fetch("data/media.json");
        mediaList = await res.json();
        render(mediaList);
    } catch (error) {
        app.innerHTML = "<p>Failed to load data.</p>";
    }

// Render cards
const render = (list) => {
    app.innerHTML = "";
    list.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="card-content">
                <h3>${item.title}</h3>
                <p>${item.type} • ${item.year}</p>
                <p>⭐ ${item.rating}</p>
                <button onclick="showDetail(${item.id})">Details</button>
                <button onclick="toggleFavorite(${item.id})">
                    ${favorites.includes(item.id) ? "❤️ Remove Favorite" : "🤍 Add Favorite"}
                </button>
            </div>
        `;
        app.appendChild(card);
    });
};

// Detail view
window.showDetail = (id) => {
    const item = mediaList.find(m => m.id === id);
    app.innerHTML = `
        <div class="detail">
            <h2>${item.title}</h2>
            <p><strong>Type:</strong> ${item.type}</p>
            <p><strong>Year:</strong> ${item.year}</p>
            <p><strong>Rating:</strong> ${item.rating}</p>
            <p>${item.description}</p>
            <button onclick="render(mediaList)">⬅ Back</button>
        </div>
    `;
};

// Favorites
window.toggleFavorite = (id) => {
    favorites.includes(id)
        ? favorites = favorites.filter(f => f !== id)
        : favorites.push(id);

    localStorage.setItem("favorites", JSON.stringify(favorites));
    applyFilters();
};

// Filters
const applyFilters = () => {
    let result = [...mediaList];

    if (showingFavorites) {
        result = result.filter(m => favorites.includes(m.id));
    }

    if (searchInput.value) {
        result = result.filter(m =>
            m.title.toLowerCase().includes(searchInput.value.toLowerCase())
        );
    }

    if (typeFilter.value !== "all") {
        result = result.filter(m => m.type === typeFilter.value);
    }

    const yearFrom = parseInt(yearFromInput.value);
    const yearTo = parseInt(yearToInput.value);

    if (!isNaN(yearFrom)) {
         result = result.filter(m => m.year >= yearFrom);
}

if (!isNaN(yearTo)) {
    result = result.filter(m => m.year <= yearTo);
}

    if (ratingFilter.value !== "all") {
        result = result.filter(m => m.rating >= ratingFilter.value);
    }

    render(result);
};

// Events
searchInput.addEventListener("input", applyFilters);
typeFilter.addEventListener("change", applyFilters);
yearFromInput.addEventListener("input", applyFilters);
yearToInput.addEventListener("input", applyFilters);
ratingFilter.addEventListener("change", applyFilters);

favoritesBtn.addEventListener("click", () => {
    showingFavorites = !showingFavorites;
    favoritesBtn.textContent = showingFavorites ? "📋 All Media" : "❤️ Favorites";
    applyFilters();
});

// Init
fetchMedia();
