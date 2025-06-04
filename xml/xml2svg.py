#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET
import os
import math

def generar_svg(ruta_element, svg_file, ns):
    """
    Genera un archivo SVG para mostrar la altimetría de una ruta
    """
    # Recopilar los datos de altimetría
    puntos_altimetria = []
    
    # Punto inicial
    inicio = ruta_element.find(f"{{{ns}}}coordenadasInicio")
    altitud_inicio = float(inicio.find(f"{{{ns}}}altitud").text)
    puntos_altimetria.append((0, altitud_inicio))
    
    # Calcular distancias acumuladas
    distancia_acumulada = 0
    
    for hito in ruta_element.findall(f"{{{ns}}}hitos/{{{ns}}}hito"):
        # Obtener la distancia hasta este hito y convertirla a número
        distancia_str = hito.find(f"{{{ns}}}distancia").text
        unidades = hito.find(f"{{{ns}}}distancia").get("unidades")
        distancia = float(distancia_str)
        
        # Convertir a km si es necesario
        if unidades.lower() != 'km':
            if unidades.lower() == 'm':
                distancia /= 1000
        
        # Actualizar distancia acumulada
        distancia_acumulada += distancia
        
        # Obtener altitud
        altitud = float(hito.find(f"{{{ns}}}coordenadas/{{{ns}}}altitud").text)
        
        # Añadir punto para el gráfico
        puntos_altimetria.append((distancia_acumulada, altitud))
    
    # Configurar dimensiones del SVG
    ancho = 800
    alto = 400
    margen_x = 50
    margen_y = 50
    ancho_grafico = ancho - 2 * margen_x
    alto_grafico = alto - 2 * margen_y
    
    # Encontrar los valores mínimos y máximos
    min_altitud = min(punto[1] for punto in puntos_altimetria)
    max_altitud = max(punto[1] for punto in puntos_altimetria)
    max_distancia = puntos_altimetria[-1][0]
    
    # Asegurar un rango mínimo para la altitud si es muy plana
    if max_altitud - min_altitud < 50:
        media_altitud = (max_altitud + min_altitud) / 2
        min_altitud = media_altitud - 25
        max_altitud = media_altitud + 25
    
    # Funciones para convertir coordenadas a pixels en el SVG
    def x_to_pixel(x):
        return margen_x + (x / max_distancia) * ancho_grafico if max_distancia > 0 else margen_x
    
    def y_to_pixel(y):
        # Invertir el eje Y (en SVG, 0 está arriba)
        return alto - margen_y - ((y - min_altitud) / (max_altitud - min_altitud)) * alto_grafico if (max_altitud - min_altitud) > 0 else alto - margen_y
    
    # Generar el contenido del archivo SVG
    svg_content = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
    svg_content += f'<svg width="{ancho}" height="{alto}" xmlns="http://www.w3.org/2000/svg">\n'
    svg_content += f'  <title>Altimetría - {ruta_element.find(f"{{{ns}}}nombre").text}</title>\n'
    
    # Dibujar rejilla de fondo
    svg_content += '  <!-- Rejilla de fondo -->\n'
    svg_content += '  <g stroke="#dddddd" stroke-width="1">\n'
    
    # Líneas horizontales
    num_lineas_h = 5
    for i in range(num_lineas_h + 1):
        y = margen_y + i * (alto_grafico / num_lineas_h)
        svg_content += f'    <line x1="{margen_x}" y1="{y}" x2="{ancho - margen_x}" y2="{y}" />\n'
        
        # Valor de altitud
        valor_altitud = max_altitud - i * (max_altitud - min_altitud) / num_lineas_h
        svg_content += f'    <text x="{margen_x - 5}" y="{y}" text-anchor="end" alignment-baseline="middle" font-size="12">{int(valor_altitud)}m</text>\n'
    
    # Líneas verticales
    num_lineas_v = int(max_distancia) + 1
    for i in range(num_lineas_v + 1):
        if i > max_distancia:
            break
        x = x_to_pixel(i)
        svg_content += f'    <line x1="{x}" y1="{margen_y}" x2="{x}" y2="{alto - margen_y}" />\n'
        svg_content += f'    <text x="{x}" y="{alto - margen_y + 15}" text-anchor="middle" font-size="12">{i}km</text>\n'
    
    svg_content += '  </g>\n'
    
    # Dibujar la línea de altimetría
    svg_content += '  <!-- Línea de altimetría -->\n'
    svg_content += '  <polyline points="'
    for punto in puntos_altimetria:
        x = x_to_pixel(punto[0])
        y = y_to_pixel(punto[1])
        svg_content += f"{x},{y} "
    svg_content += '" fill="none" stroke="#0066cc" stroke-width="3" />\n'
    
    # Dibujar los puntos y etiquetas
    svg_content += '  <!-- Puntos de interés -->\n'
    for i, punto in enumerate(puntos_altimetria):
        x = x_to_pixel(punto[0])
        y = y_to_pixel(punto[1])
        
        # Círculo para el punto
        svg_content += f'  <circle cx="{x}" cy="{y}" r="5" fill="#ff3333" />\n'
        
        # Etiqueta para el punto
        nombre = "Inicio" if i == 0 else f"Hito {i}"
        svg_content += f'  <text x="{x}" y="{y - 10}" text-anchor="middle" font-size="12">{nombre}</text>\n'
    
    # Título del gráfico
    svg_content += f'  <text x="{ancho/2}" y="{margen_y/2}" text-anchor="middle" font-size="18" font-weight="bold">Perfil de Altimetría - {ruta_element.find(f"{{{ns}}}nombre").text}</text>\n'
    
    # Cerrar el SVG
    svg_content += '</svg>'
    
    # Guardar el archivo
    with open(svg_file, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"Archivo SVG '{svg_file}' creado exitosamente.")

def procesar_xml_a_svg(xml_file):
    """
    Procesa el archivo XML completo y genera un archivo SVG por cada ruta
    """
    
    # Parseamos el XML con namespace
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    # Obtenemos el namespace
    ns = root.tag.split('}')[0].strip('{')
    
    # Procesamos cada ruta
    for ruta in root.findall(f"{{{ns}}}ruta"):
        ruta_id = ruta.get("id")
        svg_file = f"{ruta_id}.svg"
        generar_svg(ruta, svg_file, ns)

if __name__ == "__main__":
    # Procesamos el archivo XML
    xml_input = 'rutas.xml'  # Nombre del archivo XML
    procesar_xml_a_svg(xml_input)
    print("Proceso completado. Se han generado todos los archivos SVG.")