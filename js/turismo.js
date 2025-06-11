/**
 * Módulo principal para la página de turismo de San Martín del Rey Aurelio
 * Autor: UO295445
 * Fecha: 2025-06-03 10:03:46
 */

// Clase principal para gestionar la aplicación
class AplicacionTurismo {
    constructor() {
        // Instanciar los componentes principales
        this.carrusel = new CarruselFotos();
        this.noticias = new SeccionNoticias();
    }

    // Inicializar la aplicación
    iniciar() {
        // Iniciar componentes cuando el DOM esté listo
        $(document).ready(() => {
            // Detectar si estamos en la página principal
            if (this.esPaginaPrincipal()) {
                this.carrusel.inicializar();
                this.noticias.cargarNoticias();
            }
        });
    }
    
    // Detectar si estamos en la página principal
    esPaginaPrincipal() {
        // Verificar si existe la estructura de la página principal
        return $('section:nth-of-type(2)').length > 0 && 
               $('main > section:nth-of-type(4)').length > 0;
    }
}

/**
 * Clase para gestionar el carrusel de fotos
 */
class CarruselFotos {
    constructor() {
        // Configuración del carrusel
        this.config = {
            seccion: 'section:nth-of-type(2)', // Segunda sección = carrusel
            intervalo: 5000, // 5 segundos para cambio automático
            duracionTransicion: 500 // 0.5 segundos de transición
        };
        
        // Lista de imágenes para el carrusel
        this.imagenes = [
            {
                src: 'multimedia/pozo_minero.jpg',
                alt: 'Pozo Minero San Vicente',
                descripcion: 'El emblemático pozo minero, símbolo del patrimonio industrial de San Martín del Rey Aurelio'
            },
            {
                src: 'multimedia/mapa_smra.jpg',
                alt: 'Mapa de situación de San Martín del Rey Aurelio',
                descripcion: 'Ubicación de San Martín del Rey Aurelio en Asturias'
            },
            {
                src: 'multimedia/senda_verde.jpg',
                alt: 'Senda Verde del Nalón',
                descripcion: 'La Senda Verde del Nalón, un recorrido natural por antiguos caminos mineros'
            },
            {
                src: 'multimedia/museo_mineria.jpg',
                alt: 'Museo de la Minería',
                descripcion: 'El Museo de la Minería, donde conocer la historia de la industria minera asturiana'
            },
            {
                src: 'multimedia/plaza_ayuntamiento.jpg',
                alt: 'Plaza del Ayuntamiento',
                descripcion: 'La Plaza del Ayuntamiento, centro neurálgico de la vida social del municipio'
            },
            {
                src: 'multimedia/gastronomia_local.jpg',
                alt: 'Gastronomía local',
                descripcion: 'La rica gastronomía asturiana, uno de los principales atractivos de la zona'
            }
        ];
        
        // Estado interno
        this.indiceActual = 0;
        this.totalImagenes = this.imagenes.length;
        this.intervaloAutomatico = null;
    }

    // Inicializar el carrusel
    inicializar() {
        const $seccion = $(this.config.seccion);
        
        // Solo inicializar si la sección del carrusel existe
        if ($seccion.length > 0) {
            // Crear estructura del carrusel
            this.crearEstructuraHTML();
            
            // Configurar eventos
            this.configurarEventos();
            
            // Iniciar el cambio automático
            this.iniciarCambioAutomatico();
            
            // Mostrar la primera imagen
            this.mostrarImagen(0);
        }
    }

