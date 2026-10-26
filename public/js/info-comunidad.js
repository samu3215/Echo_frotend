document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE PESTAÑAS (TABS) ---
    const botonesPestana = document.querySelectorAll('.btn-pestana');
    const contenidosPestana = document.querySelectorAll('.contenido-pestana');

    botonesPestana.forEach(boton => {
        boton.addEventListener('click', function() {
            // 1. Quitar activo de todos los botones
            botonesPestana.forEach(btn => btn.classList.remove('activa'));
            // 2. Ocultar todos los contenidos
            contenidosPestana.forEach(contenido => contenido.classList.remove('activo'));
            
            // 3. Activar el boton clickeado
            this.classList.add('activa');
            
            // 4. Mostrar el contenido correspondiente
            const idContenido = this.getAttribute('data-tab');
            const contenidoAMostrar = document.getElementById(idContenido);
            if (contenidoAMostrar) {
                contenidoAMostrar.classList.add('activo');
            }
        });
    });

    // --- MANEJO DEL MODAL BUSCAR DUEÑO ---
    const btnAbrirModalDueno = document.querySelector('.btn-abrir-modal-dueno');
    if (btnAbrirModalDueno) {
        btnAbrirModalDueno.addEventListener('click', () => {
            const modalDueno = new bootstrap.Modal(document.getElementById('modalBuscarNuevoDueno'));
            modalDueno.show();
        });
    }

    // Buscador en el modal
    const inputBuscar = document.getElementById('input-buscar-admin');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filas = document.querySelectorAll('.fila-miembro-transferir');

            filas.forEach(fila => {
                const nombre = fila.querySelector('.nombre-miembro-buscar').textContent.toLowerCase();
                if (nombre.includes(query)) {
                    fila.style.display = 'flex';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    }

    // Cambiar del modal 1 al modal 2
    const botonesSeleccionarAdmin = document.querySelectorAll('.btn-seleccionar-admin');
    const inputOcultoId = document.getElementById('input-nuevo-dueno-id');
    const textoNombreNuevoAdmin = document.getElementById('nombre-nuevo-admin-texto');
    
    botonesSeleccionarAdmin.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const usuarioId = boton.getAttribute('data-id');
            const usuarioNombre = boton.getAttribute('data-nombre');

            inputOcultoId.value = usuarioId;
            textoNombreNuevoAdmin.textContent = usuarioNombre;

            const modal1 = bootstrap.Modal.getInstance(document.getElementById('modalBuscarNuevoDueno'));
            if (modal1) modal1.hide();

            const modal2 = new bootstrap.Modal(document.getElementById('modalConfirmarTransferencia'));
            modal2.show();
        });
    });

    // --- MANEJO DEL MODAL EXPULSAR ---
    const botonesExpulsar = document.querySelectorAll('.btn-abrir-modal-expulsar');
    const inputOcultoExpulsarId = document.getElementById('input-expulsar-id');
    const textoNombreExpulsar = document.getElementById('nombre-expulsar-texto');

    botonesExpulsar.forEach(boton => {
        boton.addEventListener('click', () => {
            const usuarioId = boton.getAttribute('data-id');
            const usuarioNombre = boton.getAttribute('data-nombre');

            if (inputOcultoExpulsarId && textoNombreExpulsar) {
                inputOcultoExpulsarId.value = usuarioId;
                textoNombreExpulsar.textContent = usuarioNombre;

                const modalExpulsar = new bootstrap.Modal(document.getElementById('modalConfirmarExpulsion'));
                modalExpulsar.show();
            }
        });
    });

});