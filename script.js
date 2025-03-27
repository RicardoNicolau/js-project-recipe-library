// Global variables
const apiKey = "df1f683d4ed54e19a2be5417eae2a4fd";
let recipesData = []; // All fetched recipes
const recipesPerLoad = 15; // Number of recipes per load
let currentIndex = 0; // Counter for displayed recipes

// Active filters (default values)
let activeCuisine = "all";
let activeDiet = "all";
let activeSearch = "";
let activeTime = "all";
let activeIngredientsFilter = "all";

// Fetch recipes and store them in memory
async function fetchRecipes() {
  const cachedRecipes = localStorage.getItem("recipes");
  if (cachedRecipes) {
    const parsedData = JSON.parse(cachedRecipes);
    if (parsedData.recipes.length >= 75) {
      console.log("Using cached recipes");
      recipesData = parsedData.recipes;
      renderRecipes();
      return;
    } else {
      console.log("Clearing old cache (too few recipes)");
      localStorage.removeItem("recipes");
    }
  }
  // Fetch 75 recipes from API
  const url = `https://api.spoonacular.com/recipes/random?number=75&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error: " + response.status);
    const data = await response.json();
    recipesData = data.recipes;
    localStorage.setItem("recipes", JSON.stringify(data));
    renderRecipes();
  } catch (error) {
    console.error("Error fetching data:", error);
    document.querySelector(
      "#recipeContainer"
    ).innerHTML = `<p>Unable to fetch recipes. The API quota may have been exceeded.</p>`;
  }
}

// Render recipes in batches (infinite scroll mode)
function renderRecipes() {
  const container = document.querySelector("#recipeContainer");
  const recipesToShow = recipesData.slice(currentIndex, currentIndex + recipesPerLoad);
  currentIndex += recipesPerLoad;
  recipesToShow.forEach((recipe) => {
    const recipeCard = document.createElement("article");
    recipeCard.className = "card";
    // Determine cuisine
    const cuisine = recipe.cuisines?.[0]?.toLowerCase() || guessCuisine(recipe.title);
    recipeCard.setAttribute("data-cuisine", cuisine);
    // Determine dietary preferences
    let diets = [];
    if (recipe.vegan) diets.push("vegan");
    if (recipe.vegetarian) diets.push("vegetarian");
    if (recipe.glutenFree) diets.push("gluten-free");
    if (recipe.dairyFree) diets.push("dairy-free");
    if (diets.length === 0) diets.push("all");
    recipeCard.setAttribute("data-diet", diets.join(" "));
    // Add extra data attributes for sorting & filtering
    recipeCard.setAttribute("data-time", recipe.readyInMinutes || 0);
    recipeCard.setAttribute("data-popularity", recipe.aggregateLikes || 0);
    recipeCard.setAttribute("data-price", recipe.pricePerServing || 0);
    recipeCard.setAttribute("data-ingredients", recipe.extendedIngredients ? recipe.extendedIngredients.length : 0);
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>${recipe.summary}</p>
      <p class="time"><strong>Time:</strong> ${recipe.readyInMinutes} minutes</p>
    `;
    container.appendChild(recipeCard);
  });
  applyFilters();
  // If all recipes have been loaded, remove the scroll listener
  if (currentIndex >= recipesData.length) {
    window.removeEventListener("scroll", handleScroll);
  }
}

