document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.getElementById('buscador');
    const paginas = document.querySelectorAll('.pagina');

    const urlActual = window.location.href;


    paginas.forEach(pagina => {
        const enlace = pagina.getAttribute('href');

        if (urlActual.includes(enlace) || (!urlActual.includes('?seccion=') && enlace.includes('seccion=publicaciones'))) {
            pagina.classList.add('activa');
        } else {
            pagina.classList.remove('activa');
        }

        pagina.addEventListener('click', (e) => {
            const texto = buscador ? buscador.value.trim() : '';

            if (texto !== '') {
                e.preventDefault();
                window.location.href = enlace + '&q=' + encodeURIComponent(texto);
            }
        });
    });

    
    if (urlActual.includes('q=')) {
        const textoGuardado = urlActual.split('q=')[1];
        if (buscador && textoGuardado) {

            buscador.value = decodeURIComponent(textoGuardado);
        }
    }

    function filtrar() {
        if (!buscador) return;
        const texto = buscador.value.toLowerCase().trim();

        document.querySelectorAll('.tarjeta').forEach(tarjeta => {
            const titulo = tarjeta.querySelector('.titulo')?.textContent.toLowerCase() || '';
            const username = tarjeta.querySelector('.username')?.textContent.toLowerCase() || '';

            if (titulo.includes(texto) || username.includes(texto)) {
                tarjeta.classList.remove('filtro');
            } else {
                tarjeta.classList.add('filtro');
            }
        });
    }

    if (buscador) {
        buscador.addEventListener('input', filtrar);
    }
    filtrar();
});