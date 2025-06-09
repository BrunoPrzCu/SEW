/**
 * Módulo para el juego de preguntas sobre San Martín del Rey Aurelio
 * Autor: UO295445
 * Fecha: 2025-06-04 11:35:23
 */

/**
 * Clase principal que gestiona el juego de preguntas
 */
class JuegoPreguntas {
    /**
     * Constructor de la clase
     */
    constructor() {
        // Banco de preguntas
        this.preguntas = [
            {
                enunciado: "¿Cuál es el nombre del pozo minero emblemático de San Martín del Rey Aurelio?",
                opciones: [
                    "Pozo Barredo",
                    "Pozo Sotón",
                    "Pozo San Vicente",
                    "Pozo Santa Bárbara",
                    "Pozo Candín"
                ],
                respuestaCorrecta: 2
            },
            {
                enunciado: "¿Qué ruta verde atraviesa San Martín del Rey Aurelio?",
                opciones: [
                    "Senda Verde del Turón",
                    "Senda Verde de la Montaña Central",
                    "Senda Verde del Valle",
                    "Senda Verde del Nalón",
                    "Senda Verde de las Cuencas"
                ],
                respuestaCorrecta: 3
            },
            {
                enunciado: "¿En qué cuenca minera se encuentra San Martín del Rey Aurelio?",
                opciones: [
                    "Cuenca del Nalón",
                    "Cuenca del Caudal",
                    "Cuenca del Turón",
                    "Cuenca del Aller",
                    "Cuenca del Sil"
                ],
                respuestaCorrecta: 0
            },
            {
                enunciado: "¿Qué importante museo relacionado con la minería se puede visitar cerca de San Martín del Rey Aurelio?",
                opciones: [
                    "Museo de la Siderurgia",
                    "Museo del Carbón",
                    "Museo de la Minería y de la Industria (MUMI)",
                    "Museo Etnográfico Minero",
                    "Museo de la Historia Industrial"
                ],
                respuestaCorrecta: 2
            },
            {
                enunciado: "¿Cuál de estos platos es típico de la gastronomía asturiana que se puede degustar en San Martín del Rey Aurelio?",
                opciones: [
                    "Cocido madrileño",
                    "Fabada asturiana",
                    "Paella valenciana",
                    "Cochinillo segoviano",
                    "Pulpo a la gallega"
                ],
                respuestaCorrecta: 1
            },
            {
                enunciado: "¿Qué horario tiene la Oficina de Turismo de San Martín del Rey Aurelio los sábados?",
                opciones: [
                    "8:00 - 15:00",
                    "9:00 - 14:00",
                    "10:00 - 14:00",
                    "11:00 - 18:00",
                    "Cerrado los sábados"
                ],
                respuestaCorrecta: 2
            },
            {
                enunciado: "¿Cuántos días de previsión meteorológica muestra la sección de meteorología del sitio web?",
                opciones: [
                    "3 días",
                    "5 días",
                    "7 días",
                    "10 días",
                    "14 días"
                ],
                respuestaCorrecta: 2
            },
            {
                enunciado: "¿Cuál de los siguientes no es un atractivo destacado en la página principal del sitio web?",
                opciones: [
                    "Patrimonio Industrial",
                    "Gastronomía de primera",
                    "Naturaleza en estado puro",
                    "Monumentos históricos",
                    "Alojamientos con encanto"
                ],
                respuestaCorrecta: 3
            },
            {
                enunciado: "¿Qué nombre recibe la plaza que es el centro neurálgico de la vida social del municipio?",
                opciones: [
                    "Plaza Mayor",
                    "Plaza de España",
                    "Plaza del Ayuntamiento",
                    "Plaza de la Minería",
                    "Plaza de la Constitución"
                ],
                respuestaCorrecta: 2
            },
            {
                enunciado: "¿Cuántas imágenes se muestran en el carrusel de la página principal?",
                opciones: [
                    "4 imágenes",
                    "5 imágenes",
                    "6 imágenes",
                    "7 imágenes",
                    "8 imágenes"
                ],
                respuestaCorrecta: 2
            }
        ];
        
        // Estado del juego
        this.preguntaActual = 0;
        this.respuestasUsuario = Array(this.preguntas.length).fill(-1);
        this.juegoTerminado = false;
        
        // Elemento contenedor
        this.contenedorJuego = null;
    }
    
