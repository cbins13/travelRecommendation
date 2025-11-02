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

