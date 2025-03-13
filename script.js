// Global variables
const apiKey = "df1f683d4ed54e19a2be5417eae2a4fd";
let recipesData = []; // Store all fetched recipes
const recipesPerLoad = 15; // Antal recept att visa vid start och vid scroll
let currentIndex = 0; // Håller koll på hur många recept som visats

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
      localStorage.removeItem("recipes"); // Tar bort felaktig cache
    }
  }

  // Hämta 75 recept från API
  const url = `https://api.spoonacular.com/recipes/random?number=75&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error: " + response.status);

    const data = await response.json();
    recipesData = data.recipes;
    localStorage.setItem("recipes", JSON.stringify(data)); // Spara cache
    renderRecipes();
  } catch (error) {
    console.error("Error fetching data:", error);
    document.querySelector(
      "#recipeContainer"
    ).innerHTML = `<p>Unable to fetch recipes. The API quota may have been exceeded.</p>`;
  }
}

// Render recipes incrementally
function renderRecipes() {
  const container = document.querySelector("#recipeContainer");

  // Ladda fler recept baserat på index
  const recipesToShow = recipesData.slice(currentIndex, currentIndex + recipesPerLoad);
  currentIndex += recipesPerLoad;

  recipesToShow.forEach((recipe) => {
    const recipeCard = document.createElement("article");
    recipeCard.className = "card";
    const cuisine = recipe.cuisines?.[0]?.toLowerCase() || guessCuisine(recipe.title);
    recipeCard.setAttribute("data-cuisine", cuisine);
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>${recipe.summary}</p>
      <p class="time"><strong>Time:</strong> ${recipe.readyInMinutes} minutes</p>
    `;
    container.appendChild(recipeCard);
  });

  // Om alla recept är visade, ta bort scroll-eventet
  if (currentIndex >= recipesData.length) {
    window.removeEventListener("scroll", handleScroll);
  }
}

// Detect scroll to bottom and load more recipes
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    renderRecipes();
  }
}

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

// Setup filtering, sorting, and search
function setupFiltersAndSorting() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCuisine = button.getAttribute("data-cuisine").toLowerCase();
      const recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card"));

      // Ta bort highlight från alla kort vid filtrering
      document.querySelectorAll(".highlight").forEach((card) => card.classList.remove("highlight"));

      if (selectedCuisine === "all") {
        window.addEventListener("scroll", handleScroll);
        recipeCards.forEach((card) => {
          card.style.display = "";
        });
      } else {
        window.removeEventListener("scroll", handleScroll);

        // Filtrera kort baserat på kategori
        recipeCards.forEach((card) => {
          const cardCuisine = card.getAttribute("data-cuisine") || "other";
          card.style.display = cardCuisine === selectedCuisine ? "" : "none";
        });
      }
    });
  });

  // Search Functionality
  document.getElementById("filter").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card"));

    // Ta bort highlight vid sökning
    document.querySelectorAll(".highlight").forEach((card) => card.classList.remove("highlight"));

    recipeCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = title.includes(searchTerm) ? "" : "none";
    });
  });
}

// Sort recipes
document.getElementById("sort-asc").addEventListener("click", () => sortRecipes(true));
document.getElementById("sort-desc").addEventListener("click", () => sortRecipes(false));

function sortRecipes(ascending) {
  const container = document.querySelector("#recipeContainer");
  let recipeCards = Array.from(document.querySelectorAll("#recipeContainer .card")).filter(
    (card) => card.style.display !== "none"
  );

  if (recipeCards.length === 0) return;

  // Ta bort highlight vid sortering
  document.querySelectorAll(".highlight").forEach((card) => card.classList.remove("highlight"));

  recipeCards.sort((a, b) => {
    const timeA = parseInt(a.querySelector(".time").textContent.match(/\d+/)[0], 10);
    const timeB = parseInt(b.querySelector(".time").textContent.match(/\d+/)[0], 10);
    return ascending ? timeA - timeB : timeB - timeA;
  });

  container.innerHTML = "";
  recipeCards.forEach((card) => container.appendChild(card));
}

// Random Recipe Button
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

// Run functions on page load
document.addEventListener("DOMContentLoaded", async function () {
  await fetchRecipes();
  setupFiltersAndSorting();
  window.addEventListener("scroll", handleScroll);
});
