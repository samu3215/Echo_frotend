exports.noEncontrado = (req, res, next) => {
    res.status(404).render('pages/404', {
        titulo: 'Página no encontrada',
        error: 'La página que buscas no existe o ha sido movida.'
    });
};

exports.errorServidor = (err, req, res, next) => {
    console.error(err.stack)
    
    res.status(500).render('pages/500', {
        titulo: 'Error interno',
        error: 'Algo salió mal en el servidor. Por favor, inténtalo más tarde.'
    })
}