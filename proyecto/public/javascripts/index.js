window.addEventListener("scroll", () => {
  const coche = document.querySelector(".coche");
  const scrollY = window.scrollY;
  const movimiento = Math.min(scrollY / 2, window.innerWidth * 0.6);
  coche.style.transform = `translateX(${movimiento}px)`;
});
