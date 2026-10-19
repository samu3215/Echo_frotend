document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-notificaciones');
    if (!lista) return;

    const cuerpo = document.body;
    const usuarioActual = cuerpo && cuerpo.dataset.usuarioActual && cuerpo.dataset.usuarioActual !== 'Tú'
        ? cuerpo.dataset.usuarioActual
        : null;

    const notificaciones = JSON.parse(localStorage.getItem('echo_notificaciones') || '[]');
    const visibles = usuarioActual
        ? notificaciones.filter((notificacion) => notificacion.para === usuarioActual)
        : notificaciones;

    if (!visibles.length) {
        lista.innerHTML = `
            <div class="vacio-notificaciones">
                <i class="bi bi-bell-slash"></i>
                <p>No tienes notificaciones todavía.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = visibles.map((notificacion) => `
        <article class="item-notificacion ${notificacion.tipo || 'general'}">
            <div class="icono-notificacion">
                <i class="bi bi-star-fill"></i>
            </div>
            <div class="contenido-notificacion">
                <p class="titulo-notificacion">${notificacion.mensaje || 'Nueva notificación'}</p>
                <small>${new Date(notificacion.fecha || Date.now()).toLocaleString()}</small>
            </div>
        </article>
    `).join('');
});