    // Crear la estructura HTML del carrusel
    crearEstructuraHTML() {
        const $seccion = $(this.config.seccion);
        
        // Mantener el título h2, eliminar cualquier otro contenido
        const $titulo = $seccion.find('h2').detach();
        $seccion.empty().append($titulo);
        
        // Crear contenedor exterior del carrusel (section simple)
        const contenedorCarrusel = document.createElement('section');
        const h3 = document.createElement('h3');
        h3.textContent = 'Carrusel de imágenes';
        contenedorCarrusel.appendChild(h3);
        
        // Crear contenedor de imágenes (section interior)
        const contenedorImagenes = document.createElement('section');
        const h6 = document.createElement('h6');
        h6.textContent = 'Imágenes destacadas';
        contenedorImagenes.appendChild(h6);

        // Añadir imágenes al contenedor
        this.imagenes.forEach((imagen) => {
            const figura = document.createElement('figure');
            
            const img = document.createElement('img');
            img.src = imagen.src;
            img.alt = imagen.alt;
            
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = imagen.descripcion;
            
            figura.appendChild(img);
            figura.appendChild(figcaption);
            contenedorImagenes.appendChild(figura);
        });
        
        // Agregar contenedor de imágenes al contenedor del carrusel
        contenedorCarrusel.appendChild(contenedorImagenes);
        
        // Crear botones de navegación
        const btnAnterior = document.createElement('button');
        btnAnterior.innerHTML = '&lsaquo;';
        btnAnterior.setAttribute('type', 'button');
        btnAnterior.setAttribute('aria-label', 'Imagen anterior');
        
        const btnSiguiente = document.createElement('button');
        btnSiguiente.innerHTML = '&rsaquo;';
        btnSiguiente.setAttribute('type', 'button');
        btnSiguiente.setAttribute('aria-label', 'Imagen siguiente');
        
        // Agregar botones al contenedor del carrusel
        contenedorCarrusel.appendChild(btnAnterior);
        contenedorCarrusel.appendChild(btnSiguiente);
        
        // Crear indicadores (menu)
        const menu = document.createElement('menu');
        
        for (let i = 0; i < this.totalImagenes; i++) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-label', `Ver imagen ${i + 1}`);
            
            // Almacenar el índice como propiedad personalizada
            btn._indice = i;
            
            li.appendChild(btn);
            menu.appendChild(li);
        }
        
        // Agregar menú al contenedor del carrusel
        contenedorCarrusel.appendChild(menu);
        
        // Agregar contenedor del carrusel a la sección
        $seccion.append(contenedorCarrusel);
    }

    // Configurar eventos del carrusel
    configurarEventos() {
        const $seccion = $(this.config.seccion);
        const $carrusel = $seccion.find('section');
        
        // Evento para el botón anterior
        $carrusel.find('button:nth-of-type(1)').on('click', () => {
            this.mostrarImagenAnterior();
        });
        
        // Evento para el botón siguiente
        $carrusel.find('button:nth-of-type(2)').on('click', () => {
            this.mostrarImagenSiguiente();
        });
        
        // Evento para los indicadores
        $carrusel.find('menu li button').on('click', (evento) => {
            const indice = evento.currentTarget._indice;
            this.mostrarImagen(indice);
        });
        
        // Pausar el cambio automático al pasar el mouse sobre el carrusel
        $carrusel.on('mouseenter', () => {
            this.detenerCambioAutomatico();
        });
        
        // Reanudar el cambio automático al quitar el mouse del carrusel
        $carrusel.on('mouseleave', () => {
            this.iniciarCambioAutomatico();
        });
    }

    // Mostrar imagen por índice
    mostrarImagen(indice) {
        // Validar índice
        if (indice < 0) {
            indice = this.totalImagenes - 1;
        } else if (indice >= this.totalImagenes) {
            indice = 0;
        }
        
        // Actualizar índice actual
        this.indiceActual = indice;
        
        // Calcular desplazamiento
        const desplazamiento = -indice * 100;
        
        // Obtener elementos del DOM
        const $seccion = $(this.config.seccion);
        const $carrusel = $seccion.find('section');
        const $contenedor = $carrusel.find('section');
        
        // Aplicar desplazamiento directamente como estilo en línea
        if ($contenedor.length > 0) {
            $contenedor[0].style.transform = `translateX(${desplazamiento}%)`;
        }
    }

    // Mostrar imagen anterior
    mostrarImagenAnterior() {
        this.mostrarImagen(this.indiceActual - 1);
    }

    // Mostrar imagen siguiente
    mostrarImagenSiguiente() {
        this.mostrarImagen(this.indiceActual + 1);
    }

    // Iniciar cambio automático
    iniciarCambioAutomatico() {
        this.detenerCambioAutomatico();
        this.intervaloAutomatico = setInterval(() => {
            this.mostrarImagenSiguiente();
        }, this.config.intervalo);
    }

    // Detener cambio automático
    detenerCambioAutomatico() {
        if (this.intervaloAutomatico) {
            clearInterval(this.intervaloAutomatico);
            this.intervaloAutomatico = null;
        }
    }
}