// Apply filters to currently rendered recipes
function applyFilters() {
  const recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card"));
  let visibleCount = 0;

  recipeCards.forEach((card) => {
    const cardCuisine = card.getAttribute("data-cuisine") || "all";
    const cardDiet = card.getAttribute("data-diet") || "all";
    const title = card.querySelector("h3").textContent.toLowerCase();
    const time = parseInt(card.getAttribute("data-time"), 10) || 0;
    const ingredientCount = parseInt(card.getAttribute("data-ingredients"), 10) || 0;

    // Check cuisine, diet, and search term
    const cuisineMatch = activeCuisine === "all" || cardCuisine === activeCuisine;
    const dietMatch = activeDiet === "all" || cardDiet.includes(activeDiet);
    const searchMatch = title.includes(activeSearch);

    // Check cooking time
    let timeMatch = false;
    if (activeTime === "all") timeMatch = true;
    else if (activeTime === "under15" && time < 15) timeMatch = true;
    else if (activeTime === "15to30" && time >= 15 && time <= 30) timeMatch = true;
    else if (activeTime === "30to60" && time > 30 && time <= 60) timeMatch = true;
    else if (activeTime === "over60" && time > 60) timeMatch = true;

    // Check amount of ingredients
    let ingredientsMatch = false;
    if (activeIngredientsFilter === "all") ingredientsMatch = true;
    else if (activeIngredientsFilter === "under5" && ingredientCount < 5) ingredientsMatch = true;
    else if (activeIngredientsFilter === "6to10" && ingredientCount >= 6 && ingredientCount <= 10)
      ingredientsMatch = true;
    else if (activeIngredientsFilter === "11to15" && ingredientCount >= 11 && ingredientCount <= 15)
      ingredientsMatch = true;
    else if (activeIngredientsFilter === "over16" && ingredientCount > 16) ingredientsMatch = true;

    if (cuisineMatch && dietMatch && searchMatch && timeMatch && ingredientsMatch) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Show or hide the "No recipes match your filters" message
  let noRecipesMessage = document.querySelector("#noRecipesMessage");

  if (visibleCount === 0) {
    if (!noRecipesMessage) {
      noRecipesMessage = document.createElement("p");
      noRecipesMessage.id = "noRecipesMessage";
      noRecipesMessage.textContent = "No recipes match your filters.";
      document.querySelector("#recipeContainer").appendChild(noRecipesMessage);
    }
  } else if (noRecipesMessage) {
    noRecipesMessage.remove();
  }
}

// Infinite scroll: load more recipes when near bottom
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    renderRecipes();
  }
}

// Helper: Guess cuisine from title if not provided
function guessCuisine(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("paella") || lowerTitle.includes("tortilla") || lowerTitle.includes("gazpacho")) {
    return "spanish";
  }
  if (
    lowerTitle.includes("lasagna") ||
    lowerTitle.includes("pizza") ||
    lowerTitle.includes("carbonara") ||
    lowerTitle.includes("spaghetti") ||
    lowerTitle.includes("risotto") ||
    lowerTitle.includes("ravioli")
  ) {
    return "italian";
  }
  if (
    lowerTitle.includes("burger") ||
    lowerTitle.includes("fried chicken") ||
    lowerTitle.includes("mac & cheese") ||
    lowerTitle.includes("hot dog") ||
    lowerTitle.includes("bbq") ||
    lowerTitle.includes("pancakes")
  ) {
    return "american";
  }
  if (
    lowerTitle.includes("chow mein") ||
    lowerTitle.includes("dumpling") ||
    lowerTitle.includes("fried rice") ||
    lowerTitle.includes("spring roll") ||
    lowerTitle.includes("wonton") ||
    lowerTitle.includes("peking duck")
  ) {
    return "chinese";
  }
  if (
    lowerTitle.includes("taco") ||
    lowerTitle.includes("burrito") ||
    lowerTitle.includes("enchilada") ||
    lowerTitle.includes("quesadilla") ||
    lowerTitle.includes("guacamole") ||
    lowerTitle.includes("fajita")
  ) {
    return "mexican";
  }
  return ["spanish", "italian", "american", "chinese", "mexican"][Math.floor(Math.random() * 5)];
}

// Remove loader after data is loaded and re-enable scrolling
function removeLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
  document.body.style.overflow = "auto";
}

// Reset and render all recipes from the full dataset
function resetRecipes() {
  currentIndex = 0;
  const container = document.querySelector("#recipeContainer");
  container.innerHTML = "";
  // Render all recipes (in batches) so that filters apply to the full dataset
  while (currentIndex < recipesData.length) {
    renderRecipes();
  }
}

