document.addEventListener('DOMContentLoaded', () => {
    let formActual = null;

    document.querySelectorAll('.modal-confirmacion').forEach((modal) => {
        modal.addEventListener('show.bs.modal', (evento) => {
            formActual = evento.relatedTarget?.closest('form') || null;
        });

        modal.querySelector('[data-confirmar-formulario]')?.addEventListener('click', () => {
            if (formActual) formActual.submit();
        });
    });
});