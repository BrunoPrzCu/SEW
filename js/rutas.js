/**
 * Módulo para la visualización de rutas de San Martín del Rey Aurelio
 * Autor: UO295445
 * Fecha: 2025-06-05 20:02:01
 */

/**
 * Clase principal para gestionar las rutas
 */
class GestorRutas {
    /**
     * Constructor
     */
    constructor() {
        // Referencia al archivo XML
        this.archivoXML = 'xml/rutas.xml';
        
        // Datos de las rutas
        this.rutas = [];
        
        // Ruta actual seleccionada
        this.rutaActual = null;
        
        // Referencias DOM - Usando estructura anidada sin IDs
        this.listadoRutas = null;
        this.contenidoRuta = null;
        this.contenedorMapa = null;
        this.contenedorAltimetria = null;
        
        // Mapa de OpenLayers
        this.mapa = null;
        
        // Capa para el KML
        this.capaKML = null;
    }
    
    /**
     * Inicializa el gestor de rutas
     */
    iniciar() {
        $(document).ready(() => {
            // Obtener referencias DOM - Las secciones se seleccionan por posición
            this.listadoRutas = $('main > section:nth-of-type(3) > ul');
            this.contenidoRuta = $('main > section:nth-of-type(4)');
            this.contenedorMapa = $('main > section:nth-of-type(5) > section');
            this.contenedorAltimetria = $('main > section:nth-of-type(6) > section');
            
            // Ocultar las secciones de planimetría y altimetría inicialmente
            $('main > section:nth-of-type(5), main > section:nth-of-type(6)').hide();
            
            // Cargar datos de las rutas
            this.cargarDatosRutas();
            
            // Corregir problema de redimensionamiento del mapa
            $(window).on('resize', () => {
                if (this.mapa) {
                    setTimeout(() => {
                        this.mapa.updateSize();
                    }, 200);
                }
            });
        });
    }
    
    /**
     * Carga los datos de las rutas desde el archivo XML
     */
    cargarDatosRutas() {
        $.ajax({
            url: this.archivoXML,
            type: 'GET',
            dataType: 'xml',
            success: (data) => {
                this.procesarXML(data);
            },
            error: (error) => {
                console.error('Error al cargar el archivo XML:', error);
                this.mostrarError('No se ha podido cargar la información de las rutas');
            }
        });
    }
    
