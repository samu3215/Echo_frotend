document.addEventListener('DOMContentLoaded', () => {
    const areaMensajes = document.getElementById('contenedor-mensajes');
    const formChat = document.getElementById('form-chat');
    const inputMensaje = document.getElementById('input-mensaje');
    const btnEnviar = document.getElementById('btn-enviar-msg');

    // SCROLL ABAJO INICIAL
    if (areaMensajes) {
        areaMensajes.scrollTop = areaMensajes.scrollHeight;
    }

    // MANEJO DEL MODAL DE SALIR (Solución al bug de Bootstrap)
    const btnAbrirModalSalir = document.querySelector('.btn-abrir-modal-salir');
    if (btnAbrirModalSalir) {
        btnAbrirModalSalir.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Evita que el dropdown mate el evento
            const modalSalir = new bootstrap.Modal(document.getElementById('modalSalirComunidad'));
            modalSalir.show();
        });
    }

    // LÓGICA DEL INPUT DEL CHAT
    if (inputMensaje && formChat) {
        
        inputMensaje.addEventListener('input', function() {
            // Textarea crece hacia abajo dinámicamente
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px'; 
            
            // Icono se activa
            const icono = btnEnviar.querySelector('i');
            if (this.value.trim().length > 0) {
                icono.classList.remove('text-muted');
                icono.style.color = '#8338ec'; 
            } else {
                icono.classList.add('text-muted');
                icono.style.color = '';
            }
        });

        // Enviar con tecla Enter
        inputMensaje.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                formChat.dispatchEvent(new Event('submit')); 
            }
        });

        // Evento que usará la IA de WebSockets
        formChat.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const mensaje = inputMensaje.value.trim();
            if (mensaje === '') return;
            
            console.log("Enviando mensaje por WebSocket:", mensaje);
            
            // Simulación visual (Opcional, la IA lo ajustará)
            // inputMensaje.value = '';
            // inputMensaje.style.height = 'auto';
            // btnEnviar.querySelector('i').classList.add('text-muted');
            // btnEnviar.querySelector('i').style.color = '';
        });
    }
});