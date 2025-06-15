

// Clase principal para gestionar la aplicación meteorológica
class AplicacionMeteo {
    constructor() {
        // Coordenadas capital de San Martín del Rey Aurelio)
        this.coordenadas = {
            lat: 43.1630,
            lon: -5.3650
        };
        
        // Configuración
        this.config = {
            unidades: 'metric', // Unidades métricas (Celsius, km/h)
            idioma: 'es' // Idioma español
        };
        
        // Inicializar componentes
        this.tiempoActual = new TiempoActual(this.coordenadas, this.config);
        this.prevision = new PrevisionSemanal(this.coordenadas, this.config);
    }
    
    // Iniciar la aplicación
    iniciar() {
        $(document).ready(() => {
            this.tiempoActual.cargarDatos();
            this.prevision.cargarDatos();
        });
    }
}

/**
 * Clase para gestionar la información del tiempo actual
 */
class TiempoActual {
    constructor(coordenadas, config) {
        this.coordenadas = coordenadas;
        this.config = config;
        this.contenedor = 'section:nth-of-type(1) > section'; 
        
        // Open-Meteo API URL para tiempo actual
        this.urlAPI = 'https://api.open-meteo.com/v1/forecast';
    }
    
    // Cargar datos del tiempo actual
    cargarDatos() {
        const $contenedor = $(this.contenedor);
        
        // Parámetros de la solicitud para Open-Meteo
        const parametros = {
            latitude: this.coordenadas.lat,
            longitude: this.coordenadas.lon,
            current_weather: 'true',
            hourly: 'temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,windspeed_10m,winddirection_10m,apparent_temperature',
            timezone: 'Europe/Madrid',
            forecast_days: 1 // Solo necesitamos el día actual
        };
        
        // Realizar solicitud AJAX
        $.ajax({
            url: this.urlAPI,
            method: 'GET',
            data: parametros,
            success: (respuesta) => {
                this.mostrarDatos(respuesta);
            },
            error: (xhr, estado, error) => {
                this.mostrarError('No se ha podido cargar la información meteorológica actual.');
                console.error('Error al cargar datos meteorológicos:', error);
            }
        });
    }
    
