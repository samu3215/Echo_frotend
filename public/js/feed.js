document.addEventListener('DOMContentLoaded', () => {

    // Inicializar carruseles: Bloqueo infinito y ocultar flecha izquierda de inicio
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(c => {
        new bootstrap.Carousel(c, { wrap: false });
        const prevBtn = c.querySelector('.btn-prev-carrusel');
        if (prevBtn) prevBtn.style.visibility = 'hidden'; 
    });

    // Evento de transición del Carrusel (Indicador y Flechas)
    document.addEventListener('slid.bs.carousel', function (e) {
        const carousel = e.target;
        const totalItems = carousel.querySelectorAll('.carousel-item').length;
        const activeIndex = Array.from(carousel.querySelectorAll('.carousel-item')).indexOf(e.relatedTarget);
        
        const indicador = carousel.querySelector('.indicador-carrusel');
        if (indicador) indicador.textContent = `${activeIndex + 1} / ${totalItems}`;

        const prevBtn = carousel.querySelector('.btn-prev-carrusel');
        const nextBtn = carousel.querySelector('.btn-next-carrusel');

        if (prevBtn) prevBtn.style.visibility = activeIndex === 0 ? 'hidden' : 'visible';
        if (nextBtn) nextBtn.style.visibility = activeIndex === totalItems - 1 ? 'hidden' : 'visible';
    });

    let paginaActual = 1;
    let cargandoScroll = false;
    const scrollTrigger = document.getElementById('scroll-trigger');

    if (scrollTrigger) {
        const origen = scrollTrigger.getAttribute('data-origen');
        const usuarioPerfil = scrollTrigger.getAttribute('data-usuario');
        
        const observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting && !cargandoScroll) {
                cargandoScroll = true;
                paginaActual++;
                try {
                    const res = await fetch(`/cargar-mas-publicaciones?page=${paginaActual}&origen=${origen}&usuario=${usuarioPerfil}`);
                    const data = await res.json();
                    
                    if (data.html) {
                        scrollTrigger.insertAdjacentHTML('beforebegin', data.html);
                        if (!data.tieneSiguiente) {
                            scrollTrigger.innerHTML = '<p class="text-muted small mt-4 fw-semibold">Estás al día.</p>';
                            observer.disconnect();
                        }
                    }
                } catch (err) {
                    console.error('Error cargando más', err);
                }
                cargandoScroll = false;
            }
        }, { rootMargin: '400px' }); 

        observer.observe(scrollTrigger);
    }
    
    document.addEventListener('click', async (e) => {
        
        // --- MENÚ 3 PUNTOS DE PUBLICACIÓN ---
        const btnOpciones = e.target.closest('.btn-opciones-post');
        if (btnOpciones) {
            const idPost = btnOpciones.getAttribute('data-id');
            const esDueno = btnOpciones.getAttribute('data-es-dueno') === 'true';
            
            document.getElementById('btn-ir-post').setAttribute('data-id', idPost);
            
            const opcionesDueno = document.getElementById('opciones-dueno-post');
            if (esDueno) {
                opcionesDueno.style.display = 'block';
                document.getElementById('btn-editar-post').href = `/editar/${idPost}`;
                document.getElementById('form-eliminar-post').action = `/publicaciones/eliminar/${idPost}`;
            } else {
                opcionesDueno.style.display = 'none';
            }
        }

        // --- ABRIR MODAL CONFIRMAR ELIMINACIÓN DE PUBLICACIÓN ---
        if (e.target.closest('#btn-abrir-confirmar-eliminar-post')) {
            const modalOpciones = bootstrap.Modal.getInstance(document.getElementById('modalOpcionesPost'));
            if (modalOpciones) modalOpciones.hide();
            
            setTimeout(() => {
                const modalConfirmar = new bootstrap.Modal(document.getElementById('modalConfirmarEliminarPost'));
                modalConfirmar.show();
            }, 200);
        }

        // --- BOTÓN "IR A LA PUBLICACIÓN" ---
        if (e.target.closest('#btn-ir-post')) {
            e.preventDefault();
            const idPost = e.target.closest('#btn-ir-post').getAttribute('data-id');
            
            const modalOpciones = bootstrap.Modal.getInstance(document.getElementById('modalOpcionesPost'));
            if (modalOpciones) modalOpciones.hide();
            
            setTimeout(() => {
                const modalVerPost = new bootstrap.Modal(document.getElementById(`modalVerPost-${idPost}`));
                modalVerPost.show();
            }, 300); 
        }

        // --- SISTEMA DE LIKES ---
        const btnLike = e.target.closest('.btn-like');
        if (btnLike) {
            e.preventDefault();
            const idPost = btnLike.getAttribute('data-id');
            const iconos = document.querySelectorAll(`button.btn-like[data-id="${idPost}"] .icono-like`);
            const contadores = document.querySelectorAll(`div[data-post-id="${idPost}"] .contador-likes, #modalVerPost-${idPost} .contador-likes`);
            
            const teniaLike = iconos[0].classList.contains('bi-heart-fill');

            try {
                const response = await fetch(`/publicaciones/${idPost}/like`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) {
                    if (response.status === 401) return window.location.href = '/login?error=Inicia sesión para dar like';
                    throw new Error('Fallo al guardar en DB');
                }

                iconos.forEach(icono => {
                    if (teniaLike) {
                        icono.classList.replace('bi-heart-fill', 'bi-heart');
                        icono.classList.remove('text-morado-echo'); 
                    } else {
                        icono.classList.replace('bi-heart', 'bi-heart-fill');
                        icono.classList.add('text-morado-echo'); 
                    }
                });

                contadores.forEach(contador => {
                    const conteoActual = parseInt(contador.textContent);
                    contador.textContent = teniaLike ? Math.max(0, conteoActual - 1) : conteoActual + 1;
                });

            } catch (error) {
                console.error("Error like:", error);
            }
        }
    });

    // --- ENVIAR COMENTARIOS ---
    document.addEventListener('submit', async (e) => {
        const formComentario = e.target.closest('.form-comentario');
        if (formComentario) {
            e.preventDefault();
            const idPost = formComentario.getAttribute('data-post-id');
            const input = formComentario.querySelector('.input-comentario');
            const btnPublicar = formComentario.querySelector('.btn-publicar-comentario');
            const contenido = input.value.trim();

            if (!contenido) return;
            btnPublicar.disabled = true;
            btnPublicar.textContent = '...';

            try {
                const response = await fetch(`/publicaciones/${idPost}/comentar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contenido })
                });
                
                if (!response.ok) {
                    if (response.status === 401) window.location.href = '/login?error=Inicia sesión para comentar';
                    throw new Error('Error al comentar');
                }

                const data = await response.json();
                
                input.value = '';
                btnPublicar.textContent = 'Publicar';
                btnPublicar.disabled = true;
                input.style.height = 'auto';

                const contenedorComentarios = document.querySelector(`#modalVerPost-${idPost} .custom-scrollbar`);
                if(contenedorComentarios) {
                    const msjVacio = contenedorComentarios.querySelector('.text-muted.mt-5');
                    if (msjVacio) msjVacio.remove();

                    const nombreUsuario = data.comentario?.usuario?.nombre_usuario || 'Tú';
                    const fotoPerfil = data.comentario?.usuario?.foto_perfil || '/img/avatar.webp';
                    const idComentario = data.comentario?.id;

                    // HTML Completo e idéntico al renderizado inicial por EJS
                    const nuevoComentarioHTML = `
                        <div class="d-flex mb-3 contenedor-comentario-entero" id="caja-comentario-${idComentario}" data-post-id="${idPost}">
                            <a href="/perfil/${nombreUsuario}">
                                <img src="${fotoPerfil}" class="avatar-post rounded-circle me-2 mt-1" style="width: 32px; height: 32px; object-fit: cover;">
                            </a>
                            <div class="bg-light p-2 rounded-3 w-100 position-relative">
                                
                                <button class="btn btn-link text-muted p-0 position-absolute top-0 end-0 m-2 shadow-none btn-abrir-opciones-com" data-id="${idComentario}">
                                    <i class="bi bi-three-dots"></i>
                                </button>

                                <div class="vista-texto-comentario" id="vista-com-${idComentario}">
                                    <a href="/perfil/${nombreUsuario}" class="fw-bold text-dark text-decoration-none small mb-1 d-block pe-3">${nombreUsuario}</a>
                                    <div class="small text-dark texto-comentario-real" data-contenido="${contenido}">${contenido}</div>
                                </div>

                            </div>
                        </div>
                    `;
                    contenedorComentarios.insertAdjacentHTML('beforeend', nuevoComentarioHTML);
                    contenedorComentarios.scrollTop = contenedorComentarios.scrollHeight;
                }

                const contadoresComentarios = document.querySelectorAll(`div[data-post-id="${idPost}"] .contador-comentarios`);
                contadoresComentarios.forEach(contador => {
                     contador.textContent = parseInt(contador.textContent) + 1;
                });
                
            } catch (error) {
                console.error(error);
                btnPublicar.textContent = 'Publicar';
                btnPublicar.disabled = false;
            }
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.matches('.input-comentario')) {
            const textarea = e.target;
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';

            const btn = textarea.closest('.form-comentario').querySelector('.btn-publicar-comentario');
            btn.disabled = textarea.value.trim().length === 0;
        }
    });
});