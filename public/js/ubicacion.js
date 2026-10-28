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

document.addEventListener("DOMContentLoaded", () => {
    async function chequearNotificaciones() {
        // Seleccionamos TODOS los globos (escritorio y móvil)
        const globosNotificaciones = document.querySelectorAll('.globo-notificaciones-badge');
        if (globosNotificaciones.length === 0) return;
        
        try {
            const respuesta = await fetch('/api/notificaciones/conteo');
            if (respuesta.ok) {
                const data = await respuesta.json();
                
                globosNotificaciones.forEach(globo => {
                    if (data.sin_leer > 0) {
                        globo.innerText = data.sin_leer;
                        globo.classList.remove('d-none');
                    } else {
                        globo.classList.add('d-none');
                    }
                });
            }
        } catch (error) {
            console.error("Error obteniendo notificaciones", error);
        }
    }

    chequearNotificaciones();
    setInterval(chequearNotificaciones, 30000);
});