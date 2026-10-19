let cropper = null;

const STORAGE_KEY_SEGUIMIENTO = 'echo_estado_seguimiento';

function leerEstadosSeguimiento() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_SEGUIMIENTO) || '{}');
    } catch (error) {
        return {};
    }
}

function guardarEstadoSeguimiento(usuarioDestino, siguiendo) {
    const estados = leerEstadosSeguimiento();
    estados[usuarioDestino] = Boolean(siguiendo);
    localStorage.setItem(STORAGE_KEY_SEGUIMIENTO, JSON.stringify(estados));
}

function aplicarEstadoSeguimientoAlBoton(boton, siguiendo) {
    if (!boton) return;

    const estado = Boolean(siguiendo);
    boton.dataset.siguiendo = String(estado);
    boton.classList.toggle('activo', estado);
    boton.textContent = estado ? 'Siguiendo' : 'Seguir';
    boton.disabled = boton.dataset.usuario === document.body.dataset.usuarioActual;
}

function sincronizarBotonesSeguimiento(usuarioDestino, siguiendo) {
    const botonesCompatibles = document.querySelectorAll(`.btn-seguir[data-usuario="${usuarioDestino}"], .btn-accion-busqueda[data-usuario="${usuarioDestino}"]`);

    botonesCompatibles.forEach((botonRelacionado) => {
        aplicarEstadoSeguimientoAlBoton(botonRelacionado, siguiendo);
    });
}

function registrarNotificacionSeguimiento(usuarioDestino, usuarioActual, siguiendo) {
    if (!usuarioDestino || !usuarioActual || usuarioDestino === usuarioActual || !siguiendo) {
        return;
    }

    const notificaciones = JSON.parse(localStorage.getItem('echo_notificaciones') || '[]');
    const mensaje = `${usuarioActual} ha empezado a seguirte`;
    const yaExiste = notificaciones.some((notificacion) => {
        return notificacion.tipo === 'seguimiento'
            && notificacion.para === usuarioDestino
            && notificacion.usuario === usuarioActual
            && notificacion.mensaje === mensaje;
    });

    if (yaExiste) {
        return;
    }

    notificaciones.unshift({
        id: Date.now() + Math.random(),
        tipo: 'seguimiento',
        para: usuarioDestino,
        usuario: usuarioActual,
        perfil: usuarioDestino,
        mensaje,
        fecha: new Date().toISOString(),
        leida: false
    });

    localStorage.setItem('echo_notificaciones', JSON.stringify(notificaciones.slice(0, 50)));
}

