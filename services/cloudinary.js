const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const TAMANO_MAXIMO_MB = 60;
const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

exports.subirArchivoCloudinary = (archivo, carpeta = 'general', es_perfil = false) => {
    return new Promise((resolve, reject) => {
        
        const tamanoMB = archivo.size / (1024 * 1024);
        if (tamanoMB > TAMANO_MAXIMO_MB) {
            return reject(new Error(`El archivo es demasiado grande. El límite es ${TAMANO_MAXIMO_MB} MB.`));
        }

        if (!FORMATOS_PERMITIDOS.includes(archivo.mimetype)) {
            return reject(new Error("Formato no soportado. Revisa las extensiones permitidas."));
        }

        if (es_perfil && archivo.mimetype.includes('video')) {
            return reject(new Error("Las fotos de perfil deben ser imágenes, no videos."));
        }

        const esVideo = archivo.mimetype.includes('video');
        const tipo_recurso = esVideo ? 'video' : 'image';

        const opcionesSubida = {
            folder: carpeta,
            resource_type: tipo_recurso,
            chunk_size: 6000000 
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            opcionesSubida,
            (error, result) => {
                if (result) {
                    
                    let urlOptimizada = result.secure_url;
                    
                    if (esVideo) {
                        urlOptimizada = urlOptimizada.replace('/upload/', '/upload/q_auto,f_auto,vc_auto/');
                    } else {
                        urlOptimizada = urlOptimizada.replace('/upload/', '/upload/q_auto,f_auto/');
                    }
                    
                    resolve(urlOptimizada);
                } else {
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(archivo.buffer).pipe(uploadStream);
    });
};