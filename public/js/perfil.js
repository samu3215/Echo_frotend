let cropper = null;

document.addEventListener('DOMContentLoaded', () => {
    // Gestor de pestañas del perfil
    const pagina = document.querySelectorAll('.pestana-perfil');
    const urlActual = window.location.href;

    pagina.forEach(pag => {
        const enlace = pag.getAttribute('href');
        if (urlActual.includes(enlace) || (!urlActual.includes('?seccion=') && enlace.includes('seccion=publicaciones'))) {
            pag.classList.add('activa');
        } else {
            pag.classList.remove('activa');
        }
    });

    // Event Listeners (sin onclicks/onchange en el HTML)
    const inputFoto = document.getElementById('foto_perfil');
    const btnQuitarFoto = document.getElementById('btn-quitar-foto');
    const btnCancelarRecorte = document.getElementById('btn-cancelar-recorte');
    const btnConfirmarRecorte = document.getElementById('btn-confirmar-recorte');
    const modalElemento = document.getElementById('modalEditar');

    if (inputFoto) {
        inputFoto.addEventListener('change', iniciarEditorImagen);
    }

    if (btnQuitarFoto) {
        btnQuitarFoto.addEventListener('click', quitarImagenSeleccionada);
    }

    if (btnCancelarRecorte) {
        btnCancelarRecorte.addEventListener('click', cancelarRecorte);
    }

    if (btnConfirmarRecorte) {
        btnConfirmarRecorte.addEventListener('click', confirmarRecorte);
    }

    if (modalElemento) {
        modalElemento.addEventListener('hidden.bs.modal', function () {
            const form = modalElemento.querySelector('form');
            if (form) form.reset();
            quitarImagenSeleccionada();
        });
    }
});

function iniciarEditorImagen(evento) {
    const archivos = evento.target.files;
    if (archivos && archivos.length > 0) {
        const archivo = archivos[0];
        const urlImagen = URL.createObjectURL(archivo);
        
        const imagenTarget = document.getElementById('imagen-para-recortar');
        imagenTarget.src = urlImagen;

        document.getElementById('seccion-avatar-normal').classList.add('d-none');
        document.getElementById('seccion-editor-imagen').classList.remove('d-none');

        if (cropper) {
            cropper.destroy();
        }

        // Configuración para evitar márgenes o espacios en blanco fuera de la imagen
        cropper = new Cropper(imagenTarget, {
            aspectRatio: 1,
            viewMode: 1, // Fuerza a que la imagen o el marco no se salgan del espacio contenedor
            dragMode: 'move',
            autoCropArea: 0.9,
            restore: false,
            guides: false,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            background: false // Desactiva el fondo cuadriculado predeterminado de Cropper
        });
    }
}

function confirmarRecorte() {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400
    });

    canvas.toBlob((blob) => {
        const inputArchivo = document.getElementById('foto_perfil');
        const archivoRecortado = new File([blob], "avatar_recortado.png", { type: "image/png" });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(archivoRecortado);
        inputArchivo.files = dataTransfer.files;

        const vistaPrevia = document.getElementById('vista-previa');
        vistaPrevia.src = URL.createObjectURL(blob);

        document.getElementById('contenedor-btn-quitar').classList.remove('d-none');

        cancelarRecorte();
    });
}

function cancelarRecorte() {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    document.getElementById('seccion-editor-imagen').classList.add('d-none');
    document.getElementById('seccion-avatar-normal').classList.remove('d-none');
}

function quitarImagenSeleccionada() {
    const inputArchivo = document.getElementById('foto_perfil');
    const vistaPrevia = document.getElementById('vista-previa');
    const contenedorBtnQuitar = document.getElementById('contenedor-btn-quitar');

    if (inputArchivo) inputArchivo.value = '';
    
    if (vistaPrevia && vistaPrevia.dataset.originalSrc) {
        vistaPrevia.src = vistaPrevia.dataset.originalSrc;
    }
    
    if (contenedorBtnQuitar) {
        contenedorBtnQuitar.classList.add('d-none');
    }

    cancelarRecorte();
}