    /**
     * Inicializa el juego
     */
    iniciar() {
        $(document).ready(() => {
            // Seleccionar la sección principal y crear la sección del juego
            const $seccionPrincipal = $('main > section:first-child');
            
            if ($seccionPrincipal.length > 0) {
                // Crear la sección del juego
                const seccionJuego = document.createElement('section');
                $seccionPrincipal.append(seccionJuego);
                
                // Guardar referencia
                this.contenedorJuego = $(seccionJuego);
                
                // Iniciar el juego
                this.mostrarPantallaBienvenida();
            }
        });
    }
    
    /**
     * Muestra la pantalla de bienvenida
     */
    mostrarPantallaBienvenida() {
        this.contenedorJuego.empty();
        
        // Crear sección para la bienvenida
        const seccionBienvenida = document.createElement('section');
    
        
        // Botón para comenzar
        const botonComenzar = document.createElement('button');
        botonComenzar.textContent = 'Comenzar el juego';
        botonComenzar.setAttribute('type', 'button');
        seccionBienvenida.appendChild(botonComenzar);
        
        // Agregar al contenedor
        this.contenedorJuego.append(seccionBienvenida);
        
        // Configurar evento
        $(botonComenzar).on('click', () => {
            this.mostrarPregunta(0);
        });
    }
    
    /**
     * Muestra una pregunta específica
     * @param {number} indice - Índice de la pregunta a mostrar
     */
    mostrarPregunta(indice) {
        if (indice < 0 || indice >= this.preguntas.length) {
            console.error('Índice de pregunta fuera de rango');
            return;
        }
        
        this.preguntaActual = indice;
        const pregunta = this.preguntas[indice];
        
        // Limpiar contenedor
        this.contenedorJuego.empty();
        
        // Crear sección para la pregunta
        const seccionPregunta = document.createElement('section');
        
        // Información de progreso
        const infoPregunta = document.createElement('p');
        infoPregunta.textContent = `Pregunta ${indice + 1} de ${this.preguntas.length}`;
        seccionPregunta.appendChild(infoPregunta);
        
        // Enunciado
        const enunciado = document.createElement('h3');
        enunciado.textContent = pregunta.enunciado;
        seccionPregunta.appendChild(enunciado);
        
        // Opciones de respuesta
        const listaOpciones = document.createElement('ol');
        
        pregunta.opciones.forEach((opcion, idx) => {
            const elementoLista = document.createElement('li');
            
            const labelOpcion = document.createElement('label');
            
            const inputOpcion = document.createElement('input');
            inputOpcion.type = 'radio';
            inputOpcion.name = `pregunta${indice}`;
            inputOpcion.value = idx;
            
            // Si el usuario ya ha respondido esta pregunta, marcar la opción seleccionada
            if (this.respuestasUsuario[indice] === idx) {
                inputOpcion.checked = true;
            }
            
            labelOpcion.appendChild(inputOpcion);
            labelOpcion.appendChild(document.createTextNode(` ${opcion}`));
            
            elementoLista.appendChild(labelOpcion);
            listaOpciones.appendChild(elementoLista);
        });
        
        seccionPregunta.appendChild(listaOpciones);
        
        // Controles de navegación
        const seccionNavegacion = document.createElement('section');
        
        // Botón para pregunta anterior (si no es la primera)
        if (indice > 0) {
            const botonAnterior = document.createElement('button');
            botonAnterior.textContent = 'Anterior';
            botonAnterior.setAttribute('type', 'button');
            seccionNavegacion.appendChild(botonAnterior);
            
            $(botonAnterior).on('click', () => {
                this.guardarRespuestaActual();
                this.mostrarPregunta(indice - 1);
            });
        }
        
        // Botón para siguiente pregunta o finalizar
        const botonSiguiente = document.createElement('button');
        if (indice < this.preguntas.length - 1) {
            botonSiguiente.textContent = 'Siguiente';
        } else {
            botonSiguiente.textContent = 'Finalizar';
        }
        botonSiguiente.setAttribute('type', 'button');
        seccionNavegacion.appendChild(botonSiguiente);
        
        $(botonSiguiente).on('click', () => {
            this.guardarRespuestaActual();
            
            if (indice < this.preguntas.length - 1) {
                this.mostrarPregunta(indice + 1);
            } else {
                this.verificarRespuestasCompletas();
            }
        });
        
        seccionPregunta.appendChild(seccionNavegacion);
        
        // Agregar al contenedor principal
        this.contenedorJuego.append(seccionPregunta);
    }
    
