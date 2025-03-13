document.addEventListener("DOMContentLoaded", async function () {
  await fetchRecipes();
  setupFiltersAndSorting();
});

// Helper function: Guess the cuisine based on the recipe title
function guessCuisine(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("paella") || lowerTitle.includes("tortilla") || lowerTitle.includes("gazpacho")) {
    return "spanish";
  }
  if (
    lowerTitle.includes("lasagna") ||
    lowerTitle.includes("pizza") ||
    lowerTitle.includes("carbonara") ||
    lowerTitle.includes("spaghetti")
  ) {
    return "italian";
  }
  if (lowerTitle.includes("burger") || lowerTitle.includes("fried chicken") || lowerTitle.includes("mac & cheese")) {
    return "american";
  }
  if (
    lowerTitle.includes("meatballs") ||
    lowerTitle.includes("raggmunk") ||
    lowerTitle.includes("köttbullar") ||
    lowerTitle.includes("svensk")
  ) {
    return "swedish";
  }
  // If nothing matches, randomly return one of the four cuisines
  const cuisines = ["spanish", "italian", "american", "swedish"];
  return cuisines[Math.floor(Math.random() * cuisines.length)];
}

// Fetches recipes from the Spoonacular API with caching
async function fetchRecipes() {
  // Check if there are cached recipes in localStorage
  const cachedRecipes = localStorage.getItem("recipes");
  if (cachedRecipes) {
    console.log("Using cached recipes");
    const data = JSON.parse(cachedRecipes);
    renderRecipes(data);
    return;
  }

  const apiKey = "df1f683d4ed54e19a2be5417eae2a4fd";
  const url = `https://api.spoonacular.com/recipes/random?number=5&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network error: " + response.status);
    }
    const data = await response.json();
    // Save the fetched recipes in localStorage
    localStorage.setItem("recipes", JSON.stringify(data));
    renderRecipes(data);
  } catch (error) {
    console.error("Error fetching data: ", error);
    const container = document.querySelector("#recipeContainer");
    container.innerHTML = `<p>Unable to fetch recipes. The API quota may have been exceeded.</p>`;
  }
}

// Renders recipe cards from the fetched data
function renderRecipes(data) {
  const container = document.querySelector("#recipeContainer");
  container.innerHTML = "";
  data.recipes.forEach((recipe) => {
    const recipeCard = document.createElement("article");
    recipeCard.className = "card";
    // Attempt to get the cuisine from the API data, otherwise guess based on the title
    const cuisine =
      recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines[0].toLowerCase() : guessCuisine(recipe.title);
    recipeCard.setAttribute("data-cuisine", cuisine);
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>${recipe.summary}</p>
      <p class="time"><strong>Time:</strong> ${recipe.readyInMinutes} minutes</p>
    `;
    container.appendChild(recipeCard);
  });
}

// Sets up filter, search, sort, and random recipe functionality
function setupFiltersAndSorting() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  let recipeCards = document.querySelectorAll("#recipeContainer .card");

  // Filter: Display only cards with the selected cuisine
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCuisine = button.getAttribute("data-cuisine").toLowerCase();
      recipeCards.forEach((card) => {
        const cardCuisine = card.getAttribute("data-cuisine") || "other";
        if (selectedCuisine === "all" || cardCuisine === selectedCuisine) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Search: Filter cards based on the recipe title
  const searchInput = document.getElementById("filter");
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    recipeCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = title.includes(searchTerm) ? "" : "none";
    });
  });

  // Sort: Sort cards by preparation time in ascending order
  const sortAscBtn = document.getElementById("sort-asc");
  const sortDescBtn = document.getElementById("sort-desc");

  sortAscBtn.addEventListener("click", () => {
    const container = document.querySelector("#recipeContainer");
    recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card"));
    recipeCards.sort((a, b) => {
      const timeA = parseInt(a.querySelector(".time").textContent.match(/\d+/)[0], 10);
      const timeB = parseInt(b.querySelector(".time").textContent.match(/\d+/)[0], 10);
      return timeA - timeB;
    });
    container.innerHTML = "";
    recipeCards.forEach((card) => container.appendChild(card));
  });

  // Sort: Sort cards by preparation time in descending order
  sortDescBtn.addEventListener("click", () => {
    const container = document.querySelector("#recipeContainer");
    recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card"));
    recipeCards.sort((a, b) => {
      const timeA = parseInt(a.querySelector(".time").textContent.match(/\d+/)[0], 10);
      const timeB = parseInt(b.querySelector(".time").textContent.match(/\d+/)[0], 10);
      return timeB - timeA;
    });
    container.innerHTML = "";
    recipeCards.forEach((card) => container.appendChild(card));
  });

  // Random Recipe: Scroll to a randomly selected recipe and highlight it
  const randomBtn = document.getElementById("random-recipe");
  randomBtn.addEventListener("click", () => {
    recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card"));
    if (recipeCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * recipeCards.length);
      const randomCard = recipeCards[randomIndex];
      randomCard.scrollIntoView({ behavior: "smooth", block: "center" });
      randomCard.classList.add("highlight");
      setTimeout(() => {
        randomCard.classList.remove("highlight");
      }, 2000);
    }
  });
}
