let cropperPortada = null;

document.addEventListener('DOMContentLoaded', () => {
    const inputFoto = document.getElementById('input-foto-comunidad');
    const btnQuitarFoto = document.getElementById('btn-quitar-foto');
    const btnCancelarRecorte = document.getElementById('btn-cancelar-recorte');
    const btnConfirmarRecorte = document.getElementById('btn-confirmar-recorte');

    if (inputFoto) inputFoto.addEventListener('change', procesarImagenSubida);
    if (btnQuitarFoto) btnQuitarFoto.addEventListener('click', quitarImagenPortada);
    if (btnCancelarRecorte) btnCancelarRecorte.addEventListener('click', cancelarRecorte);
    if (btnConfirmarRecorte) btnConfirmarRecorte.addEventListener('click', confirmarRecorte);

    // --- FIX SCROLL ESCRITORIO (Solo para ratón/mouse, no interfiere en táctil/móvil) ---
    const scrollContainer = document.querySelector('.contenedor-categorias-scroll');
    if (scrollContainer) {
        let isDown = false, startX, scrollLeft, isDragging = false;

        // Desactivar arrastre nativo de HTML5 sobre enlaces/botones
        scrollContainer.addEventListener('dragstart', (e) => e.preventDefault());

        // Detectar si el dispositivo utiliza puntero de precisión (mouse de PC)
        const esMouse = window.matchMedia('(pointer: fine)').matches;

        if (esMouse) {
            scrollContainer.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // Solo clic primario
                isDown = true;
                isDragging = false;
                scrollContainer.classList.add('active');
                startX = e.pageX - scrollContainer.offsetLeft;
                scrollLeft = scrollContainer.scrollLeft;
            });

            scrollContainer.addEventListener('mouseleave', () => { 
                isDown = false; 
                scrollContainer.classList.remove('active'); 
            });

            scrollContainer.addEventListener('mouseup', () => { 
                isDown = false; 
                scrollContainer.classList.remove('active'); 
            });

            scrollContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - scrollContainer.offsetLeft;
                const walk = (x - startX) * 2; 
                if (Math.abs(walk) > 5) {
                    isDragging = true; 
                }
                scrollContainer.scrollLeft = scrollLeft - walk;
            });

            scrollContainer.addEventListener('click', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);
        }

        // Scroll con la rueda del ratón en PC
        scrollContainer.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            scrollContainer.scrollLeft += evt.deltaY;
        }, { passive: false });
    }


    
});

// --- LÓGICA DE CROPPER ---
function procesarImagenSubida(evento) {
    const archivos = evento.target.files;
    if (archivos && archivos.length > 0) {
        const urlImagen = URL.createObjectURL(archivos[0]);
        const img = new Image();
        img.onload = function() {
            if (img.width >= img.height) {
                const vistaPrevia = document.getElementById('preview-foto-comunidad');
                vistaPrevia.src = urlImagen;
                vistaPrevia.classList.remove('d-none');
                const placeholder = document.getElementById('placeholder-portada');
                if (placeholder) placeholder.classList.add('d-none');
                document.getElementById('contenedor-btn-quitar').classList.remove('d-none');
                document.getElementById('quitar_foto').value = 'false';
            } else {
                abrirEditorRecorte(urlImagen);
            }
        };
        img.src = urlImagen;
    }
}

function abrirEditorRecorte(urlImagen) {
    const imagenTarget = document.getElementById('imagen-para-recortar');
    imagenTarget.src = urlImagen;
    document.getElementById('seccion-portada-normal').classList.add('d-none');
    document.getElementById('seccion-editor-imagen').classList.remove('d-none');
    if (cropperPortada) cropperPortada.destroy();
    cropperPortada = new Cropper(imagenTarget, { aspectRatio: 16 / 9, viewMode: 1, dragMode: 'move', autoCropArea: 0.9, background: false });
}

function confirmarRecorte() {
    if (!cropperPortada) return;
    const canvas = cropperPortada.getCroppedCanvas({ width: 800, height: 450 });
    canvas.toBlob((blob) => {
        const inputArchivo = document.getElementById('input-foto-comunidad');
        const archivoRecortado = new File([blob], "portada_comunidad.png", { type: "image/png" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(archivoRecortado);
        inputArchivo.files = dataTransfer.files;
        const vistaPrevia = document.getElementById('preview-foto-comunidad');
        vistaPrevia.src = URL.createObjectURL(blob);
        vistaPrevia.classList.remove('d-none');
        const placeholder = document.getElementById('placeholder-portada');
        if (placeholder) placeholder.classList.add('d-none');
        document.getElementById('contenedor-btn-quitar').classList.remove('d-none');
        document.getElementById('quitar_foto').value = 'false';
        cancelarRecorte();
    });
}

function cancelarRecorte() {
    if (cropperPortada) { cropperPortada.destroy(); cropperPortada = null; }
    document.getElementById('seccion-editor-imagen').classList.add('d-none');
    document.getElementById('seccion-portada-normal').classList.remove('d-none');
}

function quitarImagenPortada() {
    const inputArchivo = document.getElementById('input-foto-comunidad');
    const vistaPrevia = document.getElementById('preview-foto-comunidad');
    const placeholder = document.getElementById('placeholder-portada');
    const contenedorBtnQuitar = document.getElementById('contenedor-btn-quitar');
    const inputQuitarFoto = document.getElementById('quitar_foto'); 
    if (inputArchivo) inputArchivo.value = '';
    vistaPrevia.src = '';
    vistaPrevia.classList.add('d-none');
    if (placeholder) placeholder.classList.remove('d-none');
    if (contenedorBtnQuitar) contenedorBtnQuitar.classList.add('d-none');
    if (inputQuitarFoto) inputQuitarFoto.value = 'true';
    cancelarRecorte();
}