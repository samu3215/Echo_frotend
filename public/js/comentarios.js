document.addEventListener('DOMContentLoaded', () => {
    
    let idComentarioSeleccionado = null;
    let modalOpciones = null;
    let modalConfirmar = null;
    let modalEditar = null;


    if(document.getElementById('modalOpcionesComentario')) {
        modalOpciones = new bootstrap.Modal(document.getElementById('modalOpcionesComentario'));
    }
    if(document.getElementById('modalConfirmarEliminarCom')) {
        modalConfirmar = new bootstrap.Modal(document.getElementById('modalConfirmarEliminarCom'));
    }
    if(document.getElementById('modalEditarComentario')) {
        modalEditar = new bootstrap.Modal(document.getElementById('modalEditarComentario'));
    }


    const limpiarFoco = () => {
        if (document.activeElement) document.activeElement.blur();
    };

    document.addEventListener('click', async (e) => {
        

        const btnOpciones = e.target.closest('.btn-abrir-opciones-com');
        if (btnOpciones && modalOpciones) {
            e.preventDefault();
            idComentarioSeleccionado = btnOpciones.getAttribute('data-id');
            limpiarFoco();
            modalOpciones.show();
        }


        if (e.target.closest('#btn-modal-cancelar-opciones')) {
            limpiarFoco();
            modalOpciones.hide();
        }


        if (e.target.closest('#btn-modal-editar-com')) {
            limpiarFoco();
            modalOpciones.hide();
            
            const divTexto = document.querySelector(`#vista-com-${idComentarioSeleccionado} .texto-comentario-real`);
            const textoActual = divTexto.getAttribute('data-contenido') || divTexto.textContent;
            
            const textarea = document.getElementById('input-modal-editar-com');
            textarea.value = textoActual;
            
            setTimeout(() => {
                modalEditar.show();
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            }, 200); 
        }

        if (e.target.closest('#btn-modal-cancelar-editar')) {
            limpiarFoco();
            modalEditar.hide();
        }

        const btnGuardarEdicion = e.target.closest('#btn-modal-guardar-editar');
        if (btnGuardarEdicion) {
            const textarea = document.getElementById('input-modal-editar-com');
            const nuevoContenido = textarea.value.trim();

            if (!nuevoContenido) return;
            
            limpiarFoco();
            btnGuardarEdicion.disabled = true;
            btnGuardarEdicion.textContent = '...';

            try {

                const res = await fetch(`/publicaciones/comentarios/editar/${idComentarioSeleccionado}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contenido: nuevoContenido })
                });

                if (!res.ok) throw new Error('Error al editar');


                const divTexto = document.querySelector(`#vista-com-${idComentarioSeleccionado} .texto-comentario-real`);
                divTexto.textContent = nuevoContenido;
                divTexto.setAttribute('data-contenido', nuevoContenido); 
                
                modalEditar.hide();

            } catch (error) {
                alert('No se pudo guardar el comentario.');
            } finally {
                btnGuardarEdicion.disabled = false;
                btnGuardarEdicion.textContent = 'Guardar';
            }
        }

        if (e.target.closest('#btn-modal-eliminar-com')) {
            limpiarFoco();
            modalOpciones.hide();
            setTimeout(() => {
                modalConfirmar.show();
            }, 200);
        }

        if (e.target.closest('#btn-modal-cancelar-eliminar')) {
            limpiarFoco();
            modalConfirmar.hide();
        }


        if (e.target.closest('#btn-modal-confirmar-eliminar')) {
            const btnConfirmar = e.target.closest('#btn-modal-confirmar-eliminar');
            
            limpiarFoco();
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = '...';

            try {

                const res = await fetch(`/publicaciones/comentarios/eliminar/${idComentarioSeleccionado}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!res.ok) throw new Error('Error al eliminar');

                modalConfirmar.hide();


                const cajaComentario = document.getElementById(`caja-comentario-${idComentarioSeleccionado}`);
                const idPost = cajaComentario.getAttribute('data-post-id');
                cajaComentario.remove();

 
                const contadoresComentarios = document.querySelectorAll(`div[data-post-id="${idPost}"] .contador-comentarios`);
                contadoresComentarios.forEach(contador => {
                    const conteo = parseInt(contador.textContent) - 1;
                    contador.textContent = Math.max(0, conteo);
                });


                const contenedorScroll = document.querySelector(`#modalVerPost-${idPost} .custom-scrollbar`);
                const comentariosRestantes = contenedorScroll.querySelectorAll('.contenedor-comentario-entero');
                
                if (comentariosRestantes.length === 0) {
                    if (!contenedorScroll.querySelector('.mensaje-sin-comentarios')) {
                        contenedorScroll.insertAdjacentHTML('beforeend', '<div class="text-center text-muted small mt-5 mensaje-sin-comentarios">Aún no hay comentarios. Sé el primero.</div>');
                    }
                }

            } catch (error) {
                alert('Error eliminando el comentario');
            } finally {
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = 'Eliminar';
            }
        }
    });


    document.addEventListener('input', (e) => {
        if (e.target.matches('#input-modal-editar-com')) {
            const textarea = e.target;
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
    });
});