    // Mostrar los datos meteorológicos actuales
    mostrarDatos(datos) {
        const $contenedor = $(this.contenedor);
        $contenedor.empty();
        
        // Obtener la hora actual
        const ahora = new Date();
        const horaActual = ahora.getHours();
        
        // Encontrar el índice de hora más cercano en los datos horarios
        const indiceHoraActual = this.obtenerIndiceHoraMasCercana(datos.hourly.time, ahora);
        
        // Crear elementos para mostrar la información
        const h3 = document.createElement('h3');
        h3.textContent = `Tiempo actual`;
        
        // Crear estructura para mostrar la información principal
        const seccionPrincipal = document.createElement('section');
        const h4 = document.createElement('h4');
        h4.textContent = `Información actualizada a las ${horaActual}:00`;
        
        // Información principal
        const temperaturaActual = Math.round(datos.current_weather.temperature);
        const sensacionTermica = Math.round(datos.hourly.apparent_temperature[indiceHoraActual]);
        const humedad = datos.hourly.relativehumidity_2m[indiceHoraActual];
        const probabilidadLluvia = datos.hourly.precipitation_probability[indiceHoraActual];
        
        // Condición meteorológica
        const codigoClima = datos.current_weather.weathercode;
        const condicion = this.obtenerDescripcionClima(codigoClima);
        const iconoURL = this.obtenerIconoClima(codigoClima, ahora);
        
        // Viento
        const velocidadViento = Math.round(datos.current_weather.windspeed); // ya en km/h
        const direccionViento = this.obtenerDireccionViento(datos.current_weather.winddirection);
        
        // Salida y puesta del sol (estimado, Open-Meteo no proporciona estos datos directamente)
        const horaSalida = '7:30'; // Horario aproximado
        const horaPuesta = '21:30'; // Horario aproximado
        
        // Crear elementos para la información principal
        const seccionIcono = document.createElement('section');
        
        // Figura para el icono
        const figura = document.createElement('figure');
        const h5 = document.createElement('h5');
        h5.textContent = 'Condición actual';
        const img = document.createElement('img');
        img.src = iconoURL;
        img.alt = condicion;
        
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = this.capitalizarPrimeraLetra(condicion);
        
        figura.appendChild(h5);
        figura.appendChild(img);
        figura.appendChild(figcaption);
        seccionIcono.appendChild(figura);
        
        // Sección para temperatura y datos principales
        const seccionTemperatura = document.createElement('section');
        const h5Temp = document.createElement('h5');
        h5Temp.textContent = 'Temperatura actual';
        const pTemp = document.createElement('p');
        pTemp.innerHTML = `${temperaturaActual}°C`;

        
        const pSensacion = document.createElement('p');
        pSensacion.textContent = `Sensación térmica: ${sensacionTermica}°C`;
        
        const pHumedad = document.createElement('p');
        pHumedad.textContent = `Humedad: ${humedad}%`;
        
        const pPrecipitacion = document.createElement('p');
        pPrecipitacion.textContent = `Probabilidad de lluvia: ${probabilidadLluvia}%`;
        
        seccionTemperatura.appendChild(h5Temp);
        seccionTemperatura.appendChild(pTemp);
        seccionTemperatura.appendChild(pSensacion);
        seccionTemperatura.appendChild(pHumedad);
        seccionTemperatura.appendChild(pPrecipitacion);
        
        // Sección para viento y sol
        const seccionVientoSol = document.createElement('section');
        const h5Viento = document.createElement('h5');
        h5Viento.textContent = 'Viento y sol';
        const pViento = document.createElement('p');
        pViento.textContent = `Viento: ${velocidadViento} km/h (${direccionViento})`;
        
        const pSol = document.createElement('p');
        pSol.textContent = `Salida del sol: ${horaSalida}`;
        
        const pPuesta = document.createElement('p');
        pPuesta.textContent = `Puesta del sol: ${horaPuesta}`;
        
        const pActualizacion = document.createElement('p');
        const fechaActualizacion = new Date();
        pActualizacion.textContent = `Actualizado: ${fechaActualizacion.toLocaleTimeString('es-ES')}`;

        seccionVientoSol.appendChild(h5Viento);
        seccionVientoSol.appendChild(pViento);
        seccionVientoSol.appendChild(pSol);
        seccionVientoSol.appendChild(pPuesta);
        seccionVientoSol.appendChild(pActualizacion);
        
        // Añadir secciones al contenedor principal
        seccionPrincipal.appendChild(h4);
        seccionPrincipal.appendChild(seccionIcono);
        seccionPrincipal.appendChild(seccionTemperatura);
        seccionPrincipal.appendChild(seccionVientoSol);
        
        
        // Añadir todo al contenedor
        $contenedor.append(h3);
        $contenedor.append(seccionPrincipal);
    }
    
    // Obtener índice de la hora más cercana en los datos horarios
    obtenerIndiceHoraMasCercana(tiempos, ahora) {
        const timestampAhora = ahora.getTime();
        let mejorIndice = 0;
        let menorDiferencia = Infinity;
        
        for (let i = 0; i < tiempos.length; i++) {
            const tiempo = new Date(tiempos[i]);
            const diferencia = Math.abs(tiempo.getTime() - timestampAhora);
            
            if (diferencia < menorDiferencia) {
                menorDiferencia = diferencia;
                mejorIndice = i;
            }
        }
        
        return mejorIndice;
    }
    
