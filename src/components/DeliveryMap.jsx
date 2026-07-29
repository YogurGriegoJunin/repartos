import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Truck } from 'lucide-react';

export default function DeliveryMap({ 
  center = { lat: -34.5932, lng: -60.9472 }, 
  markers = [], 
  zoom = 13 
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    // Verificar si Leaflet (window.L) está disponible
    if (!window.L || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Inicializar mapa de Leaflet con Tiles de OpenStreetMap libres
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([center.lat, center.lng], zoom);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      leafletMapRef.current = map;
      markersGroupRef.current = window.L.layerGroup().addTo(map);
    } else {
      leafletMapRef.current.setView([center.lat, center.lng], zoom);
    }

    // Limpiar marcadores anteriores
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Dibujar marcadores
    markers.forEach(m => {
      if (!m.lat || !m.lng) return;

      let iconHtml = '';
      if (m.type === 'store') {
        iconHtml = `<div style="background:#6366f1;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(99,102,241,0.8);border:2px solid #fff;">🏬</div>`;
      } else if (m.type === 'driver') {
        iconHtml = `<div style="background:#10b981;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(16,185,129,0.8);border:2px solid #fff;">🛵</div>`;
      } else {
        iconHtml = `<div style="background:#ef4444;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px rgba(239,68,68,0.8);border:2px solid #fff;">📍</div>`;
      }

      const customIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = window.L.marker([m.lat, m.lng], { icon: customIcon });
      
      if (m.title || m.popup) {
        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;color:#1e293b">
            <strong>${m.title || 'Ubicación'}</strong><br/>
            ${m.popup || ''}
          </div>
        `);
      }

      marker.addTo(markersGroupRef.current);
    });

  }, [center, markers, zoom]);

  return (
    <div className="map-frame" style={{ width: '100%', height: '100%', minHeight: '340px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '340px' }} />
      {(!window.L) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(30, 41, 59, 0.9)',
          color: '#94a3b8',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <Navigation style={{ width: 40, height: 40, color: '#6366f1', marginBottom: 8, animation: 'pulse 2s infinite' }} />
          <p style={{ fontWeight: 600, color: '#f8fafc' }}>Mapa Interactivo de Repartos</p>
          <span style={{ fontSize: '0.8rem' }}>Ubicación Base: Junín, Buenos Aires (-34.5932, -60.9472)</span>
        </div>
      )}
    </div>
  );
}
