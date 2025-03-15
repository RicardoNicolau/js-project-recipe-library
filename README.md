# Recipe Library Website

This is a responsive website for Recipe Library, a fictional recipe collection showcasing diverse cuisines.
The project is built with HTML, CSS, and JavaScript, and demonstrates a modern design with a focus on user experience and dynamic interaction.

## Live Demo

Check out the live website at _[Recipe Library](https://my-recipe-library.netlify.app/)_

## Features

- **Responsive Design:** Adapts to various screen sizes using flexible layouts and media queries.
- **Dynamic Filtering:** Easily filter recipes by cuisine, dietary preference, cooking time, amount of ingredients, or search term.
- **Live Search:** Quickly locate recipes by typing keywords into the search bar.
- **Sorting Functionality:** Sort recipes by preparation time in ascending or descending order via dedicated buttons. The selected sort button is visually highlighted, and clicking an already selected button will unselect it and reset the order.
- **Random Recipe:** A button that highlights a random visible recipe.
- **Loader:** A loading indicator (emoji) is displayed when the page first loads until recipes are rendered, and scrolling is disabled during loading.
- **Infinite Scroll:** Initially loads recipes in batches; however, when a filter changes, all recipes are rendered so that filtering applies to the full dataset.

## Project Structure

- **index.html:** The main page displaying recipe cards with filtering, search, and sorting options.
- **style.css:** The stylesheet managing the design, layout, and responsiveness.
- **script.js:** The JavaScript file that handles fetching data from Spoonacular, caching in localStorage, dynamic filtering, sorting (by cooking time), infinite scroll, random recipe selection, loader functionality, and disabling scrolling during loading.
- **README.md:** This documentation file outlining the project details.

© 2025 Recipe Library. All Rights Reserved. | Developed & Designed by Ricardo Nicolau