    // Obtener descripción del clima basada en el código WMO
    obtenerDescripcionClima(codigo) {
        const descripciones = {
            0: 'Cielo despejado',
            1: 'Mayormente despejado',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Niebla',
            48: 'Niebla con escarcha',
            51: 'Llovizna ligera',
            53: 'Llovizna moderada',
            55: 'Llovizna intensa',
            56: 'Llovizna helada ligera',
            57: 'Llovizna helada intensa',
            61: 'Lluvia ligera',
            63: 'Lluvia moderada',
            65: 'Lluvia intensa',
            66: 'Lluvia helada ligera',
            67: 'Lluvia helada intensa',
            71: 'Nevada ligera',
            73: 'Nevada moderada',
            75: 'Nevada intensa',
            77: 'Granos de nieve',
            80: 'Lluvias ocasionales ligeras',
            81: 'Lluvias ocasionales moderadas',
            82: 'Lluvias ocasionales intensas',
            85: 'Nevadas ocasionales ligeras',
            86: 'Nevadas ocasionales intensas',
            95: 'Tormenta',
            96: 'Tormenta con granizo ligero',
            99: 'Tormenta con granizo intenso'
        };
        
        return descripciones[codigo] || 'Información no disponible';
    }
    
    // Obtener URL de icono según el código de clima
    obtenerIconoClima(codigo, fecha) {
        // Determinar si es día o noche
        const hora = fecha.getHours();
        const esDia = hora >= 7 && hora < 21; // Simplificación para día/noche
        
        // Mapeo de códigos WMO a iconos
        const iconoBase = 'multimedia/';
        
        let iconoCodigo;
        
        // Asignar código de icono según el código WMO
        if (codigo === 0) {
            iconoCodigo = esDia ? 'c01d' : 'c01n'; // Despejado
        } else if (codigo === 1) {
            iconoCodigo = esDia ? 'c02d' : 'c02n'; // Mayormente despejado
        } else if (codigo === 2) {
            iconoCodigo = esDia ? 'c02d' : 'c02n'; // Parcialmente nublado
        } else if (codigo === 3) {
            iconoCodigo = esDia ? 'c03d' : 'c03n'; // Nublado
        } else if (codigo >= 45 && codigo <= 48) {
            iconoCodigo = esDia ? 'a05d' : 'a05n'; // Niebla
        } else if ([51, 53, 55, 56, 57].includes(codigo)) {
            iconoCodigo = esDia ? 'd01d' : 'd01n'; // Llovizna
        } else if ([61, 63, 65, 66, 67].includes(codigo)) {
            iconoCodigo = esDia ? 'r01d' : 'r01n'; // Lluvia
        } else if ([71, 73, 75, 77].includes(codigo)) {
            iconoCodigo = esDia ? 's01d' : 's01n'; // Nieve
        } else if ([80, 81, 82].includes(codigo)) {
            iconoCodigo = esDia ? 'r02d' : 'r02n'; // Lluvia ocasional
        } else if ([85, 86].includes(codigo)) {
            iconoCodigo = esDia ? 's02d' : 's02n'; // Nieve ocasional
        } else if (codigo >= 95) {
            iconoCodigo = esDia ? 't04d' : 't04n'; // Tormenta
        } else {
            iconoCodigo = esDia ? 'c04d' : 'c04n'; // Predeterminado (nublado)
        }
        
        return `${iconoBase}${iconoCodigo}.png`;
    }
    
    // Mostrar mensaje de error
    mostrarError(mensaje) {
        const $contenedor = $(this.contenedor);
        $contenedor.empty();
        
        const h3 = document.createElement('h3');
        h3.textContent = 'Error al cargar datos';
        
        const p = document.createElement('p');
        p.textContent = mensaje;
        
        $contenedor.append(h3);
        $contenedor.append(p);
    }
    
    // Obtener la dirección del viento a partir de los grados
    obtenerDireccionViento(grados) {
        const direcciones = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
        const indice = Math.round(grados / 22.5) % 16;
        return direcciones[indice];
    }
    
