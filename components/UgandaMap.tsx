'use client'

import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DistrictMPCount {
  [district: string]: number
}

interface UgandaMapProps {
  onDistrictClick: (district: string) => void
  districtMPCounts?: DistrictMPCount
  selectedDistrict?: string | null
}

// District to Region mapping
const DISTRICT_REGIONS: { [key: string]: string } = {
  // Central Region
  'Buikwe': 'Central', 'Bukomansimbi': 'Central', 'Butambala': 'Central', 'Buvuma': 'Central',
  'Gomba': 'Central', 'Kalangala': 'Central', 'Kalungu': 'Central', 'Kampala': 'Central',
  'Kayunga': 'Central', 'Kiboga': 'Central', 'Kyankwanzi': 'Central', 'Luweero': 'Central',
  'Lwengo': 'Central', 'Lyantonde': 'Central', 'Masaka': 'Central', 'Mityana': 'Central',
  'Mpigi': 'Central', 'Mubende': 'Central', 'Mukono': 'Central', 'Nakaseke': 'Central',
  'Nakasongola': 'Central', 'Rakai': 'Central', 'Sembabule': 'Central', 'Wakiso': 'Central',
  'Kassanda': 'Central', 'Kyotera': 'Central', 'Luwero': 'Central',
  
  // Eastern Region
  'Amuria': 'Eastern', 'Budaka': 'Eastern', 'Bududa': 'Eastern', 'Bugiri': 'Eastern',
  'Bukedea': 'Eastern', 'Bukwo': 'Eastern', 'Bulambuli': 'Eastern', 'Busia': 'Eastern',
  'Butaleja': 'Eastern', 'Buyende': 'Eastern', 'Iganga': 'Eastern', 'Jinja': 'Eastern',
  'Kaberamaido': 'Eastern', 'Kaliro': 'Eastern', 'Kamuli': 'Eastern', 'Kapchorwa': 'Eastern',
  'Katakwi': 'Eastern', 'Kibuku': 'Eastern', 'Kumi': 'Eastern', 'Kween': 'Eastern',
  'Luuka': 'Eastern', 'Manafwa': 'Eastern', 'Mayuge': 'Eastern', 'Mbale': 'Eastern',
  'Namayingo': 'Eastern', 'Namutumba': 'Eastern', 'Ngora': 'Eastern', 'Pallisa': 'Eastern',
  'Serere': 'Eastern', 'Sironko': 'Eastern', 'Soroti': 'Eastern', 'Tororo': 'Eastern',
  'Namisindwa': 'Eastern', 'Butebo': 'Eastern', 'Kapelebyong': 'Eastern',
  
  // Northern Region0
  'Agago': 'Northern', 'Alebtong': 'Northern', 'Amolatar': 'Northern', 'Amuru': 'Northern',
  'Apac': 'Northern', 'Dokolo': 'Northern', 'Gulu': 'Northern', 'Kitgum': 'Northern',
  'Kole': 'Northern', 'Kwania': 'Northern', 'Lamwo': 'Northern', 'Lira': 'Northern',
  'Nwoya': 'Northern', 'Omoro': 'Northern', 'Otuke': 'Northern', 'Oyam': 'Northern',
  'Pader': 'Northern',
  
  // West Nile Region
  'Adjumani': 'West Nile', 'Arua': 'West Nile', 'Koboko': 'West Nile', 'Maracha': 'West Nile',
  'Moyo': 'West Nile', 'Nebbi': 'West Nile', 'Pakwach': 'West Nile', 'Yumbe': 'West Nile',
  'Zombo': 'West Nile', 'Madi-Okollo': 'West Nile', 'Obongi': 'West Nile', 'Terego': 'West Nile',
  
  // Karamoja Region
  'Abim': 'Karamoja', 'Amudat': 'Karamoja', 'Kaabong': 'Karamoja', 'Karenga': 'Karamoja',
  'Kotido': 'Karamoja', 'Moroto': 'Karamoja', 'Nabilatuk': 'Karamoja', 'Nakapiripirit': 'Karamoja',
  'Napak': 'Karamoja',
  
  // Western Region
  'Buhweju': 'Western', 'Buliisa': 'Western', 'Bundibugyo': 'Western', 'Bushenyi': 'Western',
  'Hoima': 'Western', 'Ibanda': 'Western', 'Isingiro': 'Western', 'Kabale': 'Western',
  'Kabarole': 'Western', 'Kagadi': 'Western', 'Kakumiro': 'Western', 'Kamwenge': 'Western',
  'Kanungu': 'Western', 'Kasese': 'Western', 'Kibaale': 'Western', 'Kikuube': 'Western',
  'Kiruhura': 'Western', 'Kiryandongo': 'Western', 'Kisoro': 'Western', 'Kitagwenda': 'Western',
  'Kyegegwa': 'Western', 'Kyenjojo': 'Western', 'Masindi': 'Western', 'Mbarara': 'Western',
  'Mitooma': 'Western', 'Ntoroko': 'Western', 'Ntungamo': 'Western', 'Rubanda': 'Western',
  'Rubirizi': 'Western', 'Rukiga': 'Western', 'Rukungiri': 'Western', 'Sheema': 'Western',
  'Bunyangabu': 'Western', 'Rwampara': 'Western', 'Kazo': 'Western',
}