    /**
     * Guarda la respuesta del usuario para la pregunta actual
     */
    guardarRespuestaActual() {
        const respuestaSeleccionada = $(`input[name=pregunta${this.preguntaActual}]:checked`).val();
        
        if (respuestaSeleccionada !== undefined) {
            this.respuestasUsuario[this.preguntaActual] = parseInt(respuestaSeleccionada);
        }
    }
    
    /**
     * Verifica que todas las preguntas hayan sido respondidas
     */
    verificarRespuestasCompletas() {
        // Guardar la última respuesta antes de verificar
        this.guardarRespuestaActual();
        
        // Comprobar si hay preguntas sin responder
        const preguntasSinResponder = this.respuestasUsuario.findIndex(respuesta => respuesta === -1);
        
        if (preguntasSinResponder !== -1) {
            // Hay preguntas sin responder
            this.mostrarAdvertencia(preguntasSinResponder);
        } else {
            // Todas las preguntas están respondidas
            this.calcularResultado();
        }
    }
    
    /**
     * Muestra una advertencia sobre preguntas sin responder
     * @param {number} indicePreguntaSinResponder - Índice de la primera pregunta sin responder
     */
    mostrarAdvertencia(indicePreguntaSinResponder) {
        // Limpiar contenedor
        this.contenedorJuego.empty();
        
        // Crear sección para la advertencia
        const seccionAdvertencia = document.createElement('section');
        
        const titulo = document.createElement('h3');
        titulo.textContent = '¡Atención!';
        seccionAdvertencia.appendChild(titulo);
        
        const mensaje = document.createElement('p');
        mensaje.textContent = 'Debes responder todas las preguntas antes de finalizar el juego.';
        seccionAdvertencia.appendChild(mensaje);
        
        // Botón para ir a la pregunta sin responder
        const botonContinuar = document.createElement('button');
        botonContinuar.textContent = 'Ir a la pregunta sin responder';
        botonContinuar.setAttribute('type', 'button');
        seccionAdvertencia.appendChild(botonContinuar);
        
        // Agregar al contenedor
        this.contenedorJuego.append(seccionAdvertencia);
        
        // Configurar evento
        $(botonContinuar).on('click', () => {
            this.mostrarPregunta(indicePreguntaSinResponder);
        });
    }
    