    // Capitalizar primera letra de una cadena
    capitalizarPrimeraLetra(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
}

/**
 * Clase para gestionar la previsión meteorológica semanal
 */
class PrevisionSemanal {
    constructor(coordenadas, config) {
        this.coordenadas = coordenadas;
        this.config = config;
        this.contenedor = 'section:nth-of-type(3) > section'; // Selector del contenedor para la previsión
        
        // Open-Meteo API URL para previsión
        this.urlAPI = 'https://api.open-meteo.com/v1/forecast';
    }
    
    // Cargar datos de la previsión semanal
    cargarDatos() {
        const $contenedor = $(this.contenedor);
        
        // Parámetros de la solicitud para Open-Meteo
        const parametros = {
            latitude: this.coordenadas.lat,
            longitude: this.coordenadas.lon,
            daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max',
            timezone: 'Europe/Madrid',
            forecast_days: 7 // Previsión para 7 días
        };
        
        // Realizar solicitud AJAX
        $.ajax({
            url: this.urlAPI,
            method: 'GET',
            data: parametros,
            success: (respuesta) => {
                this.mostrarDatos(respuesta);
            },
            error: (xhr, estado, error) => {
                this.mostrarError('No se ha podido cargar la previsión meteorológica.');
                console.error('Error al cargar previsión meteorológica:', error);
            }
        });
    }
    
    // Mostrar los datos de la previsión
    mostrarDatos(datos) {
        const $contenedor = $(this.contenedor);
        $contenedor.empty();
        
        // Crear elementos para mostrar la información
        const h3 = document.createElement('h3');
        h3.textContent = 'Previsión para los próximos días';
        
        // Crear lista para los días
        const listaPrevisiones = document.createElement('ul');
        
        // Recorrer las fechas y crear tarjetas para cada día
        for (let i = 0; i < datos.daily.time.length; i++) {
            const elementoLista = this.crearTarjetaDia(
                datos.daily.time[i],
                datos.daily.weathercode[i],
                datos.daily.temperature_2m_max[i],
                datos.daily.temperature_2m_min[i],
                datos.daily.precipitation_probability_max[i],
                datos.daily.windspeed_10m_max[i]
            );
            listaPrevisiones.appendChild(elementoLista);
        }
        
        // Añadir todo al contenedor
        $contenedor.append(h3);
        $contenedor.append(listaPrevisiones);
    }
    
    // Crear tarjeta para un día
    crearTarjetaDia(fecha, codigoClima, tempMax, tempMin, probLluvia, velocidadViento) {
        // Elemento de lista para contener la tarjeta
        const li = document.createElement('li');
        
        // Fecha formateada
        const fechaObj = new Date(fecha);
        const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'short' });
        const diaNumero = fechaObj.getDate();
        const mes = fechaObj.toLocaleDateString('es-ES', { month: 'short' });
        
        // Elemento para el día
        const pDia = document.createElement('p');
        pDia.textContent = `${diaSemana}, ${diaNumero} ${mes}`;
        
        // Figura para el icono
        const figura = document.createElement('figure');
        
        const condicion = this.obtenerDescripcionClima(codigoClima);
        const iconoURL = this.obtenerIconoClima(codigoClima);
        
        const img = document.createElement('img');
        img.src = iconoURL;
        img.alt = condicion;
        
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = this.capitalizarPrimeraLetra(condicion);
        
        figura.appendChild(img);
        figura.appendChild(figcaption);
        
        // Temperaturas min/max
        const pTemps = document.createElement('p');
        pTemps.innerHTML = `Temperatura máxima ${Math.round(tempMax)}° / Temperatura mínima ${Math.round(tempMin)}°`;
        
        // Probabilidad de precipitación
        const pLluvia = document.createElement('p');
        pLluvia.textContent = `Lluvia: ${probLluvia}%`;
        
