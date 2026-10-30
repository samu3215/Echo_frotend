const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const sharp = require('sharp'); 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const TAMANO_MAXIMO_MB = 60; 
const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']

exports.subirArchivoCloudinary = async (archivo, carpeta = 'general', es_perfil = false) => {
    return new Promise(async (resolve, reject) => { 
        
        const tamanoMB = archivo.size / (1024 * 1024);
        if (tamanoMB > TAMANO_MAXIMO_MB) {
            return reject(new Error(`El archivo es demasiado grande. El límite es ${TAMANO_MAXIMO_MB} MB.`))
        }

        if (!FORMATOS_PERMITIDOS.includes(archivo.mimetype)) {
            return reject(new Error("Formato no soportado. Revisa las extensiones permitidas."))
        }

        if (es_perfil && archivo.mimetype.includes('video')) {
            return reject(new Error("Las fotos de perfil deben ser imágenes, no videos."))
        }

        const esVideo = archivo.mimetype.includes('video')
        const tipo_recurso = esVideo ? 'video' : 'image'
        let bufferFinal = archivo.buffer;
        
        if (!esVideo) { 
            try {
                bufferFinal = await sharp(archivo.buffer)
                    .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true }) 
                    .webp({ quality: 80 }) 
                    .toBuffer();
            } catch (err) {
                console.error("Error comprimiendo con sharp, se enviará original", err)
            }
        }

        const opcionesSubida = {
            folder: carpeta,
            resource_type: tipo_recurso,
            chunk_size: 6000000 
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            opcionesSubida,
            (error, result) => {
                if (result) {
                    let urlOptimizada = result.secure_url
                    

                    if (esVideo) {
                        urlOptimizada = urlOptimizada.replace('/upload/', '/upload/q_auto,f_auto,vc_auto/')
                    } else {
                        urlOptimizada = urlOptimizada.replace('/upload/', '/upload/c_limit,w_1080,q_auto,f_auto/')
                    }
                    
                    resolve(urlOptimizada)
                } else {
                    reject(error)
                }
            }
        )

        streamifier.createReadStream(bufferFinal).pipe(uploadStream);
    })
}