// Region colors - Muted palette that harmonizes with antique white theme
const REGION_COLORS: { [key: string]: string } = {
  'Central': '#6B8E5A',      // Muted sage green
  'Eastern': '#5B8FA8',       // Muted blue-gray
  'Northern': '#C99A6B',      // Muted terracotta
  'Western': '#8B6F9E',       // Muted lavender
  'West Nile': '#B87A7A',     // Muted rose
  'Karamoja': '#8B7D6B',      // Muted taupe
}

const getDistrictRegion = (districtName: string): string => {
  // Try exact match first
  if (DISTRICT_REGIONS[districtName]) return DISTRICT_REGIONS[districtName]
  
  // Try title case
  const titleCase = districtName.charAt(0).toUpperCase() + districtName.slice(1).toLowerCase()
  if (DISTRICT_REGIONS[titleCase]) return DISTRICT_REGIONS[titleCase]
  
  // Try finding partial match
  const lowerName = districtName.toLowerCase()
  for (const [district, region] of Object.entries(DISTRICT_REGIONS)) {
    if (district.toLowerCase() === lowerName) return region
  }
  
  return 'Unknown'
}

const getDistrictColor = (region: string, mpCount: number): string => {
  const baseColor = REGION_COLORS[region] || '#607D8B'
  if (mpCount > 0) {
    return baseColor
  }
  return baseColor + '99' // Slightly transparent for districts with no MPs
}

// Map view types
type MapView = 'light' | 'satellite' | 'street' | 'terrain'

// Tile layer configurations
const TILE_LAYERS: Record<MapView, { url: string; attribution: string; name: string }> = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'Light',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'Satellite',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'Street',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    name: 'Terrain',
  },
}

