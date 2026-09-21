document.addEventListener('DOMContentLoaded', () => {
    let formActual = null;

    document.getElementById('modalConfirmacion')?.addEventListener('show.bs.modal', (e) => {
        formActual = e.relatedTarget.closest('form');
    });

    document.getElementById('btnConfirmarEliminacion')?.addEventListener('click', () => {
        if (formActual) formActual.submit();
    });
});