    /**
     * Calcula y muestra el resultado final
     */
    calcularResultado() {
        // Marcar el juego como terminado
        this.juegoTerminado = true;
        
        // Calcular puntuación
        let respuestasCorrectas = 0;
        
        this.respuestasUsuario.forEach((respuesta, indice) => {
            if (respuesta === this.preguntas[indice].respuestaCorrecta) {
                respuestasCorrectas++;
            }
        });
        
        const puntuacion = respuestasCorrectas;
        
        // Limpiar contenedor
        this.contenedorJuego.empty();
        
        // Crear sección para el resultado
        const seccionResultado = document.createElement('section');
        
        const titulo = document.createElement('h3');
        titulo.textContent = '¡Juego completado!';
        seccionResultado.appendChild(titulo);
        
        // Puntuación
        const puntuacionElement = document.createElement('p');
        puntuacionElement.textContent = `Tu puntuación es: ${puntuacion} de 10 puntos`;
        seccionResultado.appendChild(puntuacionElement);
        
        // Mensaje según puntuación
        const mensajeResultado = document.createElement('p');
        if (puntuacion >= 9) {
            mensajeResultado.textContent = '¡Excelente! Eres un experto en San Martín del Rey Aurelio.';
        } else if (puntuacion >= 7) {
            mensajeResultado.textContent = '¡Muy bien! Conoces bastante sobre San Martín del Rey Aurelio.';
        } else if (puntuacion >= 5) {
            mensajeResultado.textContent = 'No está mal, pero aún puedes aprender más sobre San Martín del Rey Aurelio.';
        } else {
            mensajeResultado.textContent = 'Parece que necesitas explorar más nuestro sitio web para conocer mejor San Martín del Rey Aurelio.';
        }
        seccionResultado.appendChild(mensajeResultado);
        
        // Botones de acción
        const seccionBotones = document.createElement('section');
        
        // Botón para ver respuestas
        const botonVerRespuestas = document.createElement('button');
        botonVerRespuestas.textContent = 'Ver respuestas';
        botonVerRespuestas.setAttribute('type', 'button');
        seccionBotones.appendChild(botonVerRespuestas);
        
        // Botón para volver a jugar
        const botonReiniciar = document.createElement('button');
        botonReiniciar.textContent = 'Volver a jugar';
        botonReiniciar.setAttribute('type', 'button');
        seccionBotones.appendChild(botonReiniciar);
        
        seccionResultado.appendChild(seccionBotones);
        
        // Agregar al contenedor
        this.contenedorJuego.append(seccionResultado);
        
        // Configurar eventos
        $(botonVerRespuestas).on('click', () => {
            this.mostrarRespuestasCorrectas();
        });
        
        $(botonReiniciar).on('click', () => {
            this.reiniciarJuego();
        });
    }
    
    /**
     * Muestra las respuestas correctas
     */
    mostrarRespuestasCorrectas() {
        // Limpiar contenedor
        this.contenedorJuego.empty();
        
        // Crear sección para las respuestas
        const seccionRespuestas = document.createElement('section');
        
        const titulo = document.createElement('h3');
        titulo.textContent = 'Respuestas correctas';
        seccionRespuestas.appendChild(titulo);
        
        // Lista de preguntas y respuestas
        const listaRespuestas = document.createElement('ol');
        
        this.preguntas.forEach((pregunta, indice) => {
            const elementoLista = document.createElement('li');
            
            // Enunciado
            const enunciado = document.createElement('p');
            enunciado.textContent = pregunta.enunciado;
            elementoLista.appendChild(enunciado);
            
            // Respuesta correcta
            const respuestaCorrecta = document.createElement('p');
            respuestaCorrecta.textContent = `Respuesta correcta: ${pregunta.opciones[pregunta.respuestaCorrecta]}`;
            
            
            elementoLista.appendChild(respuestaCorrecta);
            
            // Tu respuesta
            const tuRespuesta = document.createElement('p');
            tuRespuesta.textContent = `Tu respuesta: ${pregunta.opciones[this.respuestasUsuario[indice]]}`;
            
            
            elementoLista.appendChild(tuRespuesta);
            
            listaRespuestas.appendChild(elementoLista);
        });
        
        seccionRespuestas.appendChild(listaRespuestas);
        
        // Botón para volver a la pantalla de resultados
        const botonVolver = document.createElement('button');
        botonVolver.textContent = 'Volver a los resultados';
        botonVolver.setAttribute('type', 'button');
        seccionRespuestas.appendChild(botonVolver);
        
        // Agregar al contenedor
        this.contenedorJuego.append(seccionRespuestas);
        
        // Configurar evento
        $(botonVolver).on('click', () => {
            this.calcularResultado();
        });
    }
    
    /**
     * Reinicia el juego
     */
    reiniciarJuego() {
        this.preguntaActual = 0;
        this.respuestasUsuario = Array(this.preguntas.length).fill(-1);
        this.juegoTerminado = false;
        
        this.mostrarPantallaBienvenida();
    }
}

// Crear instancia del juego y arrancarla cuando el DOM esté listo
$(document).ready(() => {
    const juego = new JuegoPreguntas();
    juego.iniciar();
});