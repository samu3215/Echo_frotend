const formularioRegistro = document.getElementById('form-registro');
const claveBorrador = formularioRegistro
    ? `echo:registro:borrador:${formularioRegistro.elements.tipo_url.value}`
    : null;

function limpiarCamposContrasenaRegistro() {
    if (!formularioRegistro) return;

    formularioRegistro.querySelectorAll('input[type="password"]').forEach(campo => {
        campo.value = '';
    });
}

limpiarCamposContrasenaRegistro();
window.addEventListener('DOMContentLoaded', limpiarCamposContrasenaRegistro);

function guardarBorradorRegistro() {
    if (!formularioRegistro || !claveBorrador) return;

    const borrador = {};
    formularioRegistro.querySelectorAll('#paso-1 [name]').forEach(campo => {
        if (campo.type !== 'file' && campo.type !== 'password' && campo.name !== 'tipo_url') {
            borrador[campo.name] = campo.value;
        }
    });

    try {
        window.sessionStorage.setItem(claveBorrador, JSON.stringify(borrador));
    } catch (error) {
        console.error('No se pudo guardar el borrador del registro en esta pestaña.', error);
    }
}

function restaurarBorradorRegistro() {
    if (!formularioRegistro || !claveBorrador) return;

    let borrador;
    try {
        const borradorGuardado = window.sessionStorage.getItem(claveBorrador);
        if (!borradorGuardado) return;
        borrador = JSON.parse(borradorGuardado);
    } catch (error) {
        console.error('No se pudo restaurar el borrador del registro.', error);
        try {
            window.sessionStorage.removeItem(claveBorrador);
        } catch (errorAlLimpiar) {
            console.error('No se pudo eliminar el borrador inválido del registro.', errorAlLimpiar);
        }
        return;
    }

    if (!borrador || typeof borrador !== 'object' || Array.isArray(borrador)) {
        console.error('El borrador guardado del registro tiene un formato inválido.');
        try {
            window.sessionStorage.removeItem(claveBorrador);
        } catch (error) {
            console.error('No se pudo eliminar el borrador inválido del registro.', error);
        }
        return;
    }

    delete borrador.password;
    delete borrador.confirmar_password;
    try {
        window.sessionStorage.setItem(claveBorrador, JSON.stringify(borrador));
    } catch (error) {
        console.error('No se pudo limpiar las contraseñas del borrador del registro.', error);
    }

    formularioRegistro.querySelectorAll('#paso-1 [name]').forEach(campo => {
        if (campo.type !== 'file' && campo.type !== 'password' && campo.name !== 'tipo_url' && typeof borrador[campo.name] === 'string') {
            campo.value = borrador[campo.name];
        }
    });
}

