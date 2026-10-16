document.addEventListener('DOMContentLoaded', () => {

    const formEditar = document.getElementById('form-editar-publicacion');
    const btnAbrirModalGuardar = document.getElementById('btn-abrir-modal-guardar');
    const modalConfirmarGuardar = new bootstrap.Modal(document.getElementById('modalConfirmarGuardar'));
    
    // ============================================
    // 1. Textarea Autoajustable y Contador
    // ============================================
    const inputDescripcion = document.getElementById('input-descripcion');
    const contadorCaracteres = document.getElementById('contador-caracteres');

    function redimensionarYContar() {
        if (inputDescripcion) {
            const len = inputDescripcion.value.length;
            if(contadorCaracteres) {
                contadorCaracteres.textContent = `${len}/2200`;
                contadorCaracteres.classList.toggle('text-danger', len > 2200);
            }
            
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
        inputDescripcion.addEventListener('input', redimensionarYContar);
        redimensionarYContar(); 
    }

    // ============================================
    // 2. Lógica Drag & Drop (Orden de archivos)
    // ============================================
    const contenedorMiniaturas = document.getElementById('contenedor-miniaturas');
    const carruselInner = document.getElementById('contenedor-media-preview');
    let itemArrastrado = null;

    if (contenedorMiniaturas && carruselInner) {
        const carruselElement = document.getElementById('carruselEditarMedia');
        document.querySelectorAll('.miniatura-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const miniaturas = document.querySelectorAll('.miniatura-item');
                const indexActual = Array.from(miniaturas).indexOf(item);
                bootstrap.Carousel.getOrCreateInstance(carruselElement).to(indexActual);
                
                miniaturas.forEach(m => m.classList.remove('activa'));
                item.classList.add('activa');
            });
        });

        document.querySelectorAll('.miniatura-item').forEach(item => {
            item.addEventListener('dragstart', function(e) {
                itemArrastrado = this;
                setTimeout(() => this.classList.add('dragging'), 0);
            });

            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                itemArrastrado = null;
                recalcularOrdenesDOM();
            });

            item.addEventListener('dragover', function(e) { 
                e.preventDefault(); 
                this.classList.add('drag-over'); 
            });
            
            item.addEventListener('dragleave', function() { 
                this.classList.remove('drag-over'); 
            });

            item.addEventListener('drop', function(e) {
                this.classList.remove('drag-over');
                if (itemArrastrado !== this) {
                    let todosLosItems = Array.from(contenedorMiniaturas.children);
                    let idxOrigen = todosLosItems.indexOf(itemArrastrado);
                    let idxDestino = todosLosItems.indexOf(this);

                    if (idxOrigen < idxDestino) {
                        this.parentNode.insertBefore(itemArrastrado, this.nextSibling);
                    } else {
                        this.parentNode.insertBefore(itemArrastrado, this);
                    }
                }
            });
        });

        function recalcularOrdenesDOM() {
            const items = document.querySelectorAll('.miniatura-item');
            
            items.forEach((item, index) => {
                const inputOrden = item.querySelector('.input-archivo-orden');
                if (inputOrden) inputOrden.value = index + 1;
            });

            items.forEach((item) => {
                const mediaId = item.getAttribute('data-id');
                const carruselItem = carruselInner.querySelector(`.carousel-item[data-id="${mediaId}"]`);
                if (carruselItem) {
                    carruselInner.appendChild(carruselItem); 
                }
            });
            
            carruselInner.querySelectorAll('.carousel-item').forEach(el => el.classList.remove('active'));
            if(carruselInner.firstElementChild) {
                carruselInner.firstElementChild.classList.add('active');
            }
            
            items.forEach(m => m.classList.remove('activa'));
            if (items[0]) items[0].classList.add('activa');
        }
    }

    // ============================================
    // 3. Modales y Spinner al Guardar
    // ============================================
    if (btnAbrirModalGuardar) {
        btnAbrirModalGuardar.addEventListener('click', () => {
            modalConfirmarGuardar.show();
        });
    }

    if (formEditar) {
        formEditar.addEventListener('submit', (e) => {
            const btnConfirmarGuardar = document.querySelector('.btn-confirmar-guardar');
            if(btnConfirmarGuardar) {
                btnConfirmarGuardar.disabled = true;
                btnConfirmarGuardar.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>...`;
            }
        });
    }
});