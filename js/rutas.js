/**
 * Módulo para la visualización de rutas de San Martín del Rey Aurelio
 * Autor: UO295445
 * Fecha: 2025-06-04 22:10:42
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
        
        // Referencias DOM
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
            // Obtener referencias DOM
            this.listadoRutas = $('main > section > section:nth-of-type(1) > ul');
            this.contenidoRuta = $('main > section > section:nth-of-type(2)');
            this.contenedorMapa = $('main > section > section:nth-of-type(3) > section');
            this.contenedorAltimetria = $('main > section > section:nth-of-type(4) > section');
            
            // Cargar datos de las rutas
            this.cargarDatosRutas();
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
                nombre: $ruta.find('nombre').text(),
                tipo: $ruta.find('tipo').text(),
                medioTransporte: $ruta.find('medioTransporte').text(),
                fechaInicio: $ruta.find('fechaInicio').text(),
                horaInicio: $ruta.find('horaInicio').text(),
                duracion: $ruta.find('duracion').text(),
                agencia: $ruta.find('agencia').text(),
                descripcion: $ruta.find('descripcion').text(),
                personasAdecuadas: $ruta.find('personasAdecuadas').text(),
                lugarInicio: $ruta.find('lugarInicio').text(),
                direccionInicio: $ruta.find('direccionInicio').text(),
                coordenadasInicio: {
                    longitud: parseFloat($ruta.find('coordenadasInicio > longitud').text()),
                    latitud: parseFloat($ruta.find('coordenadasInicio > latitud').text()),
                    altitud: parseFloat($ruta.find('coordenadasInicio > altitud').text())
                },
                referencias: [],
                recomendacion: parseInt($ruta.find('recomendacion').text()),
                hitos: [],
                planimetria: $ruta.find('planimetria').text(),
                altimetria: $ruta.find('altimetria').text()
            };
            
            // Extraer referencias
            $ruta.find('referencias > referencia').each((i, referencia) => {
                nuevaRuta.referencias.push($(referencia).text());
            });
            
            // Extraer hitos
            $ruta.find('hitos > hito').each((i, hito) => {
                const $hito = $(hito);
                
                const nuevoHito = {
                    nombre: $hito.find('nombre').text(),
                    descripcion: $hito.find('descripcion').text(),
                    coordenadas: {
                        longitud: parseFloat($hito.find('coordenadas > longitud').text()),
                        latitud: parseFloat($hito.find('coordenadas > latitud').text()),
                        altitud: parseFloat($hito.find('coordenadas > altitud').text())
                    },
                    distancia: {
                        valor: parseFloat($hito.find('distancia').text()),
                        unidades: $hito.find('distancia').attr('unidades')
                    },
                    fotografias: [],
                    videos: []
                };
                
                // Extraer fotografías
                $hito.find('fotografias > fotografia').each((j, foto) => {
                    nuevoHito.fotografias.push($(foto).text());
                });
                
                // Extraer videos
                $hito.find('videos > video').each((j, video) => {
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
            
            // Cargar el mapa con el KML
            this.cargarMapa();
            
            // Cargar la altimetría SVG
            this.cargarAltimetria();
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
        
        // Tabla de hitos
        const tablaHitos = document.createElement('table');
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        
        // Cabecera de la tabla
        ['Nombre', 'Descripción', 'Distancia', 'Fotos'].forEach(texto => {
            const th = document.createElement('th');
            th.textContent = texto;
            tr.appendChild(th);
        });
        
        thead.appendChild(tr);
        tablaHitos.appendChild(thead);
        
        // Cuerpo de la tabla con los hitos
        const tbody = document.createElement('tbody');
        
        this.rutaActual.hitos.forEach((hito, indice) => {
            const fila = document.createElement('tr');
            
            // Nombre del hito
            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = hito.nombre;
            fila.appendChild(celdaNombre);
            
            // Descripción del hito
            const celdaDescripcion = document.createElement('td');
            celdaDescripcion.textContent = hito.descripcion;
            fila.appendChild(celdaDescripcion);
            
            // Distancia
            const celdaDistancia = document.createElement('td');
            celdaDistancia.textContent = `${hito.distancia.valor} ${hito.distancia.unidades}`;
            fila.appendChild(celdaDistancia);
            
            // Fotos
            const celdaFotos = document.createElement('td');
            if (hito.fotografias.length > 0) {
                const galeriaFotos = document.createElement('figure');
                
                // Primera foto
                const primerFoto = document.createElement('img');
                primerFoto.src = hito.fotografias[0];
                primerFoto.alt = `Imagen de ${hito.nombre}`;
                primerFoto.title = `Imagen de ${hito.nombre}`;
                
                // Si hay más fotos, añadir un contador
                if (hito.fotografias.length > 1) {
                    const figcaption = document.createElement('figcaption');
                    figcaption.textContent = `${hito.fotografias.length} fotos disponibles`;
                    galeriaFotos.appendChild(figcaption);
                }
                
                galeriaFotos.appendChild(primerFoto);
                celdaFotos.appendChild(galeriaFotos);
            } else {
                celdaFotos.textContent = 'No hay fotos disponibles';
            }
            fila.appendChild(celdaFotos);
            
            tbody.appendChild(fila);
        });
        
        tablaHitos.appendChild(tbody);
        seccionHitos.appendChild(tablaHitos);
        
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
        elementoMapa.style.height = '400px';
        elementoMapa.style.width = '100%';
        elementoMapa.style.border = '1px solid #444';
        elementoMapa.style.borderRadius = '4px';
        elementoMapa.style.margin = '1em 0';
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
                url: this.rutaActual.planimetria,
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
            url: this.rutaActual.altimetria,
            type: 'GET',
            dataType: 'text',
            success: (svgData) => {
                // Crear contenedor para el SVG
                const contenedorSVG = document.createElement('section');
                contenedorSVG.style.width = '100%';
                contenedorSVG.style.overflow = 'auto';
                contenedorSVG.style.margin = '1em 0';
                contenedorSVG.style.border = '1px solid #444';
                contenedorSVG.style.borderRadius = '4px';
                contenedorSVG.style.padding = '1em';
                contenedorSVG.style.backgroundColor = '#22303c';
                
                // Añadir el SVG al contenedor
                contenedorSVG.innerHTML = svgData;
                this.contenedorAltimetria.append(contenedorSVG);
                
                // Añadir estilos específicos al SVG
                const svg = $(contenedorSVG).find('svg');
                svg.attr('width', '100%');
                svg.attr('height', 'auto');
                svg.attr('preserveAspectRatio', 'xMidYMid meet');
                svg.attr('viewBox', '0 0 800 400');
                
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