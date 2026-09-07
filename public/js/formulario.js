function siguientePaso() {
    const paso1 = document.getElementById('paso-1');
    const camposRequeridos = paso1.querySelectorAll('input[required]');
    let esValido = true;

    camposRequeridos.forEach(campo => {
        if (!campo.checkValidity()) {
            campo.reportValidity();
            esValido = false;
        }
    });

    if (esValido) {
        paso1.classList.add('d-none');
        document.getElementById('paso-2').classList.remove('d-none');
        document.getElementById('bullet-1').classList.remove('activo');
        document.getElementById('bullet-2').classList.add('activo');
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