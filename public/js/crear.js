document.addEventListener('DOMContentLoaded', () => {

    const modalErrorValidacion = new bootstrap.Modal(document.getElementById('modalErrorValidacion'));
    const textoErrorValidacion = document.getElementById('texto-error-validacion');

    const tarjetaCreador = document.getElementById('contenedor-tarjeta');
    const inputArchivos = document.getElementById('input-archivos');
    const inputArchivosExtra = document.getElementById('input-archivos-extra');
    
    const zonaDrop = document.getElementById('paso-1-upload');
    const pasoContenedorPrincipal = document.getElementById('paso-contenedor-principal');
    const columnaMedia = document.getElementById('columna-media');
    const columnaFormulario = document.getElementById('columna-formulario');
    const contenedorMedia = document.getElementById('contenedor-media-preview');
    const contenedorMiniaturas = document.getElementById('contenedor-miniaturas');
    
    const carruselElement = document.getElementById('carruselCrearMedia');
    const btnPrevCarrusel = document.getElementById('btn-prev-carrusel');
    const btnNextCarrusel = document.getElementById('btn-next-carrusel');
    
    const btnVolver = document.getElementById('btn-volver');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnAbrirModalCrear = document.getElementById('btn-abrir-modal-crear'); 
    const tituloCreador = document.getElementById('titulo-creador');
    const btnSoloTexto = document.getElementById('btn-solo-texto');
    
    const formPublicacion = document.getElementById('form-publicacion');
    const inputDescripcion = document.getElementById('input-descripcion');
    const contadorCaracteres = document.getElementById('contador-caracteres');

    const modalConfirmarDescarte = new bootstrap.Modal(document.getElementById('modalConfirmarDescarte'));
    const btnConfirmarDescarte = document.getElementById('btn-confirmar-descarte');
    
    const modalConfirmarEliminarArchivo = new bootstrap.Modal(document.getElementById('modalConfirmarEliminarArchivo'));
    const btnConfirmarEliminarArchivo = document.getElementById('btn-confirmar-eliminar-archivo');

    const modalConfirmarCrear = new bootstrap.Modal(document.getElementById('modalConfirmarCrear')); 

    let archivosLocales = []; 
    let estadoActual = 'upload'; 
    let indexArchivoAEliminar = null; 

    tarjetaCreador.classList.add('tamano-upload');

    
    if (inputArchivos) {
        inputArchivos.addEventListener('change', (e) => procesarNuevosArchivos(Array.from(e.target.files)));
    }

    if (inputArchivosExtra) {
        inputArchivosExtra.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                procesarNuevosArchivos(Array.from(e.target.files), true);
            }
        });
    }

    if (zonaDrop) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
            zonaDrop.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(evt => zonaDrop.addEventListener(evt, () => zonaDrop.classList.add('arrastrando')));
        ['dragleave', 'drop'].forEach(evt => zonaDrop.addEventListener(evt, () => zonaDrop.classList.remove('arrastrando')));

        zonaDrop.addEventListener('drop', (e) => {
            const archivos = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
            if (archivos.length > 0) procesarNuevosArchivos(archivos);
        });
    }

    function limpiarEstadoArchivos() {
        archivosLocales = [];
        inputArchivos.value = '';
        inputArchivosExtra.value = '';
        contenedorMedia.innerHTML = '';
        contenedorMiniaturas.innerHTML = '';
    }

    function mostrarError(mensaje) {
        if (textoErrorValidacion && modalErrorValidacion) {
            textoErrorValidacion.textContent = mensaje;
            modalErrorValidacion.show();
        } else {
            alert(mensaje);
        }
    }

    function validarLimiteArchivos(archivosNuevos, concatenar) {
        const LIMITE_ARCHIVOS = 8;
        let cantidadTotal = concatenar ? archivosLocales.length + archivosNuevos.length : archivosNuevos.length;

        if (cantidadTotal > LIMITE_ARCHIVOS) {
            mostrarError(`Solo puedes subir un máximo de ${LIMITE_ARCHIVOS} archivos por publicación.`);
            return false;
        }
        return true;
    }

    function procesarNuevosArchivos(archivos, concatenar = false) {

        if (!validarLimiteArchivos(archivos, concatenar)) {
            return; 
        }

        if (!concatenar) archivosLocales = archivos;
        else archivosLocales = archivosLocales.concat(archivos);
        
        actualizarInputOculto();
        renderizarVistaPreviaMedia();
        cambiarEstado('media');
    }

    function actualizarInputOculto() {
        const dt = new DataTransfer();
        archivosLocales.forEach(file => dt.items.add(file));
        inputArchivos.files = dt.files;
    }

    function actualizarBotonesCarrusel(index) {
        const total = archivosLocales.length;
        if (total <= 1) {
            btnPrevCarrusel.style.display = 'none';
            btnNextCarrusel.style.display = 'none';
        } else {
            btnPrevCarrusel.style.display = index === 0 ? 'none' : 'flex';
            btnNextCarrusel.style.display = index === total - 1 ? 'none' : 'flex';
        }
    }

    if (carruselElement) {
        carruselElement.addEventListener('slid.bs.carousel', function (e) {
            actualizarBotonesCarrusel(e.to);
        });
    }

    function renderizarVistaPreviaMedia() {
        contenedorMedia.innerHTML = '';
        contenedorMiniaturas.innerHTML = '';

        archivosLocales.forEach((archivo, index) => {
            const url = URL.createObjectURL(archivo);
            const esVideo = archivo.type.startsWith('video/');

            const divItem = document.createElement('div');
            divItem.className = `carousel-item h-100 ${index === 0 ? 'active' : ''}`;
            divItem.innerHTML = esVideo 
                ? `<video src="${url}" class="media-fit" controls></video>` 
                : `<img src="${url}" class="media-fit" alt="preview">`;
            contenedorMedia.appendChild(divItem);


            const divMini = document.createElement('div');
            divMini.className = `miniatura-item shadow-sm ${index === 0 ? 'activa' : ''}`;
            divMini.setAttribute('draggable', 'true');
            divMini.innerHTML = `
                ${esVideo ? `<video src="${url}" class="miniatura-img"></video>` : `<img src="${url}" class="miniatura-img">`}
                <button type="button" class="btn-eliminar-miniatura" data-index="${index}" title="Quitar archivo"><i class="bi bi-x"></i></button>
            `;

            divMini.addEventListener('click', (e) => {
                if(e.target.closest('.btn-eliminar-miniatura')) return;
                bootstrap.Carousel.getOrCreateInstance(carruselElement).to(index);
                document.querySelectorAll('.miniatura-item').forEach(m => m.classList.remove('activa'));
                divMini.classList.add('activa');
            });

            divMini.querySelector('.btn-eliminar-miniatura').addEventListener('click', () => {
                indexArchivoAEliminar = index;
                modalConfirmarEliminarArchivo.show();
            });

            divMini.addEventListener('dragstart', (e) => {
                if(estadoActual === 'detalles') { e.preventDefault(); return; } 
                e.dataTransfer.setData('text/plain', index);
                divMini.classList.add('dragging');
            });
            divMini.addEventListener('dragend', () => divMini.classList.remove('dragging'));
            divMini.addEventListener('dragover', (e) => { e.preventDefault(); divMini.classList.add('drag-over'); });
            divMini.addEventListener('dragleave', () => divMini.classList.remove('drag-over'));
            divMini.addEventListener('drop', (e) => {
                e.preventDefault();
                divMini.classList.remove('drag-over');
                const indexOrigen = parseInt(e.dataTransfer.getData('text/plain'));
                if (indexOrigen !== index) {
                    const [archivoMovido] = archivosLocales.splice(indexOrigen, 1);
                    archivosLocales.splice(index, 0, archivoMovido);
                    actualizarInputOculto();
                    renderizarVistaPreviaMedia();
                }
            });

            contenedorMiniaturas.appendChild(divMini);
        });

        actualizarBotonesCarrusel(0);
    }

    if (btnConfirmarEliminarArchivo) {
        btnConfirmarEliminarArchivo.addEventListener('click', () => {
            if (indexArchivoAEliminar !== null) {
                archivosLocales.splice(indexArchivoAEliminar, 1);
                actualizarInputOculto();
                modalConfirmarEliminarArchivo.hide();
                indexArchivoAEliminar = null;
                
                if (archivosLocales.length === 0) cambiarEstado('upload');
                else renderizarVistaPreviaMedia();
            }
        });
    }

    function cambiarEstado(nuevoEstado) {
        estadoActual = nuevoEstado;
        tarjetaCreador.classList.remove('tamano-upload', 'tamano-media', 'tamano-completo', 'tamano-solo-texto', 'estado-detalles');

        switch(estadoActual) {
            case 'upload':
                limpiarEstadoArchivos(); 
                tarjetaCreador.classList.add('tamano-upload');
                tituloCreador.textContent = 'Crear nueva publicación';
                zonaDrop.classList.replace('d-none', 'd-flex');
                pasoContenedorPrincipal.classList.add('d-none');
                
                if (btnVolver) btnVolver.style.display = 'none';
                if (btnSiguiente) btnSiguiente.style.display = 'none';
                if (btnAbrirModalCrear) btnAbrirModalCrear.style.display = 'none'; 
                
                if (inputDescripcion) inputDescripcion.value = '';
                actualizarContador();
                redimensionarTextarea();
                break;

            case 'media':
                tarjetaCreador.classList.add('tamano-media');
                tituloCreador.textContent = 'Recortar';
                zonaDrop.classList.replace('d-flex', 'd-none');
                pasoContenedorPrincipal.classList.remove('d-none');
                
                columnaMedia.classList.remove('d-none');
                columnaMedia.classList.add('d-flex', 'col-12');
                columnaMedia.classList.remove('col-md-7');
                
                columnaFormulario.classList.replace('d-flex', 'd-none');
                
                if (btnVolver) btnVolver.style.display = 'block';
                if (btnSiguiente) btnSiguiente.style.display = 'block';
                if (btnAbrirModalCrear) btnAbrirModalCrear.style.display = 'none'; 
                break;

            case 'detalles':
                tarjetaCreador.classList.add('tamano-completo', 'estado-detalles');
                tituloCreador.textContent = 'Crear nueva publicación';
                
                columnaMedia.classList.remove('d-none', 'col-12');
                columnaMedia.classList.add('d-flex', 'col-md-7');
                
                columnaFormulario.classList.replace('d-none', 'd-flex');
                columnaFormulario.classList.remove('col-12', 'border-0');
                columnaFormulario.classList.add('col-md-5');
                
                if (btnVolver) btnVolver.style.display = 'block';
                if (btnSiguiente) btnSiguiente.style.display = 'none';
                if (btnAbrirModalCrear) btnAbrirModalCrear.style.display = 'block'; 
                redimensionarTextarea();
                break;

            case 'solotexto':
                limpiarEstadoArchivos(); 
                tarjetaCreador.classList.add('tamano-solo-texto', 'estado-detalles');
                tituloCreador.textContent = 'Crear publicación';
                zonaDrop.classList.replace('d-flex', 'd-none');
                pasoContenedorPrincipal.classList.remove('d-none');
                
                columnaMedia.classList.remove('d-flex');
                columnaMedia.classList.add('d-none');
                
                columnaFormulario.classList.replace('d-none', 'd-flex');
                columnaFormulario.classList.remove('col-md-5');
                columnaFormulario.classList.add('col-12', 'border-0'); 
                
                if (btnVolver) btnVolver.style.display = 'block';
                if (btnSiguiente) btnSiguiente.style.display = 'none';
                if (btnAbrirModalCrear) btnAbrirModalCrear.style.display = 'block'; 
                redimensionarTextarea();
                break;
        }
    }

    if (btnSiguiente) btnSiguiente.addEventListener('click', () => cambiarEstado('detalles'));
    if (btnSoloTexto) btnSoloTexto.addEventListener('click', () => cambiarEstado('solotexto'));
    
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            if (estadoActual === 'detalles') {
                cambiarEstado('media'); 
            } else if (estadoActual === 'media' || estadoActual === 'solotexto') {
                modalConfirmarDescarte.show(); 
            }
        });
    }

    if (btnConfirmarDescarte) {
        btnConfirmarDescarte.addEventListener('click', () => {
            modalConfirmarDescarte.hide();
            cambiarEstado('upload');
        });
    }

    if (btnAbrirModalCrear) {
        btnAbrirModalCrear.addEventListener('click', () => {
            modalConfirmarCrear.show();
        });
    }

    if (formPublicacion) {
        formPublicacion.addEventListener('submit', () => {
            const btnConfirmarCrear = document.querySelector('.btn-confirmar-crear');
            if (btnConfirmarCrear) {
                btnConfirmarCrear.disabled = true;
                btnConfirmarCrear.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>...`;
            }
            if (btnVolver) btnVolver.style.display = 'none';
        });
    }

    function actualizarContador() {
        if (inputDescripcion && contadorCaracteres) {
            const len = inputDescripcion.value.length;
            contadorCaracteres.textContent = `${len}/2200`;
            contadorCaracteres.classList.toggle('text-danger', len > 2200);
        }
    }

    function redimensionarTextarea() {
        if (inputDescripcion) {
            inputDescripcion.style.height = 'auto';
            inputDescripcion.style.height = inputDescripcion.scrollHeight + 'px';
            if (inputDescripcion.scrollHeight > 400) {
                inputDescripcion.style.overflowY = 'auto';
            } else {
                inputDescripcion.style.overflowY = 'hidden';
            }
        }
    }

    if (inputDescripcion) {
        inputDescripcion.addEventListener('input', () => {
            actualizarContador();
            redimensionarTextarea();
        });
    }
});
