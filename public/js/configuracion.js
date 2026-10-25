document.addEventListener('DOMContentLoaded', () => {
    const switchModoOscuro = document.getElementById('switchModoOscuro');

    if (!switchModoOscuro) return;

    // Verificar preferencia guardada
    const temaGuardado = localStorage.getItem('tema_echo');

    if (temaGuardado === 'oscuro') {
        document.documentElement.classList.add('modo-oscuro');
        document.body.classList.add('modo-oscuro');
        switchModoOscuro.checked = true;
    } else {
        document.documentElement.classList.remove('modo-oscuro');
        document.body.classList.remove('modo-oscuro');
        switchModoOscuro.checked = false;
    }

    // Escuchar el cambio en el switch
    switchModoOscuro.addEventListener('change', () => {
        if (switchModoOscuro.checked) {
            document.documentElement.classList.add('modo-oscuro');
            document.body.classList.add('modo-oscuro');
            localStorage.setItem('tema_echo', 'oscuro');
        } else {
            document.documentElement.classList.remove('modo-oscuro');
            document.body.classList.remove('modo-oscuro');
            localStorage.setItem('tema_echo', 'claro');
        }
    });
});

