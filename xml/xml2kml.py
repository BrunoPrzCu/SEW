#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET
import os

class Kml(object):
    """
    Genera archivo KML con puntos y líneas
    """
    def __init__(self):
        """
        Crea el elemento raíz y el espacio de nombres
        """
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz, 'Document')

    def addPlacemark(self, nombre, descripcion, long, lat, alt, modoAltitud):
        """
        Añade un elemento <Placemark> con puntos <Point>
        """
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = '\n' + nombre + '\n'
        ET.SubElement(pm, 'description').text = '\n' + descripcion + '\n'
        punto = ET.SubElement(pm, 'Point')
        ET.SubElement(punto, 'coordinates').text = '\n{},{},{}\n'.format(long, lat, alt)
        ET.SubElement(punto, 'altitudeMode').text = '\n' + modoAltitud + '\n'

    def addLineString(self, nombre, extrude, tesela, listaCoordenadas, modoAltitud, color, ancho):
        """
        Añade un elemento <Placemark> con líneas <LineString>
        """
        ET.SubElement(self.doc, 'name').text = '\n' + nombre + '\n'
        pm = ET.SubElement(self.doc, 'Placemark')
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls, 'extrude').text = '\n' + extrude + '\n'
        ET.SubElement(ls, 'tessellate').text = '\n' + tesela + '\n'
        ET.SubElement(ls, 'coordinates').text = '\n' + listaCoordenadas + '\n'
        ET.SubElement(ls, 'altitudeMode').text = '\n' + modoAltitud + '\n'
        estilo = ET.SubElement(pm, 'Style')
        linea = ET.SubElement(estilo, 'LineStyle')
        ET.SubElement(linea, 'color').text = '\n' + color + '\n'
        ET.SubElement(linea, 'width').text = '\n' + ancho + '\n'

    def addStyle(self, id, icon_href):
        """
        Añade un estilo para los puntos
        """
        style = ET.SubElement(self.doc, 'Style', id=id)
        icon_style = ET.SubElement(style, 'IconStyle')
        icon = ET.SubElement(icon_style, 'Icon')
        ET.SubElement(icon, 'href').text = '\n' + icon_href + '\n'

    def escribir(self, nombreArchivoKML):
        """
        Escribe el archivo KML con declaración y codificación
        """
        arbol = ET.ElementTree(self.raiz)
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)

    def ver(self):
        """
        Muestra el archivo KML. Se utiliza para depurar
        """
        print("\nElemento raiz =", self.raiz.tag)
        if self.raiz.text != None:
            print("Contenido =", self.raiz.text.strip('\n'))  # strip() elimina los '\n' del string
        else:
            print("Contenido =", self.raiz.text)
        print("Atributos =", self.raiz.attrib)
        # Recorrido de los elementos del árbol
        for hijo in self.raiz.findall('.//'):  # Expresión XPath
            print("\nElemento =", hijo.tag)
            if hijo.text != None:
                print("Contenido =", hijo.text.strip('\n'))  # strip() elimina los '\n' del string
            else:
                print("Contenido =", hijo.text)
            print("Atributos =", hijo.attrib)

def procesar_ruta_xml_a_kml(ruta_element, kml_file, ns):
    """
    Procesa un elemento ruta del XML y genera un archivo KML correspondiente
    """
    # Creamos una instancia de Kml
    nuevoKML = Kml()
    
    # Obtenemos datos básicos de la ruta
    nombre_ruta = ruta_element.find(f"{{{ns}}}nombre").text
    descripcion = ruta_element.find(f"{{{ns}}}descripcion").text
    
    # Añadimos un estilo para los puntos
    nuevoKML.addStyle("puntoEstilo", "http://maps.google.com/mapfiles/kml/paddle/red-circle.png")
    
    # Obtenemos las coordenadas del punto inicial
    coord_inicio = ruta_element.find(f"{{{ns}}}coordenadasInicio")
    longitud_inicio = coord_inicio.find(f"{{{ns}}}longitud").text
    latitud_inicio = coord_inicio.find(f"{{{ns}}}latitud").text
    altitud_inicio = coord_inicio.find(f"{{{ns}}}altitud").text
    
    # Añadimos el punto inicial como un Placemark
    lugar_inicio = ruta_element.find(f"{{{ns}}}lugarInicio").text
    nuevoKML.addPlacemark(f"Inicio: {lugar_inicio}", 
                         f"Punto de inicio de la ruta {nombre_ruta}", 
                         longitud_inicio, latitud_inicio, altitud_inicio, 
                         "relativeToGround")
    
    # Lista para almacenar todas las coordenadas para la línea
    coordenadas = [f"{longitud_inicio},{latitud_inicio},{altitud_inicio}"]
    
    # Procesamos los hitos
    hitos = ruta_element.find(f"{{{ns}}}hitos")
    for hito in hitos.findall(f"{{{ns}}}hito"):
        nombre_hito = hito.find(f"{{{ns}}}nombre").text
        descripcion_hito = hito.find(f"{{{ns}}}descripcion").text
        
        # Coordenadas del hito
        coords = hito.find(f"{{{ns}}}coordenadas")
        longitud = coords.find(f"{{{ns}}}longitud").text
        latitud = coords.find(f"{{{ns}}}latitud").text
        altitud = coords.find(f"{{{ns}}}altitud").text
        
        # Añadimos el hito como un Placemark
        nuevoKML.addPlacemark(nombre_hito, 
                             descripcion_hito, 
                             longitud, latitud, altitud, 
                             "relativeToGround")
        
        # Añadimos las coordenadas a la lista
        coordenadas.append(f"{longitud},{latitud},{altitud}")
    
    # Convertimos la lista de coordenadas a un string para el LineString
    lista_coordenadas = "\n".join(coordenadas)
    
    # Añadimos la línea que conecta todos los puntos
    nuevoKML.addLineString(f"Trazado de la ruta: {nombre_ruta}", 
                          "1", "1", lista_coordenadas, 
                          "relativeToGround", "ff0000ff", "5")
    
    # Escribimos el archivo KML
    nuevoKML.escribir(kml_file)
    print(f"Archivo KML '{kml_file}' creado exitosamente.")

def procesar_xml_a_kml(xml_file):
    """
    Procesa el archivo XML completo y genera un archivo KML por cada ruta
    """
    # Aseguramos que exista el directorio kml
    if not os.path.exists('kml'):
        os.makedirs('kml')
    
    # Parseamos el XML con namespace
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    # Obtenemos el namespace
    ns = root.tag.split('}')[0].strip('{')
    
    # Procesamos cada ruta
    for ruta in root.findall(f"{{{ns}}}ruta"):
        ruta_id = ruta.get("id")
        kml_file = f"kml/{ruta_id}.kml"
        procesar_ruta_xml_a_kml(ruta, kml_file, ns)

if __name__ == "__main__":
    # Procesamos el archivo XML
    xml_input = 'rutas.xml'  # Nombre del archivo XML
    procesar_xml_a_kml(xml_input)
    print("Proceso completado. Se han generado todos los archivos KML.")