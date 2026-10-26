const formularios = {
    solicitar: document.getElementById('form-solicitar-codigo'),
    verificar: document.getElementById('form-verificar-codigo'),
    restablecer: document.getElementById('form-restablecer-contrasena')
};

const secciones = [...document.querySelectorAll('[data-paso]')];
const indicadores = [...document.querySelectorAll('[data-indicador-paso]')];
const mensaje = document.getElementById('mensaje-recuperacion');
const correoInput = document.getElementById('email');
const correoDestino = document.getElementById('correo-destino');
const codigoInput = document.getElementById('codigo');
const temporizador = document.getElementById('temporizador-codigo');
const avisoExpiracion = temporizador.closest('.aviso-expiracion');
const botonReenviar = document.getElementById('reenviar-codigo');
const claveEstadoTemporizador = 'echo:recuperacion:codigo';

let emailRecuperacion = '';
let tokenRecuperacion = '';
let expiracionCodigo = 0;
let intervaloTemporizador = null;

const mostrarMensaje = (texto, tipo = 'danger') => {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo}`;
    mensaje.classList.remove('d-none');
};

const limpiarMensaje = () => {
    mensaje.textContent = '';
    mensaje.className = 'alert d-none';
};

const mostrarPaso = (numero) => {
    secciones.forEach((seccion) => {
        const esPasoActivo = Number(seccion.dataset.paso) === numero;
        seccion.hidden = !esPasoActivo;
        seccion.classList.toggle('paso-visible', esPasoActivo);
    });

    indicadores.forEach((indicador) => {
        const activo = Number(indicador.dataset.indicadorPaso) <= numero;
        indicador.classList.toggle('activo', activo);
        if (Number(indicador.dataset.indicadorPaso) === numero) {
            indicador.setAttribute('aria-current', 'step');
        } else {
            indicador.removeAttribute('aria-current');
        }
    });

    limpiarMensaje();
};

const enviarSolicitud = async (url, datos, boton) => {
    boton.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const cuerpo = await respuesta.text();
        let resultado;

        try {
            resultado = cuerpo ? JSON.parse(cuerpo) : {};
        } catch (error) {
            console.error('La respuesta no contiene JSON válido.', {
                url: respuesta.url || url,
                status: respuesta.status,
                statusText: respuesta.statusText,
                error,
                cuerpo
            });
            throw new Error(`El servidor devolvió una respuesta no válida (HTTP ${respuesta.status}).`);
        }

        if (!respuesta.ok) {
            const error = new Error(
                resultado.error || `La solicitud falló (HTTP ${respuesta.status} ${respuesta.statusText}).`
            );
            console.error('El servidor rechazó la solicitud de recuperación.', {
                url: respuesta.url || url,
                status: respuesta.status,
                statusText: respuesta.statusText,
                respuesta: resultado
            });
            throw error;
        }

        return resultado;
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('Falló la conexión con la ruta de recuperación. Comprueba el servidor Express, la red y CORS si la petición es cross-origin.', {
                url,
                error
            });
            throw new Error('No se pudo conectar con el servidor. Revisa la consola del navegador para ver el detalle de la conexión.');
        }

        throw error;
    } finally {
        boton.disabled = false;
    }
};

const actualizarTemporizador = () => {
    const segundosRestantes = Math.max(0, Math.ceil((expiracionCodigo - Date.now()) / 1000));
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    temporizador.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    const vencido = segundosRestantes === 0;
    avisoExpiracion.classList.toggle('aviso-expiracion-vencido', vencido);
    codigoInput.disabled = vencido;
    formularios.verificar.querySelector('button[type="submit"]').disabled = vencido;
    botonReenviar.disabled = !vencido;

    if (vencido && intervaloTemporizador) {
        window.clearInterval(intervaloTemporizador);
        intervaloTemporizador = null;
        temporizador.textContent = '00:00 — solicita un código nuevo';
    }
};

const iniciarTemporizador = (expiresIn) => {
    if (intervaloTemporizador) {
        window.clearInterval(intervaloTemporizador);
    }

    const segundos = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 180;
    expiracionCodigo = Date.now() + segundos * 1000;
    guardarEstadoTemporizador();
    actualizarTemporizador();
    intervaloTemporizador = window.setInterval(actualizarTemporizador, 1000);
};

const guardarEstadoTemporizador = () => {
    try {
        window.sessionStorage.setItem(claveEstadoTemporizador, JSON.stringify({
            email: emailRecuperacion,
            expiraEn: expiracionCodigo
        }));
    } catch (error) {
        console.error('No se pudo guardar la expiración del código de recuperación.', error);
        mostrarMensaje('No se pudo guardar el temporizador en esta pestaña. Mantén esta página abierta hasta verificar o reenviar el código.');
    }
};

const restaurarEstadoTemporizador = () => {
    let estado;
    try {
        const estadoGuardado = window.sessionStorage.getItem(claveEstadoTemporizador);
        if (!estadoGuardado) return;
        estado = JSON.parse(estadoGuardado);
    } catch (error) {
        console.error('No se pudo recuperar el temporizador del código.', error);
        try {
            window.sessionStorage.removeItem(claveEstadoTemporizador);
        } catch (errorAlLimpiar) {
            console.error('No se pudo eliminar el temporizador inválido.', errorAlLimpiar);
        }
        return;
    }

    if (
        !estado
        || typeof estado.email !== 'string'
        || !estado.email
        || !Number.isFinite(estado.expiraEn)
    ) {
        console.error('El estado persistido del temporizador tiene un formato inválido.');
        try {
            window.sessionStorage.removeItem(claveEstadoTemporizador);
        } catch (error) {
            console.error('No se pudo eliminar el temporizador inválido.', error);
        }
        return;
    }

    emailRecuperacion = estado.email;
    expiracionCodigo = estado.expiraEn;
    correoDestino.textContent = emailRecuperacion;
    codigoInput.disabled = false;
    mostrarPaso(2);
    actualizarTemporizador();

    if (Date.now() < expiracionCodigo) {
        intervaloTemporizador = window.setInterval(actualizarTemporizador, 1000);
    }
};

const limpiarEstadoTemporizador = () => {
    try {
        window.sessionStorage.removeItem(claveEstadoTemporizador);
    } catch (error) {
        console.error('No se pudo limpiar el temporizador del código.', error);
    }
};

const obtenerSegundosExpiracion = (respuesta) => {
    if (!respuesta || typeof respuesta !== 'object') {
        return null;
    }

    const propiedad = ['expira_en', 'expires_at', 'tiempo_expiracion', 'exp', 'expires_in', 'expiresIn']
        .find((nombre) => respuesta[nombre] !== undefined && respuesta[nombre] !== null);
    const valor = propiedad ? respuesta[propiedad] : null;
    const unidadEnMinutos = ['expira_en', 'tiempo_expiracion'].includes(propiedad);

    if (typeof valor === 'number') {
        if (['expires_at', 'exp'].includes(propiedad) && valor > 1_000_000_000) {
            const timestamp = valor > 100_000_000_000 ? valor : valor * 1000;
            const restante = (timestamp - Date.now()) / 1000;
            return restante > 0 ? restante : null;
        }

        const segundos = unidadEnMinutos ? valor * 60 : valor;
        return Number.isFinite(segundos) && segundos > 0 ? segundos : null;
    }

    if (typeof valor !== 'string' || !valor.trim()) {
        return null;
    }

    const texto = valor.trim();
    const segundos = Number(texto);

    if (Number.isFinite(segundos) && segundos > 0) {
        if (['expires_at', 'exp'].includes(propiedad) && segundos > 1_000_000_000) {
            const timestamp = segundos > 100_000_000_000 ? segundos : segundos * 1000;
            const restante = (timestamp - Date.now()) / 1000;
            return restante > 0 ? restante : null;
        }

        return unidadEnMinutos ? segundos * 60 : segundos;
    }

    const duracion = texto.match(/^(\d+(?:[.,]\d+)?)\s*(s|segundos?|m|minutos?|h|horas?)$/i);
    if (duracion) {
        const cantidad = Number(duracion[1].replace(',', '.'));
        const unidad = duracion[2].toLowerCase();
        const multiplicador = unidad.startsWith('h')
            ? 3600
            : unidad.startsWith('m') || (!/s|segundo/.test(unidad) && unidadEnMinutos)
                ? 60
                : 1;
        const total = cantidad * multiplicador;
        return Number.isFinite(total) && total > 0 ? total : null;
    }

    const fechaExpiracion = Date.parse(texto);
    if (Number.isFinite(fechaExpiracion)) {
        const restante = (fechaExpiracion - Date.now()) / 1000;
        return restante > 0 ? restante : null;
    }

    return null;
};

const solicitarCodigo = async (boton) => {
    try {
        const resultado = await enviarSolicitud(
            '/cambio-contrasena/solicitar-codigo',
            { email: emailRecuperacion },
            boton
        );
        const expiresIn = obtenerSegundosExpiracion(resultado);
        const respuesta = resultado && typeof resultado === 'object' ? resultado : {};

        correoDestino.textContent = emailRecuperacion;
        codigoInput.disabled = false;
        formularios.verificar.querySelector('button[type="submit"]').disabled = false;
        mostrarPaso(2);
        mostrarMensaje(respuesta.mensaje || 'Si el correo está asociado a una cuenta, recibirás un código.', 'success');

        avisoExpiracion.classList.remove('aviso-expiracion-vencido');
        iniciarTemporizador(expiresIn || 180);
    } catch (error) {
        console.error('No se pudo completar POST /cambio-contrasena/solicitar-codigo.', {
            endpoint: '/cambio-contrasena/solicitar-codigo',
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        mostrarMensaje(error.message);
    }
};

formularios.solicitar.addEventListener('submit', async (event) => {
    event.preventDefault();
    limpiarMensaje();

    if (!formularios.solicitar.reportValidity()) {
        return;
    }

    emailRecuperacion = correoInput.value.trim();
    const boton = formularios.solicitar.querySelector('button[type="submit"]');
    await solicitarCodigo(boton);
});

formularios.verificar.addEventListener('submit', async (event) => {
    event.preventDefault();
    limpiarMensaje();

    if (!formularios.verificar.reportValidity()) {
        return;
    }

    const boton = formularios.verificar.querySelector('button[type="submit"]');

    try {
        const resultado = await enviarSolicitud(
            '/cambio-contrasena/verificar-codigo',
            { email: emailRecuperacion, codigo: codigoInput.value.trim() },
            boton
        );

        const tokenTemporal = resultado.token
            || resultado.access_token
            || resultado.temp_token
            || resultado.reset_token;

        if (typeof tokenTemporal !== 'string' || !tokenTemporal) {
            throw new Error('El servidor no devolvió el token temporal de recuperación.');
        }

        tokenRecuperacion = tokenTemporal;
        if (intervaloTemporizador) {
            window.clearInterval(intervaloTemporizador);
            intervaloTemporizador = null;
        }
        limpiarEstadoTemporizador();
        mostrarPaso(3);
    } catch (error) {
        actualizarTemporizador();
        mostrarMensaje(error.message);
    }
});

codigoInput.addEventListener('input', () => {
    codigoInput.value = codigoInput.value.replace(/\D/g, '').slice(0, 6);
});

botonReenviar.addEventListener('click', async () => {
    limpiarMensaje();
    await solicitarCodigo(botonReenviar);
});

formularios.restablecer.addEventListener('submit', async (event) => {
    event.preventDefault();
    limpiarMensaje();

    if (!formularios.restablecer.reportValidity()) {
        return;
    }

    const nuevaPassword = document.getElementById('nueva-password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;

    if (nuevaPassword !== confirmarPassword) {
        mostrarMensaje('Las contraseñas no coinciden.');
        return;
    }

    const boton = formularios.restablecer.querySelector('button[type="submit"]');

    try {
        const resultado = await enviarSolicitud(
            '/cambio-contrasena/restablecer',
            {
                token: tokenRecuperacion,
                password: nuevaPassword,
                confirmar_password: confirmarPassword
            },
            boton
        );
        window.location.assign(`/login?exito=${encodeURIComponent(resultado.message || 'Contraseña restablecida correctamente.')}`);
    } catch (error) {
        mostrarMensaje(error.message);
    }
});

restaurarEstadoTemporizador();