    /**
     * Procesa los datos XML de las rutas
     * @param {XMLDocument} data - Documento XML con los datos de las rutas
     */
    procesarXML(data) {
        this.rutas = [];
        
        $(data).find('ruta').each((index, ruta) => {
            const $ruta = $(ruta);
            
            // Extraer información básica de la ruta
            const nuevaRuta = {
                id: $ruta.attr('id'),
                nombre: $ruta.find('> nombre').text(),  // Usar selector hijo directo
                tipo: $ruta.find('> tipo').text(),      // Usar selector hijo directo
                medioTransporte: $ruta.find('> medioTransporte').text(),  // Usar selector hijo directo
                fechaInicio: $ruta.find('> fechaInicio').text(),  // Usar selector hijo directo
                horaInicio: $ruta.find('> horaInicio').text(),    // Usar selector hijo directo
                duracion: $ruta.find('> duracion').text(),        // Usar selector hijo directo
                agencia: $ruta.find('> agencia').text(),          // Usar selector hijo directo
                descripcion: $ruta.find('> descripcion').text(),  // Usar selector hijo directo
                personasAdecuadas: $ruta.find('> personasAdecuadas').text(),  // Usar selector hijo directo
                lugarInicio: $ruta.find('> lugarInicio').text(),  // Usar selector hijo directo
                direccionInicio: $ruta.find('> direccionInicio').text(),  // Usar selector hijo directo
                coordenadasInicio: {
                    longitud: parseFloat($ruta.find('> coordenadasInicio > longitud').text()),
                    latitud: parseFloat($ruta.find('> coordenadasInicio > latitud').text()),
                    altitud: parseFloat($ruta.find('> coordenadasInicio > altitud').text())
                },
                referencias: [],
                recomendacion: parseInt($ruta.find('> recomendacion').text()),  // Usar selector hijo directo
                hitos: [],
                planimetria: $ruta.find('> planimetria').text(),  // Usar selector hijo directo
                altimetria: $ruta.find('> altimetria').text()     // Usar selector hijo directo
            };
            
            // Extraer referencias
            $ruta.find('> referencias > referencia').each((i, referencia) => {  // Usar selector hijo directo
                nuevaRuta.referencias.push($(referencia).text());
            });
            
            // Extraer hitos
            $ruta.find('> hitos > hito').each((i, hito) => {  // Usar selector hijo directo
                const $hito = $(hito);
                
                const nuevoHito = {
                    nombre: $hito.find('> nombre').text(),  // Usar selector hijo directo
                    descripcion: $hito.find('> descripcion').text(),  // Usar selector hijo directo
                    coordenadas: {
                        longitud: parseFloat($hito.find('> coordenadas > longitud').text()),
                        latitud: parseFloat($hito.find('> coordenadas > latitud').text()),
                        altitud: parseFloat($hito.find('> coordenadas > altitud').text())
                    },
                    distancia: {
                        valor: parseFloat($hito.find('> distancia').text()),
                        unidades: $hito.find('> distancia').attr('unidades')
                    },
                    fotografias: [],
                    videos: []
                };
                
                // Extraer fotografías
                $hito.find('> fotografias > fotografia').each((j, foto) => {  // Usar selector hijo directo
                    nuevoHito.fotografias.push($(foto).text());
                });
                
                // Extraer videos
                $hito.find('> videos > video').each((j, video) => {  // Usar selector hijo directo
                    nuevoHito.videos.push($(video).text());
                });
                
                nuevaRuta.hitos.push(nuevoHito);
            });
            
            this.rutas.push(nuevaRuta);
        });
        
        // Crear botones para las rutas
        this.crearBotonesRutas();
        
        // Si hay rutas, mostrar la primera por defecto
        if (this.rutas.length > 0) {
            this.seleccionarRuta(this.rutas[0].id);
        }
    }
    
    /**
     * Crea los botones para seleccionar una ruta
     */
    crearBotonesRutas() {
        // Limpiar lista previa
        this.listadoRutas.empty();
        
        // Crear un botón para cada ruta
        this.rutas.forEach(ruta => {
            const elementoLista = document.createElement('li');
            const botonRuta = document.createElement('button');
            botonRuta.textContent = ruta.nombre;
            botonRuta.setAttribute('type', 'button');
            
            // Usar jQuery para manejar el evento
            $(botonRuta).on('click', () => {
                this.seleccionarRuta(ruta.id);
            });
            
            elementoLista.appendChild(botonRuta);
            this.listadoRutas.append(elementoLista);
        });
    }
    
    /**
     * Selecciona una ruta para mostrarla
     * @param {string} rutaId - Identificador de la ruta a mostrar
     */
    seleccionarRuta(rutaId) {
        // Buscar la ruta
        this.rutaActual = this.rutas.find(ruta => ruta.id === rutaId);
        
        if (this.rutaActual) {
            // Actualizar botones activos
            this.listadoRutas.find('button').each((index, boton) => {
                if ($(boton).text() === this.rutaActual.nombre) {
                    boton.style.fontWeight = 'bold';
                    boton.style.backgroundColor = '#2c5364';
                    boton.style.color = 'white';
                } else {
                    boton.style.fontWeight = 'normal';
                    boton.style.backgroundColor = '';
                    boton.style.color = '';
                }
            });
            
            // Mostrar la información de la ruta
            this.mostrarInformacionRuta();
            
            // Hacer visibles las secciones de planimetría y altimetría
            $('main > section:nth-of-type(5), main > section:nth-of-type(6)').show();
            
            // Cargar el mapa con el KML
            this.cargarMapa();
            
            // Cargar la altimetría SVG
            this.cargarAltimetria();
            
            // Solución para forzar la actualización del tamaño del mapa
            setTimeout(() => {
                if (this.mapa) {
                    this.mapa.updateSize();
                }
            }, 100);
        }
    }
    