// Setup filter event listeners and toggle selected states for buttons
function setupFiltersAndSorting() {
  // Cuisine filter: add a selected state to buttons (except for "all")
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove "selected" class from all cuisine buttons
      filterButtons.forEach((btn) => btn.classList.remove("selected"));
      // Add "selected" class if the button is not "all"
      if (button.getAttribute("data-cuisine") !== "all") {
        button.classList.add("selected");
      }
      activeCuisine = button.getAttribute("data-cuisine").toLowerCase();
      resetRecipes();
    });
  });
  // Search input
  document.getElementById("filter").addEventListener("input", function () {
    activeSearch = this.value.toLowerCase();
    resetRecipes();
  });
  // Diet filter
  document.getElementById("diet-filter").addEventListener("change", function () {
    activeDiet = this.value.toLowerCase();
    resetRecipes();
  });
  // Cooking time filter
  document.getElementById("time-filter").addEventListener("change", function () {
    activeTime = this.value;
    resetRecipes();
  });
  // Ingredients filter
  document.getElementById("ingredients-filter").addEventListener("change", function () {
    activeIngredientsFilter = this.value;
    resetRecipes();
  });
}

// Sorting: Toggle ascending/descending selection
document.getElementById("sort-asc").addEventListener("click", function () {
  if (this.classList.contains("selected")) {
    // If already selected, unselect and reset recipes to default order
    this.classList.remove("selected");
    sortRecipesDefault();
  } else {
    this.classList.add("selected");
    document.getElementById("sort-desc").classList.remove("selected");
    sortRecipes(true);
  }
});
document.getElementById("sort-desc").addEventListener("click", function () {
  if (this.classList.contains("selected")) {
    // If already selected, unselect and reset recipes to default order
    this.classList.remove("selected");
    sortRecipesDefault();
  } else {
    this.classList.add("selected");
    document.getElementById("sort-asc").classList.remove("selected");
    sortRecipes(false);
  }
});

// Reset sorting: render recipes in default order as they were loaded
function sortRecipesDefault() {
  resetRecipes();
}

// Sorting using a default sort option ("time")
function sortRecipes(ascending) {
  const container = document.querySelector("#recipeContainer");
  let recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card")).filter(
    (card) => card.style.display !== "none"
  );
  if (recipeCards.length === 0) return;
  // Remove any highlights
  document.querySelectorAll(".highlight").forEach((card) => card.classList.remove("highlight"));
  // Default sort option: "time"
  const sortOption = "time";
  recipeCards.sort((a, b) => {
    let valueA = 0;
    let valueB = 0;
    if (sortOption === "time") {
      valueA = parseInt(a.getAttribute("data-time"), 10);
      valueB = parseInt(b.getAttribute("data-time"), 10);
    } else if (sortOption === "popularity") {
      valueA = parseInt(a.getAttribute("data-popularity"), 10);
      valueB = parseInt(b.getAttribute("data-popularity"), 10);
    } else if (sortOption === "price") {
      valueA = parseFloat(a.getAttribute("data-price"));
      valueB = parseFloat(b.getAttribute("data-price"));
    } else if (sortOption === "ingredients") {
      valueA = parseInt(a.getAttribute("data-ingredients"), 10);
      valueB = parseInt(b.getAttribute("data-ingredients"), 10);
    }
    return ascending ? valueA - valueB : valueB - valueA;
  });
  // Clear container and re-append sorted cards
  container.innerHTML = "";
  recipeCards.forEach((card) => container.appendChild(card));
}

// Random recipe selection
document.getElementById("random-recipe").addEventListener("click", () => {
  let recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card")).filter(
    (card) => card.style.display !== "none"
  );
  if (recipeCards.length === 0) return;
  document.querySelectorAll(".highlight").forEach((card) => card.classList.remove("highlight"));
  const randomCard = recipeCards[Math.floor(Math.random() * recipeCards.length)];
  randomCard.scrollIntoView({ behavior: "smooth", block: "center" });
  randomCard.classList.add("highlight");
  setTimeout(() => {
    randomCard.classList.remove("highlight");
  }, 3000);
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", async function () {
  // Disable scrolling while loading
  document.body.style.overflow = "hidden";
  // Set minimum loading time (e.g., 1500 ms)
  const minLoadingTime = 1500;
  const startTime = Date.now();
  await fetchRecipes();
  setupFiltersAndSorting();
  window.addEventListener("scroll", handleScroll);
  const elapsed = Date.now() - startTime;
  const delay = Math.max(minLoadingTime - elapsed, 0);
  setTimeout(removeLoader, delay);
});