export default function UgandaMap({ onDistrictClick, districtMPCounts = {}, selectedDistrict }: UgandaMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [geoData, setGeoData] = useState<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapView, setMapView] = useState<MapView>('light')
  
  // Store callback in ref to avoid recreating GeoJSON layer
  const onDistrictClickRef = useRef(onDistrictClick)
  onDistrictClickRef.current = onDistrictClick

  // Load GeoJSON data
  useEffect(() => {
    fetch('/ug.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load GeoJSON')
        return res.json()
      })
      .then(data => {
        console.log('GeoJSON loaded:', data.features?.length, 'districts')
        setGeoData(data)
      })
      .catch(err => console.error('Error loading Uganda districts:', err))
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    console.log('Initializing map...')
    
    // Create map - no zoom, no drag
    const map = L.map(mapContainerRef.current, {
      center: [1.3733, 32.2903],
      zoom: 7,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
      attributionControl: true,
    })

    // Add default tile layer (Light/CartoDB Positron)
    const defaultLayer = TILE_LAYERS['light']
    const tileLayer = L.tileLayer(defaultLayer.url, {
      attribution: defaultLayer.attribution,
      maxZoom: 19,
    }).addTo(map)

    tileLayerRef.current = tileLayer
    mapRef.current = map
    setIsMapReady(true)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setIsMapReady(false)
      }
    }
  }, [])

  // Update tile layer when map view changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current || !isMapReady) return

    const newLayerConfig = TILE_LAYERS[mapView]
    const newTileLayer = L.tileLayer(newLayerConfig.url, {
      attribution: newLayerConfig.attribution,
      maxZoom: 19,
    })

    mapRef.current.removeLayer(tileLayerRef.current)
    newTileLayer.addTo(mapRef.current)
    tileLayerRef.current = newTileLayer
  }, [mapView, isMapReady])

  // Add GeoJSON layer when data is loaded
  useEffect(() => {
    if (!mapRef.current || !geoData || !isMapReady) return
    
    // Remove existing layer
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current)
      geoJsonLayerRef.current = null
    }

    console.log('Creating GeoJSON layer...')

    // Create GeoJSON layer
    const geoJsonLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const districtName = feature?.properties?.name || ''
        const region = getDistrictRegion(districtName)
        const mpCount = getMPCount(districtName, districtMPCounts)

        return {
          fillColor: getDistrictColor(region, mpCount),
          weight: 1,
          opacity: 1,
          color: '#444',
          fillOpacity: 0.7,
        }
      },
      onEachFeature: (feature, layer) => {
        const districtName = feature.properties?.name || 'Unknown'
        const region = getDistrictRegion(districtName)
        const mpCount = getMPCount(districtName, districtMPCounts)

        // Bind tooltip
        layer.bindTooltip(
          `<strong>${districtName}</strong><br/>Region: ${region}<br/>MPs: ${mpCount}`,
          { sticky: false, className: 'district-tooltip' }
        )

        // Click handler
        layer.on('click', (e) => {
          console.log('District clicked:', districtName)
          L.DomEvent.stopPropagation(e)
          if (e.originalEvent) {
            L.DomEvent.preventDefault(e.originalEvent)
          }
          // Close any open tooltips
          layer.closeTooltip()
          // Close any open popups
          if (mapRef.current) {
            mapRef.current.closePopup()
          }
          onDistrictClickRef.current(districtName)
        })

        // Hover handlers
        layer.on('mouseover', (e) => {
          const target = e.target as L.Path
          target.setStyle({
            weight: 3,
            color: '#000',
            fillOpacity: 0.9,
          })
          target.bringToFront()
        })

        layer.on('mouseout', (e) => {
          const target = e.target as L.Path
          geoJsonLayer.resetStyle(target)
        })
      }
    })

    geoJsonLayer.addTo(mapRef.current)
    geoJsonLayerRef.current = geoJsonLayer
    
    // Fit map to Uganda bounds with padding to show surrounding countries
    const bounds = geoJsonLayer.getBounds()
    mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    
    console.log('GeoJSON layer added')

  }, [geoData, isMapReady, districtMPCounts])

  // Update selected district style
  useEffect(() => {
    if (!geoJsonLayerRef.current) return

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const feature = layer.feature
      if (!feature) return
      
      const districtName = feature.properties?.name || ''
      const region = getDistrictRegion(districtName)
      const mpCount = getMPCount(districtName, districtMPCounts)
      const isSelected = selectedDistrict?.toUpperCase() === districtName.toUpperCase()

      if (isSelected) {
        layer.setStyle({
          fillColor: getDistrictColor(region, mpCount),
          weight: 3,
          opacity: 1,
          color: '#000',
          fillOpacity: 0.95,
        })
        layer.bringToFront()
      } else {
        layer.setStyle({
          fillColor: getDistrictColor(region, mpCount),
          weight: 1,
          opacity: 1,
          color: '#444',
          fillOpacity: 0.7,
        })
      }
    })
  }, [selectedDistrict, districtMPCounts])

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[calc(100vh-250px)] min-h-[700px] rounded-lg border border-gray-200 shadow-sm"
        style={{ zIndex: 1, backgroundColor: '#f8f9fa' }}
      />
      
      {/* Map View Switcher */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-1">
        <div className="flex flex-col gap-1">
          {(Object.keys(TILE_LAYERS) as MapView[]).map((view) => (
            <button
              key={view}
              onClick={() => setMapView(view)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                mapView === view
                  ? 'bg-[#2d5016] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={`Switch to ${TILE_LAYERS[view].name} view`}
            >
              {TILE_LAYERS[view].name}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .district-tooltip {
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 13px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .district-tooltip strong {
          color: #2d5016;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}

// Helper function to get MP count with case-insensitive matching
function getMPCount(districtName: string, districtMPCounts: DistrictMPCount): number {
  // Try exact match
  if (districtMPCounts[districtName] !== undefined) return districtMPCounts[districtName]
  
  // Try uppercase
  if (districtMPCounts[districtName.toUpperCase()] !== undefined) return districtMPCounts[districtName.toUpperCase()]
  
  // Try lowercase comparison
  const lowerName = districtName.toLowerCase()
  for (const [key, value] of Object.entries(districtMPCounts)) {
    if (key.toLowerCase() === lowerName) return value
  }
  
  return 0
}
