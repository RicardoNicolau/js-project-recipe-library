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

// Fetches recipes from the Spoonacular API and creates dynamic recipe cards
async function fetchRecipes() {
  const apiKey = "c5c4e2b5531549d3b016638fbc5ec320";
  const url = `https://api.spoonacular.com/recipes/random?number=5&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network error: " + response.status);
    }
    const data = await response.json();
    console.log(data);

    const container = document.querySelector("#recipeContainer");
    container.innerHTML = "";

    data.recipes.forEach((recipe) => {
      const recipeCard = document.createElement("article");
      recipeCard.className = "card";
      // Try to get the cuisine from the API, otherwise guess based on the title
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
  } catch (error) {
    console.error("Error fetching data: ", error);
    const container = document.querySelector("#recipeContainer");
    container.innerHTML = `<p>Unable to fetch recipes. The API quota may have been exceeded.</p>`;
  }
}
