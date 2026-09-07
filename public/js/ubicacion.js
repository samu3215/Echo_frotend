document.addEventListener('DOMContentLoaded', () => {
  const rutaActual = window.location.pathname;
  const botones = document.querySelectorAll('.opcion-menu-lateral, .enlace-icono-movil');

  botones.forEach(boton => {
    const enlace = boton.getAttribute('href');


    if (enlace === rutaActual || (enlace !== '/' && rutaActual.startsWith(enlace))) {
      boton.classList.add('activo');
    } else {
      boton.classList.remove('activo');
    }
  });
});