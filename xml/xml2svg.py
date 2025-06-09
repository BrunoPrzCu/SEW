#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET
import os

def generar_altimetria_ruta(ruta, ns, ruta_id, nombre_ruta, svg_file):
    """
    Genera un SVG con la altimetría de una ruta, comenzando desde cota 0 (nivel del mar)
    """
    # Extraer puntos de altitud (inicio + hitos)
    puntos = []
    nombres_puntos = []
    
    # Punto de inicio
    inicio = ruta.find(f"{{{ns}}}coordenadasInicio")
    if inicio is not None:
        altitud_inicio = float(inicio.find(f"{{{ns}}}altitud").text)
        puntos.append((0, altitud_inicio))
        nombres_puntos.append("Inicio")
    
    # Calcular distancias acumuladas
    distancia_acumulada = 0
    
    # Hitos
    hitos = ruta.find(f"{{{ns}}}hitos")
    if hitos is not None:
        for hito in hitos.findall(f"{{{ns}}}hito"):
            # Obtener información del hito
            nombre_hito = hito.find(f"{{{ns}}}nombre").text
            altitud = float(hito.find(f"{{{ns}}}coordenadas/{{{ns}}}altitud").text)
            distancia = float(hito.find(f"{{{ns}}}distancia").text)
            unidades = hito.find(f"{{{ns}}}distancia").get("unidades")
            
            # Convertir a km si es necesario
            if unidades.lower() != 'km':
                if unidades.lower() == 'm':
                    distancia /= 1000
            
            # Actualizar distancia acumulada
            distancia_acumulada += distancia
            
            # Añadir punto
            puntos.append((distancia_acumulada, altitud))
            nombres_puntos.append(nombre_hito)
    
    # Verificar que hay suficientes puntos
    if len(puntos) < 2:
        print(f"Advertencia: La ruta '{nombre_ruta}' tiene menos de 2 puntos")
        return

    # Configuración del SVG
    ancho_svg = 400  # Ancho reducido para adaptarse bien a móviles
    alto_svg = 250   # Alto reducido
    margen = 40      # Margen para textos y etiquetas
    
    # Calcular escalas
    max_distancia = puntos[-1][0]  # La última distancia acumulada
    max_altitud = max(p[1] for p in puntos)
    
    # IMPORTANTE: Forzar min_altitud a 0 para mostrar siempre desde el nivel del mar
    min_altitud = 0
    
    # Asegurar un rango mínimo para la altitud si es muy plana
    if max_altitud - min_altitud < 50:
        max_altitud = min_altitud + 50
    
    # Cálculo de escalas para dibujar
    area_dibujo_ancho = ancho_svg - 2 * margen
    area_dibujo_alto = alto_svg - 2 * margen
    
    # Función para convertir coordenadas a píxeles
    def coord_a_pixel(x, y):
        px = margen + (x / max_distancia) * area_dibujo_ancho
        py = alto_svg - margen - ((y - min_altitud) / (max_altitud - min_altitud)) * area_dibujo_alto
        return px, py
    
    # Convertir puntos a coordenadas SVG
    puntos_svg = [coord_a_pixel(x, y) for x, y in puntos]
    
    # Crear línea de altimetría
    polilinea = " ".join(f"{x},{y}" for x, y in puntos_svg)
    
    # Nivel del mar - siempre visible ahora porque min_altitud es 0
    nivel_mar_y = coord_a_pixel(0, 0)[1]
    
    # Generar SVG - Cabecera
    svg_content = f"""<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{ancho_svg}" height="{alto_svg}" viewBox="0 0 {ancho_svg} {alto_svg}">
  <title>Altimetría - {nombre_ruta}</title>
  
  <!-- Fondo del gráfico -->
  <rect x="{margen}" y="{margen}" width="{area_dibujo_ancho}" height="{area_dibujo_alto}" fill="#f8f9fa" stroke="#ddd" stroke-width="1"/>
  
  <!-- Cuadrícula de fondo -->
  <g stroke="#dddddd" stroke-width="0.5" opacity="0.7">"""
    
    # Líneas horizontales cada 50m de altitud
    intervalo_alt = 50  # Cada 50 metros
    alt_actual = 0  # Comenzar desde 0m (nivel del mar)
    while alt_actual <= max_altitud:
        y = coord_a_pixel(0, alt_actual)[1]
        svg_content += f"""
    <line x1="{margen}" y1="{y}" x2="{ancho_svg - margen}" y2="{y}" />
    <text x="{margen - 5}" y="{y + 4}" text-anchor="end" font-family="Arial" font-size="8" fill="#666">{int(alt_actual)}m</text>"""
        alt_actual += intervalo_alt
    
    # Líneas verticales cada kilómetro
    for km in range(int(max_distancia) + 1):
        x = coord_a_pixel(km, 0)[0]
        svg_content += f"""
    <line x1="{x}" y1="{margen}" x2="{x}" y2="{alto_svg - margen}" />
    <text x="{x}" y="{alto_svg - margen + 15}" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">{km}km</text>"""
    
    svg_content += """
  </g>"""
    
    # Línea del nivel del mar (siempre visible ahora)
    svg_content += f"""
  
  <!-- Línea del nivel del mar -->
  <line x1="{margen}" y1="{nivel_mar_y}" x2="{ancho_svg - margen}" y2="{nivel_mar_y}" stroke="#0066cc" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="{margen + 5}" y="{nivel_mar_y - 5}" font-family="Arial" font-size="8" fill="#0066cc">Nivel del mar (0m)</text>"""
    
    # Línea de altimetría
    svg_content += f"""
  
  <!-- Perfil altimétrico -->
  <polyline points="{polilinea}" fill="none" stroke="#8b3a3a" stroke-width="2" />"""
    
    # Puntos de hitos y etiquetas
    svg_content += """
  
  <!-- Puntos de hitos -->"""
    
    for i, ((x_svg, y_svg), nombre) in enumerate(zip(puntos_svg, nombres_puntos)):
        altitud = puntos[i][1]
        
        # Línea vertical desde el punto hasta el eje X
        svg_content += f"""
  <line x1="{x_svg}" y1="{y_svg}" x2="{x_svg}" y2="{alto_svg - margen}" stroke="#4db6e5" stroke-width="0.5" stroke-dasharray="2,2" />"""
        
        # Círculo para el punto
        svg_content += f"""
  <circle cx="{x_svg}" cy="{y_svg}" r="3" fill="#ff3333" stroke="#fff" stroke-width="1"/>"""
        
        # Texto con nombre del hito (vertical para ahorrar espacio)
        svg_content += f"""
  <text x="{x_svg - 10}" y="{y_svg}" transform="rotate(-90, {x_svg - 10}, {y_svg})" text-anchor="end" font-family="Arial" font-size="7" fill="#4db6e5">{nombre}</text>"""
        
        # Valor de altitud
        svg_content += f"""
  <text x="{x_svg}" y="{y_svg + 12}" text-anchor="middle" font-family="Arial" font-size="7" fill="#4db6e5">{int(altitud)}m</text>"""
    
    # Título
    svg_content += f"""
  
  <!-- Título -->
  <text x="{ancho_svg/2}" y="{margen/2}" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#1a1a1a">Altimetría - {nombre_ruta}</text>
</svg>"""
    
    # Guardar el archivo
    with open(svg_file, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"Generado: {svg_file} - {nombre_ruta}")

def procesar_xml_a_svg(xml_file):
    """
    Procesa el archivo XML completo y genera un SVG por cada ruta
    """
    # Parsear el archivo XML
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    # Obtener namespace
    ns = ""
    if "}" in root.tag:
        ns = root.tag.split('}')[0].strip('{')
    
    # Procesar cada ruta
    for ruta in root.findall(f"{{{ns}}}ruta"):
        ruta_id = ruta.get("id")
        nombre_ruta = ruta.find(f"{{{ns}}}nombre").text
        svg_file = f"{ruta_id}.svg"
        
        generar_altimetria_ruta(ruta, ns, ruta_id, nombre_ruta, svg_file)

if __name__ == "__main__":
    xml_input = 'rutas.xml'  # Nombre del archivo XML
    procesar_xml_a_svg(xml_input)
    print("Proceso completado. Se han generado todos los archivos SVG.")