let emailActual = '';
let tokenRecuperacion = '';

const paso1 = document.getElementById('paso-1');
const paso2 = document.getElementById('paso-2');
const paso3 = document.getElementById('paso-3');

const formSolicitar = document.getElementById('form-solicitar-codigo');
const formVerificar = document.getElementById('form-verificar-codigo');
const formRestablecer = document.getElementById('form-restablecer-contrasena');

// PASO 1: SOLICITAR CÓDIGO
formSolicitar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-solicitar');
    const msjError = document.getElementById('error-solicitud');
    emailActual = document.getElementById('email').value.trim();

    if (!emailActual) return;

    try {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        msjError.hidden = true;

        const res = await fetch('/cambio-contrasena/solicitar-codigo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailActual })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error al solicitar el código.');

        // Transición visual
        document.getElementById('correo-destino').textContent = emailActual;
        paso1.classList.add('d-none');
        paso2.classList.remove('d-none');

    } catch (error) {
        msjError.textContent = error.message;
        msjError.hidden = false;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar código';
    }
});

// NAVEGACIÓN: ATRÁS Y REENVIAR
window.volverAlPaso1 = function() {
    paso2.classList.add('d-none');
    paso1.classList.remove('d-none');
    document.getElementById('codigo').value = '';
    document.getElementById('error-verificacion').hidden = true;
};

window.reenviarCodigo = function() {
    document.getElementById('btn-solicitar').click();
};

document.getElementById('codigo').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
});

// PASO 2: VERIFICAR CÓDIGO
formVerificar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-verificar');
    const codigo = document.getElementById('codigo').value.trim();
    const msjError = document.getElementById('error-verificacion');

    if (codigo.length !== 6) {
        msjError.textContent = 'El código debe tener 6 dígitos.';
        msjError.hidden = false;
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Verificando...';
        msjError.hidden = true;

        const res = await fetch('/cambio-contrasena/verificar-codigo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailActual, codigo })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Código inválido o expirado.');

        tokenRecuperacion = data.token || data.access_token || data.temp_token;

        // Transición visual
        paso2.classList.add('d-none');
        paso3.classList.remove('d-none');

    } catch (error) {
        msjError.textContent = error.message;
        msjError.hidden = false;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Verificar código';
    }
});

// PASO 3: RESTABLECER CONTRASEÑA
formRestablecer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-restablecer');
    const msjError = document.getElementById('error-restablecer');
    const nuevaPassword = document.getElementById('nueva-password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;

    if (nuevaPassword !== confirmarPassword) {
        msjError.textContent = 'Las contraseñas no coinciden.';
        msjError.hidden = false;
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Guardando...';
        msjError.hidden = true;

        const res = await fetch('/cambio-contrasena/restablecer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: tokenRecuperacion,
                password: nuevaPassword,
                confirmar_password: confirmarPassword
            })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error al restablecer la contraseña.');

        window.location.href = `/login?exito=${encodeURIComponent('Contraseña restablecida correctamente.')}`;

    } catch (error) {
        msjError.textContent = error.message;
        msjError.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Guardar contraseña';
    }
});