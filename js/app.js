document.addEventListener("DOMContentLoaded", () => {

    const app = document.getElementById("app");
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const yearFrom = document.getElementById("yearFrom");
    const yearTo = document.getElementById("yearTo");
    const ratingFilter = document.getElementById("ratingFilter");
    const favoritesBtn = document.getElementById("favoritesBtn");

    let mediaList = [];
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let showFavorites = false;
    let lastRenderedList = [];
    window.lastRenderedList = lastRenderedList;

    const fetchMedia = async () => {
        try {
            const response = await fetch("data/media.json");
            if (!response.ok) throw new Error("Fetch failed");
            mediaList = await response.json();
            applyFilters();
        } catch (error) {
            console.error(error);
            app.innerHTML = "<p style='color:red'>Failed to load media</p>";
        }
    };

    window.render = (list) => {
        window.lastRenderedList = list; 
        app.innerHTML = "";

        list.forEach(item => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${item.image}"
                     alt="${item.title}"
                     onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">

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

    window.showDetail = (id) => {
        const item = mediaList.find(m => m.id === id);
        app.innerHTML = `
            <div class="detail">
                <h2>${item.title}</h2>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Year:</strong> ${item.year}</p>
                <p><strong>Rating:</strong> ${item.rating}</p>
                <p>${item.description}</p>

                <iframe 
                    width="100%" 
                    height="400"
                    src="https://www.youtube.com/embed/${item.trailerId}"
                    title="Trailer"
                    frameborder="0"
                    allowfullscreen>
                </iframe>

                <button onclick="render(lastRenderedList)">⬅ Back</button>
            </div>
        `;
    };

    window.toggleFavorite = (id) => {
        if (favorites.includes(id)) {
            favorites = favorites.filter(f => f !== id);
        } else {
            favorites.push(id);
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
        applyFilters();
    };

    window.applyFilters = () => {
        let result = [...mediaList];

        if (showFavorites) {
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

        const from = parseInt(yearFrom.value);
        const to = parseInt(yearTo.value);

        if (!isNaN(from)) result = result.filter(m => m.year >= from);
        if (!isNaN(to)) result = result.filter(m => m.year <= to);

        if (ratingFilter.value !== "all") {
            result = result.filter(m => m.rating >= ratingFilter.value);
        }

        render(result);
    };

    searchInput.addEventListener("input", applyFilters);
    typeFilter.addEventListener("change", applyFilters);
    yearFrom.addEventListener("input", applyFilters);
    yearTo.addEventListener("input", applyFilters);
    ratingFilter.addEventListener("change", applyFilters)
    favoritesBtn.addEventListener("click", () => {
        showFavorites = !showFavorites;
        favoritesBtn.textContent = showFavorites ? "📋 All Media" : "❤️ Favorites";
        applyFilters();
    });

    fetchMedia();
});


