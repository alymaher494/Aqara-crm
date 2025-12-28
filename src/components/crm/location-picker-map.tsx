'use client'

import React, { useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import { GeoSearchControl, EsriProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'

// Fix generic marker icon issues in Leaflet with Next.js/React
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

interface LocationPickerMapProps {
    position: { lat: number; lng: number }
    radius: number
    onPositionChange: (lat: number, lng: number) => void
}

function SearchControl({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
    const map = useMap()

    useEffect(() => {
        // Use EsriProvider with Egypt focus
        const provider = new EsriProvider({
            params: {
                countryCode: 'EG', // Prioritize Egypt
            }
        })

        const searchControl = new (GeoSearchControl as any)({
            provider,
            style: 'bar',
            showMarker: false, // We handle marker ourselves
            keepResult: true,
            autoClose: true,
            searchLabel: 'Search address in Egypt...',
        })

        map.addControl(searchControl)

        map.on('geosearch/showlocation', (result: any) => {
            if (result.location) {
                const lat = parseFloat(result.location.y)
                const lng = parseFloat(result.location.x)
                onPositionChange(lat, lng)
                map.flyTo([lat, lng], 16)
            }
        })

        return () => {
            map.removeControl(searchControl)
        }
    }, [map, onPositionChange])

    return null
}

function LocationMarker({ position, onPositionChange }: { position: { lat: number; lng: number }, onPositionChange: (lat: number, lng: number) => void }) {
    const map = useMap()

    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng)
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    // Fly to position on init if available
    useEffect(() => {
        if (position.lat !== 0 && position.lng !== 0) {
            map.setView([position.lat, position.lng], 15)
        }
    }, [position, map])

    return position.lat !== 0 ? (
        <Marker position={[position.lat, position.lng]}>
            <Popup>Office Location</Popup>
        </Marker>
    ) : null
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ position, radius, onPositionChange }) => {
    // Default to Cairo if position is 0,0
    const center: [number, number] = position.lat !== 0 ? [position.lat, position.lng] : [30.0444, 31.2357]

    return (
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SearchControl onPositionChange={onPositionChange} />
            <LocationMarker position={position} onPositionChange={onPositionChange} />
            {position.lat !== 0 && (
                <Circle
                    center={[position.lat, position.lng]}
                    radius={radius}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                />
            )}
        </MapContainer>
    )
}

export default LocationPickerMap
