const btn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

// 🔥 Auto-hide navbar on scroll
let lastScroll = 0;
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  let currentScroll = window.pageYOffset;
  if (currentScroll <= 0) {
    navbar.style.transform = "translateY(0)";
    return;
  }
  if (currentScroll > lastScroll) {
    // scroll down → hide
    navbar.style.transform = "translateY(-100%)";
  } else {
    // scroll up → show
    navbar.style.transform = "translateY(0)";
  }
  lastScroll = currentScroll;
});
