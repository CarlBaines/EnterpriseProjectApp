// DOM elements
const backArrow = document.querySelector('.back-arrow');
const searchIcon = document.querySelector('.search-icon');




// Event listeners
if(backArrow){
    backArrow.addEventListener('click', () => {
        window.location.href = 'homepage.html';
    });
}

if(searchIcon){
    searchIcon.addEventListener('click', () => {
        alert("Search functionality is not implemented yet.");
    });
}