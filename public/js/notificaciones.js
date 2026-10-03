// ==========================================
// DATOS DE LAS NOTIFICACIONES
// ==========================================

let notificaciones = [
    {
        id: 1,
        nombre: "Lucía Fernández",
        iniciales: "LF",
        mensaje: "ha comenzado a seguirte.",
        tiempo: "Hace 2 min",
        categoria: "seguidores",
        leida: false
    },

    {
        id: 2,
        nombre: "Martín Ruiz",
        iniciales: "MR",
        mensaje: "le ha dado like a tu publicación.",
        tiempo: "Hace 8 min",
        categoria: "likes",
        leida: false
    },

    {
        id: 3,
        nombre: "Sofía Castro",
        iniciales: "SC",
        mensaje: "comentó: Me encanta esta idea, ¡gran trabajo!",
        tiempo: "Hace 25 min",
        categoria: "comentarios",
        leida: false
    },

    {
        id: 4,
        nombre: "Diego López",
        iniciales: "DL",
        mensaje: "te ha enviado un nuevo mensaje.",
        tiempo: "Hace 1 h",
        categoria: "mensajes",
        leida: true
    },

    {
        id: 5,
        nombre: "Elena Morales",
        iniciales: "EM",
        mensaje: "ha comenzado a seguirte.",
        tiempo: "Hace 3 h",
        categoria: "seguidores",
        leida: true
    },

    {
        id: 6,
        nombre: "Álvaro Martín",
        iniciales: "AM",
        mensaje: "le ha dado like a tu comentario.",
        tiempo: "Ayer",
        categoria: "likes",
        leida: true
    }
];


// ==========================================
// CATEGORÍA ACTUAL
// ==========================================

let categoriaActual = "todas";


// ==========================================
// MOSTRAR NOTIFICACIONES
// ==========================================

function mostrarNotificaciones() {

    const contenedor = document.getElementById("notificaciones-app");

    let notificacionesMostrar = notificaciones;

    // Filtrar por categoría
    if (categoriaActual !== "todas") {

        notificacionesMostrar = notificaciones.filter(function(notificacion) {

            return notificacion.categoria === categoriaActual;

        });

    }


    // Contar no leídas
    const noLeidas = notificaciones.filter(function(notificacion) {

        return !notificacion.leida;

    }).length;


    // Crear HTML
    let html = `

        <div class="notificaciones-contenedor">

            <div class="notificaciones-titulo">

                <div>

                    <h1>🔔 Notificaciones</h1>

                    <p>
                        Revisa las novedades de tu cuenta.
                    </p>

                </div>

                <button
                    class="btn-leer-todas"
                    onclick="marcarTodasLeidas()"
                >
                    Marcar todo como leído
                </button>

            </div>


            <div class="filtros-notificaciones">

                <button
                    class="filtro-notificacion ${categoriaActual === "todas" ? "activo" : ""}"
                    onclick="cambiarCategoria('todas')"
                >
                    🔔 Todas ${noLeidas > 0 ? "(" + noLeidas + ")" : ""}
                </button>


                <button
                    class="filtro-notificacion ${categoriaActual === "seguidores" ? "activo" : ""}"
                    onclick="cambiarCategoria('seguidores')"
                >
                    👤 Seguidores
                </button>


                <button
                    class="filtro-notificacion ${categoriaActual === "likes" ? "activo" : ""}"
                    onclick="cambiarCategoria('likes')"
                >
                    ❤️ Likes
                </button>


                <button
                    class="filtro-notificacion ${categoriaActual === "comentarios" ? "activo" : ""}"
                    onclick="cambiarCategoria('comentarios')"
                >
                    💬 Comentarios
                </button>


                <button
                    class="filtro-notificacion ${categoriaActual === "mensajes" ? "activo" : ""}"
                    onclick="cambiarCategoria('mensajes')"
                >
                    ✉️ Mensajes
                </button>

            </div>


            <div class="lista-notificaciones">

                <div class="cabecera-notificaciones">

                    <strong>
                        ${categoriaActual === "todas"
                            ? "Todas las notificaciones"
                            : categoriaActual}
                    </strong>

                    <span>
                        ${notificacionesMostrar.length} notificaciones
                    </span>

                </div>

    `;


    // Si no existen notificaciones
    if (notificacionesMostrar.length === 0) {

        html += `

            <div class="sin-notificaciones">

                <h3>No hay notificaciones</h3>

                <p>
                    Cuando tengas actividad nueva aparecerá aquí.
                </p>

            </div>

        `;

    }


    // Crear cada notificación
    notificacionesMostrar.forEach(function(notificacion) {

        html += `

            <div
                class="notificacion ${!notificacion.leida ? "no-leida" : ""}"
                onclick="marcarLeida(${notificacion.id})"
            >

                <div class="avatar-notificacion">

                    ${notificacion.iniciales}

                </div>


                <div class="contenido-notificacion">

                    <p>

                        <strong>
                            ${notificacion.nombre}
                        </strong>

                        ${notificacion.mensaje}

                    </p>

                    <p class="tiempo-notificacion">

                        ${notificacion.tiempo}

                    </p>

                </div>


                <div class="icono-notificacion">

                    ${obtenerIcono(notificacion.categoria)}

                </div>

            </div>

        `;

    });


    html += `

            </div>

        </div>

    `;


    contenedor.innerHTML = html;

}


// ==========================================
// CAMBIAR CATEGORÍA
// ==========================================

function cambiarCategoria(categoria) {

    categoriaActual = categoria;

    mostrarNotificaciones();

}


// ==========================================
// MARCAR UNA COMO LEÍDA
// ==========================================

function marcarLeida(id) {

    notificaciones.forEach(function(notificacion) {

        if (notificacion.id === id) {

            notificacion.leida = true;

        }

    });


    mostrarNotificaciones();

}


// ==========================================
// MARCAR TODAS COMO LEÍDAS
// ==========================================

function marcarTodasLeidas() {

    notificaciones.forEach(function(notificacion) {

        notificacion.leida = true;

    });


    mostrarNotificaciones();

}


// ==========================================
// ICONOS
// ==========================================

function obtenerIcono(categoria) {

    if (categoria === "seguidores") {

        return "👤";

    }

    if (categoria === "likes") {

        return "❤️";

    }

    if (categoria === "comentarios") {

        return "💬";

    }

    if (categoria === "mensajes") {

        return "✉️";

    }

    return "🔔";

}


// ==========================================
// INICIAR MÓDULO
// ==========================================

mostrarNotificaciones();