        // Velocidad del viento
        const pViento = document.createElement('p');
        pViento.textContent = `Viento: ${Math.round(velocidadViento)} km/h`;
        
        // Añadir elementos a la tarjeta
        li.appendChild(pDia);
        li.appendChild(figura);
        li.appendChild(pTemps);
        li.appendChild(pLluvia);
        li.appendChild(pViento);
        
        return li;
    }
    
    // Obtener descripción del clima basada en el código WMO
    obtenerDescripcionClima(codigo) {
        const descripciones = {
            0: 'Cielo despejado',
            1: 'Mayormente despejado',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Niebla',
            48: 'Niebla con escarcha',
            51: 'Llovizna ligera',
            53: 'Llovizna moderada',
            55: 'Llovizna intensa',
            56: 'Llovizna helada ligera',
            57: 'Llovizna helada intensa',
            61: 'Lluvia ligera',
            63: 'Lluvia moderada',
            65: 'Lluvia intensa',
            66: 'Lluvia helada ligera',
            67: 'Lluvia helada intensa',
            71: 'Nevada ligera',
            73: 'Nevada moderada',
            75: 'Nevada intensa',
            77: 'Granos de nieve',
            80: 'Lluvias ocasionales ligeras',
            81: 'Lluvias ocasionales moderadas',
            82: 'Lluvias ocasionales intensas',
            85: 'Nevadas ocasionales ligeras',
            86: 'Nevadas ocasionales intensas',
            95: 'Tormenta',
            96: 'Tormenta con granizo ligero',
            99: 'Tormenta con granizo intenso'
        };
        
        return descripciones[codigo] || 'Información no disponible';
    }
    
    // Obtener URL de icono según el código de clima
    obtenerIconoClima(codigo) {
        // Mapeo de códigos WMO a iconos
        const iconoBase = 'multimedia/';
        
        let iconoCodigo;
        
        // Asignar código de icono según el código WMO (día)
        if (codigo === 0) {
            iconoCodigo = 'c01d'; // Despejado
        } else if (codigo === 1) {
            iconoCodigo = 'c02d'; // Mayormente despejado
        } else if (codigo === 2) {
            iconoCodigo = 'c02d'; // Parcialmente nublado
        } else if (codigo === 3) {
            iconoCodigo = 'c03d'; // Nublado
        } else if (codigo >= 45 && codigo <= 48) {
            iconoCodigo = 'a05d'; // Niebla
        } else if ([51, 53, 55, 56, 57].includes(codigo)) {
            iconoCodigo = 'd01d'; // Llovizna
        } else if ([61, 63, 65, 66, 67].includes(codigo)) {
            iconoCodigo = 'r01d'; // Lluvia
        } else if ([71, 73, 75, 77].includes(codigo)) {
            iconoCodigo = 's01d'; // Nieve
        } else if ([80, 81, 82].includes(codigo)) {
            iconoCodigo = 'r02d'; // Lluvia ocasional
        } else if ([85, 86].includes(codigo)) {
            iconoCodigo = 's02d'; // Nieve ocasional
        } else if (codigo >= 95) {
            iconoCodigo = 't04d'; // Tormenta
        } else {
            iconoCodigo = 'c04d'; // Predeterminado (nublado)
        }
        
        return `${iconoBase}${iconoCodigo}.png`;
    }
    
    // Mostrar mensaje de error
    mostrarError(mensaje) {
        const $contenedor = $(this.contenedor);
        $contenedor.empty();
        
        const h3 = document.createElement('h3');
        h3.textContent = 'Error al cargar datos';
        
        const p = document.createElement('p');
        p.textContent = mensaje;
        
        $contenedor.append(h3);
        $contenedor.append(p);
    }
    
    // Capitalizar primera letra de una cadena
    capitalizarPrimeraLetra(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
}


$(document).ready(() => {
    const app = new AplicacionMeteo();
    app.iniciar();
});