document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.getElementById('buscador-global');
    const paginas = document.querySelectorAll('.pagina');
    const urlActual = window.location.href;

    // Mantener la pestaña activa
    paginas.forEach(pagina => {
        const enlace = pagina.getAttribute('href');
        if (urlActual.includes(enlace) || (!urlActual.includes('?seccion=') && enlace.includes('seccion=publicaciones'))) {
            pagina.classList.add('activa');
        } else {
            pagina.classList.remove('activa');
        }
    });

    function filtrarEnTiempoReal() {
        if (!buscador) return;
        const texto = buscador.value.toLowerCase().trim();

        // A) Filtrar Personas y Negocios
        document.querySelectorAll('.tarjeta').forEach(tarjeta => {
            const titulo = tarjeta.querySelector('.titulo')?.textContent.toLowerCase() || '';
            const username = tarjeta.querySelector('.username')?.textContent.toLowerCase() || '';
            const mostrar = titulo.includes(texto) || username.includes(texto);
            tarjeta.classList.toggle('d-none', !mostrar);
        });

        // B) Filtrar Comunidades (Soluciona el problema de la clase d-flex)
        document.querySelectorAll('.tarjeta-comunidad').forEach(tarjeta => {
            const nombre = tarjeta.querySelector('.nombre-comunidad')?.textContent.toLowerCase() || '';
            const descripcion = tarjeta.querySelector('.descripcion-comunidad')?.textContent.toLowerCase() || '';
            const mostrar = nombre.includes(texto) || descripcion.includes(texto);
            tarjeta.classList.toggle('d-none', !mostrar);
        });

        // C) Filtrar Publicaciones
        document.querySelectorAll('.tarjeta-publicacion').forEach(tarjeta => {
            const autor = tarjeta.querySelector('.card-header .fw-bold')?.textContent.toLowerCase() || '';
            const descripcion = tarjeta.querySelector('.descripcion-post span.text-dark')?.textContent.toLowerCase() || '';
            const mostrar = autor.includes(texto) || descripcion.includes(texto);
            tarjeta.classList.toggle('d-none', !mostrar);
        });
    }

    if (buscador) {
        buscador.addEventListener('input', filtrarEnTiempoReal);
        // Evitar que el Enter recargue la página
        buscador.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });
    }
});