    /**
     * Muestra la información detallada de la ruta seleccionada
     */
    mostrarInformacionRuta() {
        // Limpiar contenido anterior
        this.contenidoRuta.empty();
        
        // Crear el título
        const titulo = document.createElement('h3');
        titulo.textContent = this.rutaActual.nombre;
        this.contenidoRuta.append(titulo);
        
        // Crear sección de información básica
        const seccionInfo = document.createElement('section');
        
        // Descripción
        const descripcion = document.createElement('p');
        descripcion.textContent = this.rutaActual.descripcion;
        seccionInfo.appendChild(descripcion);
        
        // Datos generales
        const listaDatos = document.createElement('ul');
        
        // Función auxiliar para crear elementos de lista con datos
        const crearElementoLista = (etiqueta, valor) => {
            const elemento = document.createElement('li');
            const strong = document.createElement('strong');
            strong.textContent = etiqueta + ': ';
            elemento.appendChild(strong);
            elemento.appendChild(document.createTextNode(valor));
            return elemento;
        };
        
        // Añadir datos específicos
        listaDatos.appendChild(crearElementoLista('Tipo', this.rutaActual.tipo));
        listaDatos.appendChild(crearElementoLista('Medio de transporte', this.rutaActual.medioTransporte));
        listaDatos.appendChild(crearElementoLista('Fecha de inicio', this.formatearFecha(this.rutaActual.fechaInicio)));
        listaDatos.appendChild(crearElementoLista('Hora de inicio', this.formatearHora(this.rutaActual.horaInicio)));
        listaDatos.appendChild(crearElementoLista('Duración aproximada', this.rutaActual.duracion));
        listaDatos.appendChild(crearElementoLista('Agencia organizadora', this.rutaActual.agencia));
        listaDatos.appendChild(crearElementoLista('Adecuada para', this.rutaActual.personasAdecuadas));
        listaDatos.appendChild(crearElementoLista('Lugar de inicio', this.rutaActual.lugarInicio));
        listaDatos.appendChild(crearElementoLista('Dirección', this.rutaActual.direccionInicio));
        
        // Añadir coordenadas
        const coordenadas = document.createElement('li');
        const etiquetaCoordenadas = document.createElement('strong');
        etiquetaCoordenadas.textContent = 'Coordenadas de inicio: ';
        coordenadas.appendChild(etiquetaCoordenadas);
        coordenadas.appendChild(document.createTextNode(
            `Latitud: ${this.rutaActual.coordenadasInicio.latitud}, ` + 
            `Longitud: ${this.rutaActual.coordenadasInicio.longitud}, ` + 
            `Altitud: ${this.rutaActual.coordenadasInicio.altitud} m`
        ));
        listaDatos.appendChild(coordenadas);
        
        // Añadir valoración
        listaDatos.appendChild(crearElementoLista('Valoración', `${this.rutaActual.recomendacion}/10`));
        
        seccionInfo.appendChild(listaDatos);
        
        // Sección de referencias
        if (this.rutaActual.referencias.length > 0) {
            const tituloRefs = document.createElement('h4');
            tituloRefs.textContent = 'Enlaces de interés';
            seccionInfo.appendChild(tituloRefs);
            
            const listaRefs = document.createElement('ul');
            this.rutaActual.referencias.forEach(ref => {
                const itemRef = document.createElement('li');
                const enlace = document.createElement('a');
                enlace.href = ref;
                enlace.textContent = ref;
                enlace.target = '_blank';
                itemRef.appendChild(enlace);
                listaRefs.appendChild(itemRef);
            });
            seccionInfo.appendChild(listaRefs);
        }
        
        this.contenidoRuta.append(seccionInfo);
        
        // Sección de hitos
        const seccionHitos = document.createElement('section');
        
        const tituloHitos = document.createElement('h4');
        tituloHitos.textContent = 'Puntos de interés en la ruta';
        seccionHitos.appendChild(tituloHitos);
        
        // Lista de hitos
        const listaHitos = document.createElement('ul');
        
        this.rutaActual.hitos.forEach((hito, indice) => {
            const elementoHito = document.createElement('li');
            
            // Contenedor principal del hito
            const contenedorHito = document.createElement('article');
            
            // Título del hito
            const tituloHito = document.createElement('h5');
            tituloHito.textContent = hito.nombre;
            contenedorHito.appendChild(tituloHito);
            
            // Descripción del hito
            const descripcionHito = document.createElement('p');
            descripcionHito.textContent = hito.descripcion;
            contenedorHito.appendChild(descripcionHito);
            
            // Información adicional del hito
            const infoAdicional = document.createElement('ul');
            
            // Distancia
            const distanciaItem = document.createElement('li');
            const distanciaLabel = document.createElement('strong');
            distanciaLabel.textContent = 'Distancia: ';
            distanciaItem.appendChild(distanciaLabel);
            distanciaItem.appendChild(document.createTextNode(`${hito.distancia.valor} ${hito.distancia.unidades}`));
            infoAdicional.appendChild(distanciaItem);
            
            // Coordenadas
            const coordenadasItem = document.createElement('li');
            const coordenadasLabel = document.createElement('strong');
            coordenadasLabel.textContent = 'Coordenadas: ';
            coordenadasItem.appendChild(coordenadasLabel);
            coordenadasItem.appendChild(document.createTextNode(
                `Lat: ${hito.coordenadas.latitud}, Long: ${hito.coordenadas.longitud}, Alt: ${hito.coordenadas.altitud}m`
            ));
            infoAdicional.appendChild(coordenadasItem);
            
            contenedorHito.appendChild(infoAdicional);
            
            // Contenedor para multimedia
            const contenedorMultimedia = document.createElement('section');
            contenedorMultimedia.style.width = "100%";
            contenedorMultimedia.style.display = "flex";
            contenedorMultimedia.style.flexDirection = "column";
            contenedorMultimedia.style.alignItems = "center";
            
            // Añadir galería de fotos si existen
            if (hito.fotografias.length > 0) {
                const tituloFotos = document.createElement('h6');
                tituloFotos.textContent = 'Fotografías';
                tituloFotos.style.alignSelf = "flex-start";
                tituloFotos.style.width = "100%";
                tituloFotos.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
                tituloFotos.style.paddingBottom = "0.3em";
                tituloFotos.style.marginBottom = "0.5em";
                contenedorMultimedia.appendChild(tituloFotos);
                
                const galeriaFotos = document.createElement('section');
                galeriaFotos.style.display = "grid";
                galeriaFotos.style.gridTemplateColumns = "repeat(auto-fill, minmax(10em, 1fr))";
                galeriaFotos.style.gap = "0.5em";
                galeriaFotos.style.width = "100%";
                galeriaFotos.style.marginBottom = "1em";
                
                // Agregar todas las fotos
                hito.fotografias.forEach(urlFoto => {
                    const figura = document.createElement('figure');
                    figura.style.margin = "0";
                    figura.style.textAlign = "center";
                    
                    const imagen = document.createElement('img');
                    imagen.src = urlFoto;
                    imagen.alt = `Imagen de ${hito.nombre}`;
                    imagen.title = `Imagen de ${hito.nombre}`;
                    imagen.style.width = "100%";
                    imagen.style.height = "8em";
                    imagen.style.objectFit = "cover";
                    imagen.style.borderRadius = "0.25em";
                    imagen.style.transition = "transform 0.3s";
                    
                    figura.appendChild(imagen);
                    galeriaFotos.appendChild(figura);
                });
                
                contenedorMultimedia.appendChild(galeriaFotos);
            }
            
            // Añadir videos si existen
            if (hito.videos.length > 0) {
                const tituloVideos = document.createElement('h6');
                tituloVideos.textContent = 'Videos';
                tituloVideos.style.alignSelf = "flex-start";
                tituloVideos.style.width = "100%";
                tituloVideos.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
                tituloVideos.style.paddingBottom = "0.3em";
                tituloVideos.style.marginBottom = "0.5em";
                contenedorMultimedia.appendChild(tituloVideos);
                
                const galeriaVideos = document.createElement('section');
                galeriaVideos.style.display = "grid";
                // Usamos un valor más pequeño para minmax para evitar que se corte
                galeriaVideos.style.gridTemplateColumns = "repeat(auto-fit, minmax(16em, 1fr))";
                galeriaVideos.style.gap = "1em";
                galeriaVideos.style.width = "100%";
                
                // Agregar todos los videos
                hito.videos.forEach(urlVideo => {
                    const videoElemento = document.createElement('video');
                    videoElemento.src = urlVideo;
                    videoElemento.controls = true;
                    videoElemento.style.width = "100%";
                    videoElemento.style.maxWidth = "100%";
                    videoElemento.style.borderRadius = "0.25em";
                    
                    galeriaVideos.appendChild(videoElemento);
                });
                
                contenedorMultimedia.appendChild(galeriaVideos);
            }
            
            contenedorHito.appendChild(contenedorMultimedia);
            
            elementoHito.appendChild(contenedorHito);
            listaHitos.appendChild(elementoHito);
        });
        
        seccionHitos.appendChild(listaHitos);
        
        this.contenidoRuta.append(seccionHitos);
    }
    
