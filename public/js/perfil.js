document.addEventListener('DOMContentLoaded', () => {
    const pestañas = document.querySelectorAll('.pestana-perfil');
    const urlActual = window.location.href;

    pestañas.forEach(pestaña => {
        const enlace = pestaña.getAttribute('href');

        if (urlActual.includes(enlace) || (!urlActual.includes('?seccion=') && enlace.includes('seccion=publicaciones'))) {
            pestaña.classList.add('activa');
        } else {
            pestaña.classList.remove('activa');
        }
    });
});

function previsualizarImagen(evento) {
    const archivo = evento.target.files[0];
    if (archivo) {
        document.getElementById('vista-previa').src = URL.createObjectURL(archivo);
    }
}

function quitarImagenSeleccionada() {
    const inputArchivo = document.getElementById('foto_perfil');
    const vistaPrevia = document.getElementById('vista-previa');
    const contenedorBtnQuitar = document.getElementById('contenedor-btn-quitar');

    // Limpia el input file
    inputArchivo.value = '';
    
    // Restaura la imagen que tenía el usuario al abrir el modal
    vistaPrevia.src = avatarOriginalUrl;
    
    // Oculta de nuevo el botón de quitar
    contenedorBtnQuitar.classList.add('d-none');
}


document.addEventListener('DOMContentLoaded', () => {
    const modalElemento = document.getElementById('modalEditar');

    if (modalElemento) {
        modalElemento.addEventListener('hidden.bs.modal', function () {
            const form = modalElemento.querySelector('form');
            
            if (form) {
                form.reset(); // Resetea inputs de texto y vacía el input file
            }

            // Restaura la imagen original usando el atributo data
            const vistaPrevia = document.getElementById('vista-previa');
            if (vistaPrevia && vistaPrevia.dataset.originalSrc) {
                vistaPrevia.src = vistaPrevia.dataset.originalSrc;
            }

            // Oculta el botón de quitar foto nueva
            const btnQuitar = document.getElementById('contenedor-btn-quitar');
            if (btnQuitar) {
                btnQuitar.classList.add('d-none');
            }
        });
    }
});