/**
 * Clase para gestionar la sección de noticias
 */
class SeccionNoticias {
    constructor() {
        this.config = {
            seccion: 'section:nth-of-type(4)', // Cuarta sección = noticias
            numeroNoticias: 4, // Número de noticias a mostrar
            apiUrl: 'https://newsdata.io/api/1/news',
            apiKey: 'pub_711ec5a2790d412e8d14d6fd87384c6d', // Tu API key de newsdata.io
            // Parámetros de la API
            parametros: {
                q: 'Turismo Asturias',
                language: 'es',
                country: 'es',
                size: 10
            }
        };
    }

    // Cargar noticias desde la API
    cargarNoticias() {
        const $seccion = $(this.config.seccion);
        
        // Crear contenedor para noticias si no existe
        if ($seccion.find('section').length === 0) {
            const seccionNoticias = document.createElement('section');
            seccionNoticias.innerHTML = '<p>Cargando noticias...</p>';
            const h3 = document.createElement('h3');
            h3.textContent = 'Últimas noticias';
            seccionNoticias.appendChild(h3);
            $seccion.append(seccionNoticias);
        }
        
        // Datos de ejemplo como respaldo
        const noticiasEjemplo = [
            {
                title: 'Nueva ruta turística en San Martín del Rey Aurelio destaca el patrimonio minero',
                description: 'El ayuntamiento inaugura una nueva ruta turística que recorre los puntos más emblemáticos del patrimonio industrial del concejo.',
                link: '#',
                image_url: 'multimedia/noticia1.jpg',
                pubDate: '2025-06-01T14:30:00Z',
                source_id: 'Turismo Asturias'
            },
            {
                title: 'Festival gastronómico reunirá lo mejor de la cocina asturiana en San Martín',
                description: 'Más de 20 restaurantes presentarán sus mejores platos en el festival gastronómico que se celebrará este fin de semana.',
                link: '#',
                image_url: 'multimedia/noticia2.jpg',
                pubDate: '2025-05-29T10:15:00Z',
                source_id: 'Gastronomía Astur'
            },
            {
                title: 'Éxito de participación en la jornada de puertas abiertas del Museo de la Minería',
                description: 'Más de 500 personas visitaron el Museo de la Minería durante la jornada de puertas abiertas organizada este domingo.',
                link: '#',
                image_url: 'multimedia/noticia3.jpg',
                pubDate: '2025-05-27T18:45:00Z',
                source_id: 'Cultura Minera'
            },
            {
                title: 'Asturias promueve el turismo sostenible en áreas mineras',
                description: 'El gobierno autonómico impulsa iniciativas para fomentar el turismo sostenible en antiguas zonas mineras como San Martín del Rey Aurelio.',
                link: '#',
                image_url: 'multimedia/noticia4.jpg',
                pubDate: '2025-05-25T09:20:00Z',
                source_id: 'Eco Turismo'
            }
        ];
        
        // Realizar petición AJAX a la API de noticias
        $.ajax({
            url: this.config.apiUrl,
            method: 'GET',
            data: {
                ...this.config.parametros,
                apikey: this.config.apiKey
            },
            success: (respuesta) => {
                if (respuesta.status === 'success' && respuesta.results && respuesta.results.length > 0) {
                    // Filtrar y procesar artículos
                    let articulos = respuesta.results;
                    
                    // Filtrar artículos sin imagen o con descripciones vacías
                    articulos = articulos.filter(articulo => 
                        articulo.image_url && 
                        articulo.description && 
                        articulo.description.length > 50
                    );
                    
                    // Intentar encontrar artículos más relevantes para Asturias
                    const articulosAsturias = articulos.filter(articulo => 
                        (articulo.title.toLowerCase().includes('asturias') || 
                         articulo.description.toLowerCase().includes('asturias'))
                    );
                    
                    // Si tenemos suficientes artículos de Asturias, usarlos primero
                    if (articulosAsturias.length >= this.config.numeroNoticias) {
                        this.mostrarNoticias(articulosAsturias.slice(0, this.config.numeroNoticias));
                    } else {
                        // Si no hay suficientes específicos, combinarlos con otros artículos
                        const articulosRestantes = articulos.filter(articulo => 
                            !articulosAsturias.includes(articulo)
                        );
                        
                        const articulosCombinados = [
                            ...articulosAsturias,
                            ...articulosRestantes
                        ].slice(0, this.config.numeroNoticias);
                        
                        this.mostrarNoticias(articulosCombinados);
                    }
                } else {
                    console.log('No se encontraron noticias en la API. Usando datos de ejemplo.');
                    this.mostrarNoticias(noticiasEjemplo);
                }
            },
            error: (xhr, estado, error) => {
                console.log('Error al cargar noticias de la API. Usando datos de ejemplo:', error);
                this.mostrarNoticias(noticiasEjemplo);
            }
        });
    }
    