function validarPasoUno(mostrarErrores = false) {
    const paso1 = document.getElementById('paso-1');
    const campos = paso1.querySelectorAll('input:not([type="hidden"]):not([type="file"])');
    const botonSiguiente = paso1.querySelector('.boton-principal');
    let primerCampoInvalido = null;

    campos.forEach(campo => {
        campo.setCustomValidity('');
        const valor = campo.type === 'password' ? campo.value : campo.value.trim();
        let mensajeError = '';

        if (campo.required && !valor.trim()) {
            mensajeError = 'Este campo es obligatorio.';
        } else if (campo.type === 'email' && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            mensajeError = 'Ingresa un correo electrónico válido.';
        } else if (campo.name === 'nombre_usuario' && valor) {
            if (valor.length < 4) {
                mensajeError = 'El usuario debe tener al menos 4 caracteres.';
            } else if (!/^[a-zA-Z0-9_]+$/.test(valor)) {
                mensajeError = 'El usuario solo puede contener letras, números y guiones bajos.';
            }
        } else if (campo.name === 'telefono' && valor && !/^\d{10}$/.test(valor)) {
            mensajeError = 'El teléfono debe contener exactamente 10 dígitos.';
        } else if (campo.name === 'password' && valor.length < 8) {
            mensajeError = 'La contraseña debe tener al menos 8 caracteres.';
        } else if (campo.name === 'confirmar_password' && valor !== formularioRegistro.elements.password.value) {
            mensajeError = 'Las contraseñas no coinciden.';
        }
        if (!mensajeError && campo.dataset.serverError) {
            mensajeError = campo.dataset.serverError;
        }

        let mensaje = campo.parentElement.querySelector('.mensaje-error-campo');
        if (!mensaje) {
            mensaje = document.createElement('p');
            mensaje.className = 'mensaje-error-campo';
            mensaje.id = `error-campo-${campo.name}`;
            mensaje.setAttribute('aria-live', 'polite');
            campo.insertAdjacentElement('afterend', mensaje);
        }

        let estado = campo.parentElement.querySelector('.mensaje-estado-campo');
        if (!estado) {
            estado = document.createElement('p');
            estado.className = 'mensaje-estado-campo';
            estado.id = `estado-campo-${campo.name}`;
            estado.setAttribute('aria-live', 'polite');
            mensaje.insertAdjacentElement('afterend', estado);
        }
        const mensajesExito = {
            nombre: 'Nombre válido.',
            apellido: 'Apellido válido.',
            nombre_negocio: 'Nombre del negocio válido.',
            nombre_usuario: 'Usuario válido.',
            direccion: 'Dirección válida.',
            telefono: 'Teléfono válido.',
            email: 'Correo electrónico válido.',
            password: 'Contraseña válida.',
            confirmar_password: 'Las contraseñas coinciden.'
        };
        estado.textContent = mensajesExito[campo.name] || 'Campo completado correctamente.';

        const mostrarError = Boolean(mensajeError) && (mostrarErrores || campo.dataset.validacionActiva === 'true');
        campo.classList.toggle('is-invalid', mostrarError);
        campo.classList.toggle('is-valid', !mensajeError);
        campo.setAttribute('aria-invalid', mensajeError ? 'true' : 'false');
        campo.setAttribute('aria-describedby', mensajeError ? mensaje.id : estado.id);

        if (mensajeError) {
            mensaje.textContent = mensajeError;
            mensaje.hidden = !mostrarError;
            estado.hidden = true;
        } else {
            mensaje.hidden = true;
            estado.hidden = false;
        }

        if (mensajeError && !primerCampoInvalido) primerCampoInvalido = campo;
    });

    if (botonSiguiente) {
        botonSiguiente.disabled = Boolean(primerCampoInvalido);
    }

    return !primerCampoInvalido;
}

async function siguientePaso() {
    const paso1 = document.getElementById('paso-1');
    const botonSiguiente = paso1.querySelector('.boton-principal');
    const errorDisponibilidad = document.getElementById('error-disponibilidad-registro');
    paso1.querySelectorAll('input:not([type="hidden"]):not([type="file"])').forEach(campo => {
        campo.dataset.validacionActiva = 'true';
    });

    if (!validarPasoUno(true)) {
        enfocarPrimerCampoInvalido(paso1);
        return;
    }

    errorDisponibilidad.hidden = true;
    botonSiguiente.disabled = true;
    botonSiguiente.textContent = 'Verificando...';
    const valoresVerificados = {
        email: formularioRegistro.elements.email.value.trim(),
        nombre_usuario: formularioRegistro.elements.nombre_usuario.value.trim(),
        telefono: formularioRegistro.elements.telefono.value.trim()
    };

    try {
        const respuesta = await fetch('/registro/verificar-disponibilidad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(valoresVerificados)
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || 'No se pudo verificar la disponibilidad de los datos.');
        }
        if (!resultado.duplicados
            || typeof resultado.duplicados.email !== 'boolean'
            || typeof resultado.duplicados.nombre_usuario !== 'boolean'
            || typeof resultado.duplicados.telefono !== 'boolean') {
            throw new Error('El servidor devolvió una respuesta de disponibilidad inválida. Inténtalo de nuevo.');
        }
        const cambiaronDatos = Object.entries(valoresVerificados).some(([nombre, valor]) =>
            formularioRegistro.elements[nombre].value.trim() !== valor
        );
        if (cambiaronDatos) {
            errorDisponibilidad.textContent = 'Los datos cambiaron durante la verificación. Haz clic en “Siguiente” para comprobarlos nuevamente.';
            errorDisponibilidad.hidden = false;
            return;
        }

        const camposDuplicados = {
            email: {
                mensaje: 'Este correo ya está registrado.',
                nombre: 'email'
            },
            nombre_usuario: {
                mensaje: 'Este nombre de usuario ya está en uso.',
                nombre: 'nombre_usuario'
            },
            telefono: {
                mensaje: 'Este número de teléfono ya está registrado.',
                nombre: 'telefono'
            }
        };

        Object.entries(camposDuplicados).forEach(([clave, detalle]) => {
            const campo = formularioRegistro.elements[detalle.nombre];
            if (resultado.duplicados && resultado.duplicados[clave]) {
                campo.dataset.serverError = detalle.mensaje;
                campo.dataset.serverValue = campo.value.trim();
            } else {
                delete campo.dataset.serverError;
                delete campo.dataset.serverValue;
            }
        });

        if (!validarPasoUno(true)) {
            enfocarPrimerCampoInvalido(paso1);
            return;
        }

        paso1.classList.add('d-none');
        document.getElementById('paso-2').classList.remove('d-none');
        document.getElementById('bullet-1').classList.remove('activo');
        document.getElementById('bullet-2').classList.add('activo');
    } catch (error) {
        errorDisponibilidad.textContent = error.message || 'No se pudo verificar la disponibilidad de los datos. Inténtalo de nuevo.';
        errorDisponibilidad.hidden = false;
    } finally {
        botonSiguiente.textContent = 'Siguiente';
        validarPasoUno(true);
    }
}

