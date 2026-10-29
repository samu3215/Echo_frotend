const vistaTerminos = document.getElementById('vista-terminos');
const controlesAbrirTerminos = document.querySelectorAll('[data-terminos-abrir]');
const botonVolverTerminos = document.querySelector('[data-terminos-volver]');

if (vistaTerminos && controlesAbrirTerminos.length && botonVolverTerminos) {
    let vistaOrigen = null;
    let controlOrigen = null;

    const abrirTerminos = (control) => {
        vistaOrigen = control.closest('[data-terminos-origen]');
        if (!vistaOrigen) return;

        controlOrigen = control;
        vistaOrigen.hidden = true;
        vistaOrigen.setAttribute('aria-hidden', 'true');
        vistaTerminos.hidden = false;
        vistaTerminos.setAttribute('aria-hidden', 'false');
        document.body.classList.add('terminos-abiertos');
        botonVolverTerminos.focus();
        vistaTerminos.scrollTop = 0;
    };

    const volverDesdeTerminos = () => {
        if (!vistaOrigen) return;

        vistaTerminos.hidden = true;
        vistaTerminos.setAttribute('aria-hidden', 'true');
        vistaOrigen.hidden = false;
        vistaOrigen.setAttribute('aria-hidden', 'false');
        document.body.classList.remove('terminos-abiertos');

        if (controlOrigen) controlOrigen.focus();
        vistaOrigen = null;
        controlOrigen = null;
    };

    controlesAbrirTerminos.forEach((control) => {
        control.addEventListener('click', () => abrirTerminos(control));
    });

    botonVolverTerminos.addEventListener('click', volverDesdeTerminos);

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && !vistaTerminos.hidden) {
            volverDesdeTerminos();
        }
    });
}