    // Mostrar noticias en el contenedor
    mostrarNoticias(noticias) {
        const $seccion = $(this.config.seccion);
        const $contenedor = $seccion.find('section');
        $contenedor.empty();

        // Crear título para la sección de noticias
        const h3 = document.createElement('h3');
        h3.textContent = 'Últimas noticias';
        $contenedor.append(h3);

        // Crear tarjeta para cada noticia
        noticias.forEach(noticia => {
            const $tarjeta = this.crearTarjetaNoticia(noticia);
            $contenedor.append($tarjeta);
        });
    }
    
    // Crear tarjeta para una noticia
    crearTarjetaNoticia(noticia) {
        // Formatear fecha
        const fecha = new Date(noticia.pubDate);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        // Recortar descripción si es muy larga
        const descripcion = noticia.description.length > 150 
            ? noticia.description.substring(0, 147) + '...' 
            : noticia.description;
        
        // Crear elementos usando DOM nativo
        const article = document.createElement('article');

        const h4 = document.createElement('h4');
        h4.textContent = noticia.title;
        
        // Figura para la imagen
        const figure = document.createElement('figure');
        
        if (noticia.image_url) {
            const img = document.createElement('img');
            img.src = noticia.image_url;
            img.alt = noticia.title;
            figure.appendChild(img);
        } else {
            // Para figuras sin imagen, usamos un atributo para seleccionar en CSS
            // Pero como no podemos usar clases ni atributos data, creamos un elemento span dentro
            const noImageSpan = document.createElement('span');
            noImageSpan.textContent = 'Sin imagen disponible';
            figure.appendChild(noImageSpan);
            
            // El CSS usará el selector figure:has(> span) para aplicar estilos específicos
        }
        
        // Sección para el contenido
        const section = document.createElement('section');
        
        // Header con fuente y fecha
        const header = document.createElement('header');
        
        const spanFuente = document.createElement('span');
        spanFuente.textContent = noticia.source_id;
        
        const time = document.createElement('time');
        time.textContent = fechaFormateada;
        time.setAttribute('datetime', noticia.pubDate);
        
        header.appendChild(spanFuente);
        header.appendChild(time);
        
        // Título con enlace
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.href = noticia.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = noticia.title;
        h3.appendChild(a);
        
        // Descripción
        const p = document.createElement('p');
        p.textContent = descripcion;
        
        // Enlace para leer más
        const boton = document.createElement('a');
        boton.href = noticia.link;
        boton.target = '_blank';
        boton.rel = 'noopener noreferrer';
        boton.textContent = 'Leer más';
        
        // Ensamblar la tarjeta
        section.appendChild(header);
        section.appendChild(h3);
        section.appendChild(p);
        section.appendChild(boton);
        
        article.appendChild(h4);
        article.appendChild(figure);
        article.appendChild(section);
        
        return article;
    }
    
    // Mostrar mensaje de error
    mostrarError(mensaje) {
        const $seccion = $(this.config.seccion);
        const $contenedor = $seccion.find('section');
        
        $contenedor.empty();
        
        const p = document.createElement('p');
        p.textContent = mensaje;
        
        $contenedor.append(p);
    }
}

// Crear instancia de la aplicación y arrancarla cuando el DOM esté listo
$(document).ready(() => {
    const app = new AplicacionTurismo();
    app.iniciar();
});