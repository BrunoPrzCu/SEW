
/**
 * Clase principal para gestionar las rutas
 */
class GestorRutas {
    /**
     * Constructor
     */
    constructor() {
        // Datos de las rutas
        this.rutas = [];
        
        // Ruta actual seleccionada
        this.rutaActual = null;
        
        // Referencias DOM - Usando estructura anidada sin IDs
        this.inputArchivoXML = null;
        this.listadoRutas = null;
        this.main = null;
        
        // Referencias a secciones dinámicas
        this.contenidoRuta = null;
        this.contenedorMapa = null;
        this.contenedorAltimetria = null;
        
        // Mapa de OpenLayers
        this.mapa = null;
        
        // Capa para el KML
        this.capaKML = null;
        
        // Base URL para recursos relativos
        this.baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        
        // Flag para saber si ya se crearon las secciones dinámicas
        this.seccionesCreadasFlag = false;
    }
    
    /**
     * Inicializa el gestor de rutas
     */
    iniciar() {
        $(document).ready(() => {
            // Obtener referencias DOM principales
            this.inputArchivoXML = $('main > section:nth-of-type(1) input[type="file"]');
            this.listadoRutas = $('main > section:nth-of-type(3) > ul');
            this.main = $('main');
            
            // Escuchar eventos del input de archivo
            this.inputArchivoXML.on('change', (event) => {
                this.cargarArchivoXML(event);
            });
            
            // Mensaje inicial
            this.listadoRutas.html('<li><p>Carga un archivo XML para ver las rutas disponibles</p></li>');
            
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
     * Crea la estructura básica de secciones para mostrar el contenido
     * Solo se llama una vez se ha cargado correctamente un XML
     */
    crearEstructuraContenido() {
        // No crear las secciones si ya existen
        if (this.seccionesCreadasFlag) {
            return;
        }
        
        // Sección 4: Información de la ruta seleccionada
        const seccionInfo = document.createElement('section');
        // Añadir un encabezado temporal que se reemplazará en mostrarInformacionRuta
        const h3Temp = document.createElement('h3');
        h3Temp.textContent = 'Información de la ruta';
        seccionInfo.appendChild(h3Temp);
        this.main.append(seccionInfo);
        this.contenidoRuta = $(seccionInfo);
        
        // Sección 5: Planimetría
        const seccionMapa = document.createElement('section');
        const tituloMapa = document.createElement('h3');
        tituloMapa.textContent = 'Planimetría de la ruta';
        seccionMapa.appendChild(tituloMapa);
        
        const contenedorMapa = document.createElement('section');
        // Añadir encabezado para la subsección
        const h4ContMapa = document.createElement('h4');
        h4ContMapa.textContent = 'Visualización del mapa';
        contenedorMapa.appendChild(h4ContMapa);
        seccionMapa.appendChild(contenedorMapa);

        this.main.append(seccionMapa);
        this.contenedorMapa = $(contenedorMapa);
        
        // Sección 6: Altimetría
        const seccionAltimetria = document.createElement('section');
        const tituloAltimetria = document.createElement('h3');
        tituloAltimetria.textContent = 'Altimetría de la ruta';
        seccionAltimetria.appendChild(tituloAltimetria);
        
        const contenedorAltimetria = document.createElement('section');
        // Añadir encabezado para la subsección
        const h4ContAlt = document.createElement('h4');
        h4ContAlt.textContent = 'Perfil de elevación';
        contenedorAltimetria.appendChild(h4ContAlt);
        seccionAltimetria.appendChild(contenedorAltimetria);
        
        this.main.append(seccionAltimetria);
        this.contenedorAltimetria = $(contenedorAltimetria);
        
        // Marcar como creadas
        this.seccionesCreadasFlag = true;
    }
    
    /**
     * Elimina las secciones dinámicas del DOM
     */
    eliminarSeccionesDinamicas() {
        if (this.seccionesCreadasFlag) {
            // Eliminar las secciones 4, 5 y 6 si existen
            $('main > section:nth-of-type(6)').remove();
            $('main > section:nth-of-type(5)').remove();
            $('main > section:nth-of-type(4)').remove();
            
            // Resetear flags y referencias
            this.seccionesCreadasFlag = false;
            this.contenidoRuta = null;
            this.contenedorMapa = null;
            this.contenedorAltimetria = null;
        }
    }
    
    /**
     * Carga un archivo XML seleccionado por el usuario
     * @param {Event} event - Evento de cambio del input file
     */
    cargarArchivoXML(event) {
        // Resetear estado
        this.rutas = [];
        this.rutaActual = null;
        this.listadoRutas.html('<li><p>Cargando archivo...</p></li>');
        
        // Eliminar secciones dinámicas previas
        this.eliminarSeccionesDinamicas();
        
        // Obtener el archivo seleccionado
        const archivo = event.target.files[0];
        if (!archivo) {
            this.listadoRutas.html('<li><p>No se ha seleccionado ningún archivo.</p></li>');
            return;
        }
        
        // Verificar que es un archivo XML
        if (archivo.type !== 'text/xml' && !archivo.name.endsWith('.xml')) {
            this.listadoRutas.html('<li><p>Error: El archivo debe ser de tipo XML.</p></li>');
            return;
        }
        
        // Crear un lector de archivos
        const lector = new FileReader();
        
        // Configurar el evento de carga
        lector.onload = (e) => {
            try {
                // Parsear el contenido XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');
                
                // Procesar el XML
                this.procesarXML(xmlDoc);
                
            } catch (error) {
                console.error('Error al procesar el archivo XML:', error);
                this.listadoRutas.html('<li><p>Error al procesar el archivo XML. Verifica que tiene el formato correcto.</p></li>');
            }
        };
        
        // Configurar el evento de error
        lector.onerror = () => {
            this.listadoRutas.html('<li><p>Error al leer el archivo.</p></li>');
        };
        
        // Leer el archivo como texto
        lector.readAsText(archivo);
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
        
        // Verificar si se encontraron rutas
        if (this.rutas.length === 0) {
            this.listadoRutas.html('<li><p>No se encontraron rutas en el archivo XML.</p></li>');
            return;
        }
        
        // Crear botones para las rutas
        this.crearBotonesRutas();
        
        // Si hay rutas, mostrar la primera por defecto
        if (this.rutas.length > 0) {
            // Crear las secciones dinámicas antes de seleccionar la ruta
            this.crearEstructuraContenido();
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
            // Mostrar la información de la ruta
            this.mostrarInformacionRuta();
            
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
        // Añadir encabezado para la sección de información básica
        const h4Info = document.createElement('h4');
        h4Info.textContent = 'Información general';
        seccionInfo.appendChild(h4Info);
        
        // Descripción
        const descripcion = document.createElement('p');
        descripcion.textContent = this.rutaActual.descripcion;
        seccionInfo.appendChild(descripcion);
        
        // Datos generales
        const listaDatos = document.createElement('ul');
        
        // Función auxiliar para crear elementos de lista con datos
        const crearElementoLista = (etiqueta, valor) => {
            const elemento = document.createElement('li');
            const p = document.createElement('p');
            p.textContent = etiqueta + ': ';
            elemento.appendChild(p);
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
        const etiquetaCoordenadas = document.createElement('p');
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
            const distanciaLabel = document.createElement('p');
            distanciaLabel.textContent = 'Distancia: ';
            distanciaItem.appendChild(distanciaLabel);
            distanciaItem.appendChild(document.createTextNode(`${hito.distancia.valor} ${hito.distancia.unidades}`));
            infoAdicional.appendChild(distanciaItem);
            
            // Coordenadas
            const coordenadasItem = document.createElement('li');
            const coordenadasLabel = document.createElement('p');
            coordenadasLabel.textContent = 'Coordenadas: ';
            coordenadasItem.appendChild(coordenadasLabel);
            coordenadasItem.appendChild(document.createTextNode(
                `Lat: ${hito.coordenadas.latitud}, Long: ${hito.coordenadas.longitud}, Alt: ${hito.coordenadas.altitud}m`
            ));
            infoAdicional.appendChild(coordenadasItem);
            
            contenedorHito.appendChild(infoAdicional);
            
            // Contenedor para multimedia
            const contenedorMultimedia = document.createElement('section');
            // Añadir encabezado para la sección multimedia
            const hMultimedia = document.createElement('h6');
            hMultimedia.textContent = 'Contenido multimedia';
            contenedorMultimedia.appendChild(hMultimedia);
            
            // Añadir galería de fotos si existen
            if (hito.fotografias.length > 0) {
                const seccionFotos = document.createElement('section');
                const tituloFotos = document.createElement('h6');
                tituloFotos.textContent = 'Galería de fotos';
                seccionFotos.appendChild(tituloFotos);
                
                // Agregar todas las fotos
                hito.fotografias.forEach(urlFoto => {
                    const figura = document.createElement('figure');
                    
                    const imagen = document.createElement('img');
                    imagen.src = urlFoto;
                    imagen.alt = `Imagen de ${hito.nombre}`;
                    imagen.title = `Imagen de ${hito.nombre}`;
                    
                    figura.appendChild(imagen);
                    seccionFotos.appendChild(figura);
                });
                
                contenedorMultimedia.appendChild(seccionFotos);
            }
            
            // Añadir videos si existen
            if (hito.videos.length > 0) {
                const seccionVideos = document.createElement('section');
                const tituloVideos = document.createElement('h6');
                tituloVideos.textContent = 'Videos';
                seccionVideos.appendChild(tituloVideos);
                
                // Agregar todos los videos
                hito.videos.forEach(urlVideo => {
                    const videoElemento = document.createElement('video');
                    videoElemento.src = urlVideo;
                    videoElemento.controls = true;
                    
                    seccionVideos.appendChild(videoElemento);
                });
                
                contenedorMultimedia.appendChild(seccionVideos);
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
        
        // Crear encabezado para la sección del mapa
        const h4Mapa = document.createElement('h4');
        h4Mapa.textContent = 'Visualización del mapa';
        this.contenedorMapa.append(h4Mapa);
        
        // Crear elemento para el mapa
        const elementoMapa = document.createElement('section');
        // Añadir encabezado para el elemento del mapa
        const h5Mapa = document.createElement('h5');
        h5Mapa.textContent = 'Mapa interactivo';
        elementoMapa.appendChild(h5Mapa);
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
        
        // Crear encabezado para la sección de altimetría
        const h4Alt = document.createElement('h4');
        h4Alt.textContent = 'Perfil de elevación';
        this.contenedorAltimetria.append(h4Alt);
        
        // Cargar archivo SVG
        $.ajax({
            url: "xml/" + this.rutaActual.altimetria,
            type: 'GET',
            dataType: 'text',
            success: (svgData) => {
                // Crear contenedor para el SVG
                const contenedorSVG = document.createElement('section');
                // Añadir encabezado para el SVG
                const h5SVG = document.createElement('h5');
                h5SVG.textContent = 'Gráfica de altimetría';
                contenedorSVG.appendChild(h5SVG);
                
                // Añadir el SVG al contenedor
                contenedorSVG.innerHTML += svgData;
                this.contenedorAltimetria.append(contenedorSVG);
            },
            error: (error) => {
                console.error('Error al cargar la altimetría:', error);
                const mensajeError = document.createElement('p');
                mensajeError.textContent = 'No se ha podido cargar el perfil de altimetría';
                this.contenedorAltimetria.append(mensajeError);
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
        if (this.contenidoRuta) {
            // Asegurarse de que hay un encabezado en la sección de error
            const h3Error = document.createElement('h3');
            h3Error.textContent = 'Error';
            
            const mensajeError = document.createElement('p');
            mensajeError.textContent = `${mensaje}`;
            
            this.contenidoRuta.empty().append(h3Error, mensajeError);
        }
    }
}

// Crear una instancia del gestor de rutas y arrancarla
$(document).ready(() => {
    const gestorRutas = new GestorRutas();
    gestorRutas.iniciar();
});