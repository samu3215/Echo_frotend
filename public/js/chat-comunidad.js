document.addEventListener('DOMContentLoaded', () => {
    const areaMensajes = document.getElementById('contenedor-mensajes');
    const formChat = document.getElementById('form-chat');
    const inputMensaje = document.getElementById('input-mensaje');
    const btnEnviar = document.getElementById('btn-enviar-msg');
    const iconoEnviar = document.getElementById('icono-enviar');

    const btnTriggerArchivos = document.getElementById('btn-trigger-archivos');
    const inputArchivos = document.getElementById('input-archivos-chat');
    const contenedorPreview = document.getElementById('contenedor-preview-archivos');
    
    const cajaAccion = document.getElementById('caja-previa-accion');
    const accionTitulo = document.getElementById('accion-titulo');
    const accionTexto = document.getElementById('accion-texto');
    const accionImg = document.getElementById('accion-img');
    const btnCancelarAccion = document.getElementById('btn-cancelar-accion');

    const idComunidad = window.location.pathname.split('/')[2];
    const claveBorrador = `borrador_chat_txt_${idComunidad}`;
    let archivosAcumulados = new DataTransfer();
    
    let modoEdicion = null; 
    let modoRespuesta = null; 
    let idMensajeAEliminar = null;

    if (areaMensajes) areaMensajes.scrollTop = areaMensajes.scrollHeight;

    const modalEliminar = new bootstrap.Modal(document.getElementById('modalConfirmarAccion'));
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-accion-ok');


    const evtSource = new EventSource(`/comunidades/${idComunidad}/stream`);
    
    evtSource.onmessage = function(event) {
        const payload = JSON.parse(event.data);
        const miUsuario = document.body.dataset.usuarioLogueado || ''; 
        const miUsuarioId = document.body.dataset.usuarioId || ''; 
        const esDueno = document.body.dataset.esDueno === 'true'; 

        if (payload.evento === 'nuevo_mensaje') {
            const msj = payload.datos;
            const esMio = (msj.usuario.nombre_usuario === miUsuario);
            
            const msjVacio = document.getElementById('mensaje-chat-vacio');
            if(msjVacio) msjVacio.remove();

            const fila = document.createElement('div');
            fila.className = `mensaje-fila ${esMio ? 'propio' : 'ajeno'}`;
            fila.id = `msj-${msj.id}`;
            
            let htmlBurbuja = `<div class="burbuja-mensaje shadow-sm">`;
            
            // Opciones: Ahora el Admin (esDueno) verá el botón Eliminar en tiempo real
            htmlBurbuja += `
            <div class="dropdown menu-opciones-msj">
                <button class="btn-icono-opcion" type="button" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                    <li><button class="dropdown-item fw-semibold btn-responder" data-id="${msj.id}" data-autor="${msj.usuario.nombre_usuario}" data-texto="${msj.contenido || 'Multimedia'}" data-img="${(msj.archivos && msj.archivos.length > 0 && msj.archivos[0].tipo_media === 'imagen') ? msj.archivos[0].url_media : ''}">Responder</button></li>
                    ${esMio ? `<li><button class="dropdown-item fw-semibold btn-editar" data-id="${msj.id}" data-texto="${msj.contenido || ''}">Editar</button></li>` : ''}
                    ${(esMio || esDueno) ? `<li><hr class="dropdown-divider"></li><li><button class="dropdown-item text-danger fw-semibold btn-eliminar" data-id="${msj.id}">Eliminar</button></li>` : ''}
                </ul>
            </div>`;

            if (!esMio) {
                htmlBurbuja += `<div class="d-flex align-items-center mb-1"><span class="nombre-autor m-0">~${msj.usuario.nombre_usuario}</span></div>`;
            }

            if (msj.mensaje_respondido) {
                const msjPadreDOM = document.getElementById(`msj-${msj.mensaje_respondido}`);
                let autorPadre = 'Usuario';
                let textoPadre = 'Mensaje adjunto';
                let imgPadre = null;
                
                if (msjPadreDOM) {
                    const elAutor = msjPadreDOM.querySelector('.nombre-autor');
                    autorPadre = elAutor ? elAutor.textContent.replace('~','') : miUsuario;
                    const elTexto = msjPadreDOM.querySelector('.texto-mensaje');
                    textoPadre = elTexto ? elTexto.textContent : 'Multimedia';
                    const laImg = msjPadreDOM.querySelector('.img-fluida-chat');
                    imgPadre = laImg ? laImg.src : null;
                }

                htmlBurbuja += `
                <div class="caja-cita-burbuja d-flex justify-content-between align-items-stretch cursor-pointer" onclick="document.getElementById('msj-${msj.mensaje_respondido}')?.scrollIntoView({behavior: 'smooth', block: 'center'});">
                    <div class="info-cita overflow-hidden pe-2 d-flex flex-column justify-content-center">
                        <div class="cita-autor fw-bold text-morado text-truncate">${autorPadre}</div>
                        <div class="cita-texto text-truncate small">${textoPadre}</div>
                    </div>
                    ${imgPadre ? `<img src="${imgPadre}" class="img-cita-miniatura ms-1">` : ''}
                </div>`;
            }
            
            if (msj.archivos && msj.archivos.length > 0) {
                htmlBurbuja += `<div class="contenedor-multimedia-grid">`;
                msj.archivos.forEach(archivo => {
                    if (archivo.tipo_media === 'imagen') {
                        htmlBurbuja += `<img src="${archivo.url_media}" class="img-fluida-chat rounded-3 shadow-sm">`;
                    } else if (archivo.tipo_media === 'video') {
                        htmlBurbuja += `<video src="${archivo.url_media}" controls class="img-fluida-chat rounded-3 shadow-sm"></video>`;
                    }
                });
                htmlBurbuja += `</div>`;
            }

            if (msj.contenido) {
                htmlBurbuja += `<div class="texto-mensaje" id="texto-${msj.id}">${msj.contenido}</div>`;
            }

            htmlBurbuja += `</div>`;
            fila.innerHTML = htmlBurbuja;
            
            areaMensajes.appendChild(fila);
            areaMensajes.scrollTop = areaMensajes.scrollHeight;
        }

        if (payload.evento === 'eliminar_mensaje') {
            const msjDiv = document.getElementById(`msj-${payload.datos.idMensaje}`);
            if(msjDiv) msjDiv.remove();
        }

        if (payload.evento === 'editar_mensaje') {
            // CORRECCIÓN: Crear el div si el mensaje original era solo imagen
            let divTexto = document.getElementById(`texto-${payload.datos.idMensaje}`);
            if (divTexto) {
                divTexto.textContent = payload.datos.nuevoContenido;
            } else {
                const burbuja = document.querySelector(`#msj-${payload.datos.idMensaje} .burbuja-mensaje`);
                if (burbuja) {
                    divTexto = document.createElement('div');
                    divTexto.className = 'texto-mensaje';
                    divTexto.id = `texto-${payload.datos.idMensaje}`;
                    divTexto.textContent = payload.datos.nuevoContenido;
                    burbuja.appendChild(divTexto);
                }
            }
        }

        if (payload.evento === 'comunidad_actualizada') {
            const titulo = document.querySelector('.titulo-comunidad-chat');
            if (titulo) titulo.textContent = payload.datos.nombre;
        }

        // Evacuación: Muestra modal 2.5 segs y redirige al /login
        const modalEvacuacionDOM = document.getElementById('modalEvacuacion');
        if (modalEvacuacionDOM) {
            const modalEvacuacion = new bootstrap.Modal(modalEvacuacionDOM);
            const tituloEvacuacion = document.getElementById('titulo-evacuacion');
            const textoEvacuacion = document.getElementById('texto-evacuacion');

            if (payload.evento === 'comunidad_eliminada') {
                tituloEvacuacion.textContent = 'Comunidad Eliminada';
                textoEvacuacion.textContent = 'El creador ha cerrado esta comunidad. Redirigiendo...';
                modalEvacuacion.show();
                setTimeout(() => window.location.href = '/comunidades', 2500);
            }

            if (payload.evento === 'usuario_expulsado') {
                if (String(payload.datos.idExpulsado) === String(miUsuarioId)) {
                    tituloEvacuacion.textContent = 'Has sido expulsado';
                    textoEvacuacion.textContent = 'Has sido removido de la comunidad. Redirigiendo...';
                    modalEvacuacion.show();
                    setTimeout(() => window.location.href = '/comunidades', 2500);
                }
            }
        }
    };

    evtSource.onerror = function() {
        console.log("Conexión en tiempo real perdida. Reconectando...");
    };

    // ===========================================

    const textoGuardado = localStorage.getItem(claveBorrador);
    if (textoGuardado && inputMensaje) {
        inputMensaje.value = textoGuardado;
        iconoEnviar.classList.remove('text-muted');
        iconoEnviar.style.color = '#8338ec';
    }

    const mostrarErrorFlotante = (mensaje) => {
        const cont = document.getElementById('contenedor-alertas-chat');
        const div = document.createElement('div');
        div.className = 'alerta-flotante-chat';
        div.textContent = mensaje;
        cont.appendChild(div);
        setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 4000);
    };

    const actualizarVistaPrevia = () => {
        contenedorPreview.innerHTML = '';
        if (archivosAcumulados.files.length > 0) {
            contenedorPreview.classList.remove('d-none');
            for (let i = 0; i < archivosAcumulados.files.length; i++) {
                const archivo = archivosAcumulados.files[i];
                const index = i;
                
                const divCont = document.createElement('div');
                divCont.className = 'item-preview-archivo';

                const media = document.createElement(archivo.type.startsWith('video/') ? 'video' : 'img');
                media.src = URL.createObjectURL(archivo);
                media.style = 'width:55px; height:55px; object-fit:cover; border-radius:8px; border:1px solid #ccc;';
                
                const btnQuitar = document.createElement('button');
                btnQuitar.className = 'btn-quitar-archivo-chat';
                btnQuitar.innerHTML = '<i class="bi bi-x"></i>';
                
                btnQuitar.addEventListener('click', () => {
                    const dt = new DataTransfer();
                    for (let k = 0; k < archivosAcumulados.files.length; k++) {
                        if (k !== index) dt.items.add(archivosAcumulados.files[k]);
                    }
                    archivosAcumulados = dt;
                    actualizarVistaPrevia();
                });

                divCont.appendChild(media);
                divCont.appendChild(btnQuitar);
                contenedorPreview.appendChild(divCont);
            }
            iconoEnviar.classList.remove('text-muted');
            iconoEnviar.style.color = '#8338ec';
        } else {
            contenedorPreview.classList.add('d-none');
            if (inputMensaje.value.trim() === '') iconoEnviar.style.color = '';
        }
    };

    if (inputMensaje && formChat) {
        
        inputMensaje.addEventListener('input', function() {
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px'; 
            localStorage.setItem(claveBorrador, this.value);

            if (this.value.trim().length > 0 || archivosAcumulados.files.length > 0) {
                iconoEnviar.classList.remove('text-muted');
                iconoEnviar.style.color = '#8338ec'; 
            } else {
                iconoEnviar.style.color = '';
                iconoEnviar.classList.add('text-muted');
            }
        });

        inputMensaje.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                formChat.dispatchEvent(new Event('submit')); 
            }
        });

        if (btnTriggerArchivos) {
            btnTriggerArchivos.addEventListener('click', () => inputArchivos.click());
            
            inputArchivos.addEventListener('change', function() {
                if (archivosAcumulados.files.length + this.files.length > 4) {
                    document.getElementById('texto-modal-archivos').textContent = "No puedes enviar más de 4 archivos a la vez.";
                    new bootstrap.Modal(document.getElementById('modalErrorArchivos')).show();
                    this.value = ''; 
                    return;
                }
                for(let i = 0; i < this.files.length; i++) {
                    archivosAcumulados.items.add(this.files[i]);
                }
                actualizarVistaPrevia();
                this.value = ''; 
            });
        }

        btnCancelarAccion.addEventListener('click', () => {
            cajaAccion.classList.add('d-none');
            modoEdicion = null;
            modoRespuesta = null;
            inputMensaje.value = '';
            localStorage.removeItem(claveBorrador);
        });

        areaMensajes.addEventListener('click', (e) => {
            if (e.target.closest('.btn-responder')) {
                const btn = e.target.closest('.btn-responder');
                modoRespuesta = btn.dataset.id;
                modoEdicion = null;
                accionTitulo.textContent = "Respondiendo a " + btn.dataset.autor;
                accionTexto.textContent = btn.dataset.texto;
                
                const img = btn.dataset.img;
                if (img) {
                    accionImg.src = img;
                    accionImg.classList.remove('d-none');
                } else {
                    accionImg.classList.add('d-none');
                }

                cajaAccion.classList.remove('d-none');
                inputMensaje.focus();
            }

            if (e.target.closest('.btn-editar')) {
                const btn = e.target.closest('.btn-editar');
                modoEdicion = btn.dataset.id;
                modoRespuesta = null;
                inputMensaje.value = btn.dataset.texto;
                accionTitulo.textContent = "Editando mensaje";
                accionTexto.textContent = "Modifica tu texto abajo";
                accionImg.classList.add('d-none');
                cajaAccion.classList.remove('d-none');
                inputMensaje.focus();
            }

            if (e.target.closest('.btn-eliminar')) {
                idMensajeAEliminar = e.target.closest('.btn-eliminar').dataset.id;
                modalEliminar.show();
            }
        });

        btnConfirmarEliminar.addEventListener('click', async () => {
            if (!idMensajeAEliminar) return;
            try {
                const req = await fetch(`/mensajes/${idMensajeAEliminar}`, { 
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idComunidad: idComunidad })
                });
                
                if (req.ok) {
                    modalEliminar.hide();
                } else {
                    modalEliminar.hide();
                    mostrarErrorFlotante("No se pudo eliminar el mensaje");
                }
            } catch (error) { 
                modalEliminar.hide();
                mostrarErrorFlotante("Error de conexión"); 
            }
        });

        formChat.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const mensajeTexto = inputMensaje.value.trim();
            const tieneArchivos = archivosAcumulados.files.length > 0;
            if (mensajeTexto === '' && !tieneArchivos) return;
            
            btnEnviar.disabled = true;
            iconoEnviar.className = 'spinner-border spinner-border-sm text-primary';

            if (modoEdicion) {
                try {
                    const pet = await fetch(`/mensajes/${modoEdicion}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contenido: mensajeTexto, idComunidad: idComunidad })
                    });
                    if (pet.ok) {
                        btnCancelarAccion.click();
                        localStorage.removeItem(claveBorrador);
                    }
                } catch(e) { mostrarErrorFlotante("Error al editar."); }
                
                btnEnviar.disabled = false;
                iconoEnviar.className = 'bi bi-send-fill text-muted';
                return;
            }

            const formData = new FormData();
            formData.append('contenido', mensajeTexto);
            if (modoRespuesta) formData.append('mensaje_respondido', modoRespuesta);
            
            for (let f = 0; f < archivosAcumulados.files.length; f++) {
                formData.append('archivos', archivosAcumulados.files[f]);
            }

            try {
                const peticion = await fetch(`/comunidades/${idComunidad}/mensajes`, {
                    method: 'POST',
                    body: formData 
                });

                const respuesta = await peticion.json();

                if (peticion.ok && respuesta.exito) {
                    inputMensaje.value = '';
                    inputMensaje.style.height = 'auto';
                    archivosAcumulados = new DataTransfer();
                    actualizarVistaPrevia();
                    btnCancelarAccion.click();
                    localStorage.removeItem(claveBorrador);
                } else {
                    if (respuesta.error === 'limite_archivos' || respuesta.error === 'peso_excedido') {
                        document.getElementById('texto-modal-archivos').textContent = respuesta.mensaje;
                        new bootstrap.Modal(document.getElementById('modalErrorArchivos')).show();
                    } else {
                        mostrarErrorFlotante(respuesta.mensaje || 'Error al enviar');
                    }
                }
            } catch (error) {
                mostrarErrorFlotante('La conexión con el servidor falló.');
            } finally {
                btnEnviar.disabled = false;
                iconoEnviar.className = 'bi bi-send-fill text-muted';
                iconoEnviar.style.color = '';
            }
        });
    }
});