/**
 * Módulo principal para la página de turismo de San Martín del Rey Aurelio
 * Autor: UO295445
 * Fecha: 2025-06-02 18:36:57
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
        
        // Crear contenedor exterior del carrusel (esto nos dará un selector más específico)
        const contenedorCarrusel = document.createElement('section');
        contenedorCarrusel.className = 'carrusel';
        
        // Crear contenedor de imágenes (section interior)
        const contenedorImagenes = document.createElement('section');
        
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
        const $carrusel = $seccion.find('.carrusel');
        
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
        const $carrusel = $seccion.find('.carrusel');
        const $contenedor = $carrusel.find('section');
        const $indicadores = $carrusel.find('menu li button');
        
        // Aplicar desplazamiento directamente como estilo en línea
        if ($contenedor.length > 0) {
            $contenedor[0].style.transform = `translateX(${desplazamiento}%)`;
        }
        
        // Actualizar indicadores
        $indicadores.each((idx, btn) => {
            if (idx === indice) {
                btn.style.backgroundColor = 'white';
            } else {
                btn.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            }
        });
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
            apiUrl: 'https://newsapi.org/v2/everything',
            apiKey: 'afcd9e8511854f7f9f249ee2f2577d18', // Reemplazar con una clave de API válida
            // Parámetros de la API
            parametros: {
                q: 'San Martin Rey Aurelio OR Asturias turismo',
                language: 'es',
                sortBy: 'publishedAt',
                pageSize: 10
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
            $seccion.append(seccionNoticias);
        }
        
    
        
        // Realizar petición AJAX a la API de noticias
        $.ajax({
            url: this.config.apiUrl,
            method: 'GET',
            data: {
                ...this.config.parametros,
                apiKey: this.config.apiKey
            },
            success: (respuesta) => {
                if (respuesta.status === 'ok' && respuesta.articles && respuesta.articles.length > 0) {
                    this.mostrarNoticias(respuesta.articles.slice(0, this.config.numeroNoticias));
                } else {
                    this.mostrarError('No se encontraron noticias.');
                }
            },
            error: (xhr, estado, error) => {
                this.mostrarError('Error al cargar las noticias: ' + error);
            }
        });
        

    }
    
    // Mostrar noticias en el contenedor
    mostrarNoticias(noticias) {
        const $seccion = $(this.config.seccion);
        const $contenedor = $seccion.find('section');
        $contenedor.empty();
        
        // Crear tarjeta para cada noticia
        noticias.forEach(noticia => {
            const $tarjeta = this.crearTarjetaNoticia(noticia);
            $contenedor.append($tarjeta);
        });
    }
    
    // Crear tarjeta para una noticia
    crearTarjetaNoticia(noticia) {
        // Formatear fecha
        const fecha = new Date(noticia.publishedAt);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        // Crear elementos usando DOM nativo
        const article = document.createElement('article');
        
        // Figura para la imagen
        const figure = document.createElement('figure');
        
        if (noticia.urlToImage) {
            const img = document.createElement('img');
            img.src = noticia.urlToImage;
            img.alt = noticia.title;
            figure.appendChild(img);
        } else {
            // Agregar la clase no-image para aplicar estilos CSS apropiados
            figure.className = 'no-image';
            
            const noImageSpan = document.createElement('span');
            noImageSpan.textContent = 'Sin imagen disponible';
            figure.appendChild(noImageSpan);
        }
        
        // Sección para el contenido
        const section = document.createElement('section');
        
        // Header con fuente y fecha
        const header = document.createElement('header');
        
        const spanFuente = document.createElement('span');
        spanFuente.textContent = noticia.source.name;
        
        const time = document.createElement('time');
        time.textContent = fechaFormateada;
        time.setAttribute('datetime', noticia.publishedAt);
        
        header.appendChild(spanFuente);
        header.appendChild(time);
        
        // Título con enlace
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.href = noticia.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = noticia.title;
        h3.appendChild(a);
        
        // Descripción
        const p = document.createElement('p');
        p.textContent = noticia.description;
        
        // Enlace para leer más
        const boton = document.createElement('a');
        boton.href = noticia.url;
        boton.target = '_blank';
        boton.rel = 'noopener noreferrer';
        boton.textContent = 'Leer más';
        
        // Ensamblar la tarjeta
        section.appendChild(header);
        section.appendChild(h3);
        section.appendChild(p);
        section.appendChild(boton);
        
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
        p.style.color = '#ff6b6b';
        p.style.textAlign = 'center';
        p.style.padding = '2em';
        
        $contenedor.append(p);
    }
}

// Crear instancia de la aplicación y arrancarla cuando el DOM esté listo
$(document).ready(() => {
    const app = new AplicacionTurismo();
    app.iniciar();
});