function enfocarPrimerCampoInvalido(paso) {
    const primerCampoInvalido = paso.querySelector('.campo-entrada.is-invalid');
    if (primerCampoInvalido) {
        primerCampoInvalido.focus();
        primerCampoInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function anteriorPaso() {
    document.getElementById('paso-2').classList.add('d-none');
    document.getElementById('paso-1').classList.remove('d-none');
    document.getElementById('bullet-2').classList.remove('activo');
    document.getElementById('bullet-1').classList.add('activo');
}

function previsualizarImagen(evento) {
    const archivo = evento.target.files[0];
    if (archivo) {
        document.getElementById('vista-previa').src = URL.createObjectURL(archivo);
    }
}

const aceptaTerminos = document.getElementById('acepta-terminos');
const errorAceptaTerminos = document.getElementById('error-acepta-terminos');

if (formularioRegistro) {
    const hayErrorBackend = document.querySelector('.alert-danger, .alert');
    if (!hayErrorBackend) {
        try {
            window.sessionStorage.removeItem(claveBorrador);
        } catch (error) {}
    }

    restaurarBorradorRegistro();

    formularioRegistro.querySelectorAll('#paso-1 input').forEach(campo => {
        campo.addEventListener('input', guardarBorradorRegistro);
        campo.addEventListener('change', guardarBorradorRegistro);
        
        campo.addEventListener('input', () => {
            campo.dataset.validacionActiva = 'true';
            
            if (campo.dataset.serverValue !== undefined && campo.value.trim() !== campo.dataset.serverValue) {
                delete campo.dataset.serverError;
                delete campo.dataset.serverValue;
            }
            
            document.getElementById('error-disponibilidad-registro').hidden = true;
            
            const confirmarPassword = formularioRegistro.elements.confirmar_password;
            if (confirmarPassword) confirmarPassword.dataset.validacionActiva = 'true';
            
            validarPasoUno(false); 
        });
        
        campo.addEventListener('change', () => validarPasoUno(false));
    });

   validarPasoUno(false);
}

if (formularioRegistro && aceptaTerminos && errorAceptaTerminos) {
    aceptaTerminos.addEventListener('invalid', () => {
        errorAceptaTerminos.textContent = 'Debes aceptar los Términos y Condiciones para completar el registro.';
    });

    formularioRegistro.addEventListener('submit', (evento) => {
        if (!aceptaTerminos.checked) {
            evento.preventDefault();
            aceptaTerminos.setCustomValidity('Debes aceptar los Términos y Condiciones para registrarte.');
            errorAceptaTerminos.textContent = 'Debes aceptar los Términos y Condiciones para completar el registro.';
            aceptaTerminos.reportValidity();
            aceptaTerminos.focus();
        }
    });

    aceptaTerminos.addEventListener('change', () => {
        aceptaTerminos.setCustomValidity('');
        errorAceptaTerminos.textContent = '';
    });
}