    /**
     * Carga y configura el mapa con el KML de la ruta
     */
    cargarMapa() {
        // Limpiar contenedor
        this.contenedorMapa.empty();
        
        // Crear elemento para el mapa
        const elementoMapa = document.createElement('section');
        this.contenedorMapa.append(elementoMapa);
        
        // Crear mapa
        this.mapa = new ol.Map({
            target: elementoMapa,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([this.rutaActual.coordenadasInicio.longitud, this.rutaActual.coordenadasInicio.latitud]),
                zoom: 14
            })
        });
        
        // Cargar KML
        this.capaKML = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: "xml/" + this.rutaActual.planimetria,
                format: new ol.format.KML({
                    extractStyles: true,
                    extractAttributes: true
                })
            })
        });
        
        this.mapa.addLayer(this.capaKML);
        
        // Ajustar a la extensión del KML cuando se cargue
        this.capaKML.getSource().on('change', (e) => {
            const source = e.target;
            if (source.getState() === 'ready') {
                const extent = source.getExtent();
                this.mapa.getView().fit(extent, {
                    padding: [50, 50, 50, 50],
                    maxZoom: 15
                });
            }
        });
    }
    
    /**
     * Carga y muestra la altimetría de la ruta
     */
    cargarAltimetria() {
        // Limpiar contenedor
        this.contenedorAltimetria.empty();
        
        // Cargar archivo SVG
        $.ajax({
            url: "xml/" + this.rutaActual.altimetria,
            type: 'GET',
            dataType: 'text',
            success: (svgData) => {
                // Crear contenedor para el SVG
                const contenedorSVG = document.createElement('section');
                
                // Configurar estilo del contenedor SVG para evitar que se corte
                contenedorSVG.style.width = "100%";
                contenedorSVG.style.overflow = "auto";
                contenedorSVG.style.maxHeight = "50em"; // Altura máxima relativa
                
                // Añadir el SVG al contenedor
                contenedorSVG.innerHTML = svgData;
                this.contenedorAltimetria.append(contenedorSVG);
                
                // Añadir estilos específicos al SVG
                const svg = $(contenedorSVG).find('svg');
                svg.attr('width', '100%');
                svg.attr('height', 'auto');
                svg.attr('viewBox', '0 0 800 400');
                
                // Ajustes específicos para dispositivos móviles
                if (window.innerWidth < 768) { // 48em = 768px
                    svg.attr('width', '150%'); // Más ancho para poder hacer scroll horizontal
                    contenedorSVG.style.overflowX = "auto";
                }
                
                // Añadir línea de cota cero
                const svgElement = svg[0];
                if (svgElement) {
                    // Crear elementos para la línea de cota cero
                    const lineaCero = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    lineaCero.setAttribute('x1', '0');
                    lineaCero.setAttribute('y1', '300');
                    lineaCero.setAttribute('x2', '800');
                    lineaCero.setAttribute('y2', '300');
                    lineaCero.setAttribute('stroke', '#FF4500');
                    lineaCero.setAttribute('stroke-width', '1');
                    lineaCero.setAttribute('stroke-dasharray', '5,5');
                    
                    const textoCota = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    textoCota.setAttribute('x', '10');
                    textoCota.setAttribute('y', '298');
                    textoCota.setAttribute('font-family', 'Arial');
                    textoCota.setAttribute('font-size', '12');
                    textoCota.setAttribute('fill', '#FF4500');
                    textoCota.textContent = 'Nivel del mar (0m)';
                    
                    svgElement.appendChild(lineaCero);
                    svgElement.appendChild(textoCota);
                    
                    // Añadir etiquetas para los hitos principales
                    this.rutaActual.hitos.forEach((hito, index) => {
                        // Posicionar cada hito a lo largo del perfil de altimetría
                        const posX = 100 + (600 * index / (this.rutaActual.hitos.length - 1));
                        const posY = 280 - (hito.coordenadas.altitud * 0.5);
                        
                        // Crear círculo para marcar el hito
                        const circulo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        circulo.setAttribute('cx', posX);
                        circulo.setAttribute('cy', posY);
                        circulo.setAttribute('r', '4');
                        circulo.setAttribute('fill', '#4db6e5');
                        
                        // Crear línea vertical desde el hito hasta la base
                        const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        linea.setAttribute('x1', posX);
                        linea.setAttribute('y1', posY);
                        linea.setAttribute('x2', posX);
                        linea.setAttribute('y2', '300');
                        linea.setAttribute('stroke', '#4db6e5');
                        linea.setAttribute('stroke-width', '1');
                        linea.setAttribute('stroke-dasharray', '2,2');
                        
                        // Crear texto con el nombre del hito
                        const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        texto.setAttribute('x', posX);
                        texto.setAttribute('y', posY - 10);
                        texto.setAttribute('font-family', 'Arial');
                        texto.setAttribute('font-size', '10');
                        texto.setAttribute('fill', 'white');
                        texto.setAttribute('text-anchor', 'middle');
                        texto.textContent = hito.nombre;
                        
                        // Crear texto con la altitud
                        const textoAltitud = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        textoAltitud.setAttribute('x', posX);
                        textoAltitud.setAttribute('y', posY + 15);
                        textoAltitud.setAttribute('font-family', 'Arial');
                        textoAltitud.setAttribute('font-size', '8');
                        textoAltitud.setAttribute('fill', '#4db6e5');
                        textoAltitud.setAttribute('text-anchor', 'middle');
                        textoAltitud.textContent = `${hito.coordenadas.altitud}m`;
                        
                        svgElement.appendChild(linea);
                        svgElement.appendChild(circulo);
                        svgElement.appendChild(texto);
                        svgElement.appendChild(textoAltitud);
                    });
                }
            },
            error: (error) => {
                console.error('Error al cargar la altimetría:', error);
                this.contenedorAltimetria.html('<p>No se ha podido cargar el perfil de altimetría</p>');
            }
        });
    }
    
    /**
     * Formatea una fecha ISO a un formato más legible
     * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
     * @returns {string} Fecha formateada
     */
    formatearFecha(fechaISO) {
        try {
            const fecha = new Date(fechaISO);
            const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return fecha.toLocaleDateString('es-ES', opciones);
        } catch (error) {
            return fechaISO;
        }
    }
    
    /**
     * Formatea una hora ISO a un formato más legible
     * @param {string} horaISO - Hora en formato ISO (HH:MM:SS)
     * @returns {string} Hora formateada
     */
    formatearHora(horaISO) {
        try {
            const partes = horaISO.split(':');
            return `${partes[0]}:${partes[1]}`;
        } catch (error) {
            return horaISO;
        }
    }
    
    /**
     * Muestra un mensaje de error
     * @param {string} mensaje - Mensaje de error a mostrar
     */
    mostrarError(mensaje) {
        this.contenidoRuta.html(`<p>Error: ${mensaje}</p>`);
    }
}

// Crear una instancia del gestor de rutas y arrancarla
$(document).ready(() => {
    const gestorRutas = new GestorRutas();
    gestorRutas.iniciar();
});