document.addEventListener('DOMContentLoaded', () => {
    const estados = leerEstadosSeguimiento();
    document.querySelectorAll('.btn-seguir, .btn-accion-busqueda').forEach((boton) => {
        const usuarioDestino = boton.dataset.usuario;
        if (!usuarioDestino) return;

        const estadoPersistido = Object.prototype.hasOwnProperty.call(estados, usuarioDestino)
            ? estados[usuarioDestino]
            : boton.dataset.siguiendo === 'true';

        aplicarEstadoSeguimientoAlBoton(boton, estadoPersistido);
    });

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
    const modalEditarResena = document.getElementById('modalEditarResena');

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

    const estrellas = document.querySelectorAll('#modalCalificar .estrella-calificacion');
    if (estrellas.length) {
        estrellas.forEach((estrella) => {
            estrella.addEventListener('click', () => {
                const valorSeleccionado = Number(estrella.dataset.value);
                const radios = document.querySelectorAll('#modalCalificar input[name="puntuacion"]');

                radios.forEach((radio) => {
                    radio.checked = Number(radio.value) === valorSeleccionado;
                });

                estrellas.forEach((item) => {
                    item.classList.toggle('activa', Number(item.dataset.value) <= valorSeleccionado);
                });
            });
        });
    }

    const estrellasEdicion = document.querySelectorAll('#modalEditarResena .estrella-calificacion');
    if (estrellasEdicion.length) {
        estrellasEdicion.forEach((estrella) => {
            estrella.addEventListener('click', () => {
                const valorSeleccionado = Number(estrella.dataset.value);
                const radios = document.querySelectorAll('#modalEditarResena input[name="puntuacion"]');

                radios.forEach((radio) => {
                    radio.checked = Number(radio.value) === valorSeleccionado;
                });

                estrellasEdicion.forEach((item) => {
                    item.classList.toggle('activa', Number(item.dataset.value) <= valorSeleccionado);
                });
            });
        });
    }

    if (modalEditarResena) {
        modalEditarResena.addEventListener('show.bs.modal', function (evento) {
            const boton = evento.relatedTarget;
            if (!boton) return;

            const form = modalEditarResena.querySelector('form');
            const resenaId = boton.dataset.resenaId;
            const puntuacion = Number(boton.dataset.puntuacion || 0);
            const descripcion = boton.dataset.descripcion || '';
            const perfilUsuario = boton.dataset.perfilUsuario || '';

            if (!form) return;

            form.action = `/perfil/${perfilUsuario}/resenas/${resenaId}/editar`;
            form.querySelector('textarea[name="descripcion"]').value = descripcion;

            const radios = form.querySelectorAll('input[name="puntuacion"]');
            radios.forEach((radio) => {
                radio.checked = Number(radio.value) === puntuacion;
            });

            const estrellasDelModal = form.querySelectorAll('.estrella-calificacion');
            estrellasDelModal.forEach((item) => {
                item.classList.toggle('activa', Number(item.dataset.value) <= puntuacion);
            });
        });

        modalEditarResena.addEventListener('hidden.bs.modal', function () {
            const form = modalEditarResena.querySelector('form');
            if (form) {
                form.reset();
                const estrellasDelModal = form.querySelectorAll('.estrella-calificacion');
                estrellasDelModal.forEach((item) => item.classList.remove('activa'));
            }
        });
    }

    const formCalificar = document.getElementById('formCalificar');
    if (formCalificar) {
        formCalificar.addEventListener('submit', function () {
            const usuarioActual = document.body.dataset.usuarioActual;
            if (!usuarioActual || usuarioActual === 'Tú') return;

            const perfilDestinatario = window.location.pathname.split('/perfil/')[1] || '';
            if (!perfilDestinatario) return;

            const notificaciones = JSON.parse(localStorage.getItem('echo_notificaciones') || '[]');
            const nuevaNotificacion = {
                id: Date.now() + Math.random(),
                tipo: 'resena',
                para: perfilDestinatario,
                usuario: usuarioActual,
                perfil: perfilDestinatario,
                mensaje: `Tienes una reseña nueva de ${usuarioActual}`,
                fecha: new Date().toISOString(),
                leida: false
            };

            notificaciones.unshift(nuevaNotificacion);
            localStorage.setItem('echo_notificaciones', JSON.stringify(notificaciones.slice(0, 50)));
        });
    }

    const botonesSeguir = document.querySelectorAll('.btn-seguir, .btn-accion-busqueda');
    botonesSeguir.forEach((boton) => {
        boton.addEventListener('click', async function () {
            if (boton.disabled) return;

            const usuarioDestino = boton.dataset.usuario;
            if (!usuarioDestino) return;

            const textoOriginal = boton.textContent.trim();
            boton.disabled = true;
            boton.textContent = '...';

            try {
                const respuesta = await fetch(`/seguir/${encodeURIComponent(usuarioDestino)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(datos.error || 'No se pudo actualizar el seguimiento.');
                }

                const siguiendo = Boolean(datos.esta_siguiendo);
                guardarEstadoSeguimiento(usuarioDestino, siguiendo);
                aplicarEstadoSeguimientoAlBoton(boton, siguiendo);
                boton.disabled = false;

                const estadisticas = document.querySelectorAll('.numero-estadistica');
                if (estadisticas.length >= 3) {
                    estadisticas[0].textContent = datos.seguidores_count ?? estadisticas[0].textContent;
                    estadisticas[2].textContent = datos.seguidos_count ?? estadisticas[2].textContent;
                }

                const usuarioActual = document.body.dataset.usuarioActual;
                if (usuarioActual && usuarioActual !== 'Tú') {
                    registrarNotificacionSeguimiento(usuarioDestino, usuarioActual, siguiendo);
                }

                sincronizarBotonesSeguimiento(usuarioDestino, siguiendo);
            } catch (error) {
                boton.textContent = textoOriginal;
                boton.disabled = false;
                alert(error.message || 'No se pudo actualizar el seguimiento.');
            }
        });
    });
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