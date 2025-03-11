document.addEventListener('DOMContentLoaded', function() {
  // Filter by cuisine buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  const recipeSections = document.querySelectorAll('.recipe-card');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedCuisine = button.getAttribute('data-cuisine').toLowerCase();
      recipeSections.forEach(section => {
        if (selectedCuisine === 'all' || section.getAttribute('data-cuisine').toLowerCase() === selectedCuisine) {
          section.style.display = 'grid';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });

  // Search functionality 
  const searchInput = document.getElementById('filter');
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    recipeSections.forEach(section => {
      section.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(searchTerm) ? '' : 'none';
      });
    });
  });

  // Sort recipes by time using two separate buttons
  const sortAscBtn = document.getElementById('sort-asc');
  const sortDescBtn = document.getElementById('sort-desc');

  sortAscBtn.addEventListener('click', () => {
    recipeSections.forEach(section => {
      const cardsArray = Array.from(section.querySelectorAll('.card'));
      cardsArray.sort((a, b) => {
        const timeA = parseInt(a.querySelector('.time').textContent.match(/\d+/)[0], 10);
        const timeB = parseInt(b.querySelector('.time').textContent.match(/\d+/)[0], 10);
        return timeA - timeB;
      });
      // Append sorted cards back to section
      cardsArray.forEach(card => section.appendChild(card));
    });
  });

  sortDescBtn.addEventListener('click', () => {
    recipeSections.forEach(section => {
      const cardsArray = Array.from(section.querySelectorAll('.card'));
      cardsArray.sort((a, b) => {
        const timeA = parseInt(a.querySelector('.time').textContent.match(/\d+/)[0], 10);
        const timeB = parseInt(b.querySelector('.time').textContent.match(/\d+/)[0], 10);
        return timeB - timeA;
      });
      cardsArray.forEach(card => section.appendChild(card));
    });
  });
});