import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { useState, useEffect } from "react";
import { feature } from "topojson-client";
import countries110 from "world-atlas/countries-110m.json";

// Region → Coordinates mapping
const regionCoordinates = {
  "North America": [-100, 45],
  Europe: [10, 50],
  "Asia-Pacific": [110, 15],
  "South America": [-60, -15],
  "Middle East": [45, 25],
};

const DEFAULT_CENTER = [10, 10];
const DEFAULT_ZOOM = 1;

const animateZoom = (from, to, setFn, duration = 1000) => {
  const start = performance.now();
  const step = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const newValue = from.map((val, i) => val + (to[i] - val) * progress);
    setFn(newValue);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

export default function WorldMapCard({ users = [], onRegionSelect, regionToZoom }) {
  const [geographies, setGeographies] = useState([]);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const geoJson = feature(countries110, countries110.objects.countries).features;
    setGeographies(geoJson);
    if (regionToZoom && regionCoordinates[regionToZoom]) {
      animateZoom(center, regionCoordinates[regionToZoom], setCenter);
      animateZoom([zoom], [3], (val) => setZoom(val[0]));
    } else if (regionToZoom === null) {
      // Reset view when "All" is selected
      animateZoom(center, DEFAULT_CENTER, setCenter);
      animateZoom([zoom], [DEFAULT_ZOOM], (val) => setZoom(val[0]));
    }
  }, [regionToZoom]);

  const regionMarkers = Array.from(
    new Map(
      users.map((user) => [
        user.region,
        {
          name: user.region,
          coordinates: regionCoordinates[user.region],
        },
      ])
    ).values()
  ).filter((marker) => marker.coordinates);

  const handleMarkerClick = (coordinates, region) => {
    animateZoom(center, coordinates, setCenter);
    animateZoom([zoom], [3], (val) => setZoom(val[0]));
    if (onRegionSelect) onRegionSelect(region);
  };  

  const handleReset = () => {
    animateZoom(center, DEFAULT_CENTER, setCenter);
    animateZoom([zoom], [DEFAULT_ZOOM], (val) => setZoom(val[0]));
    onRegionSelect(null);
  };

  const blockScroll = (e) => e.preventDefault();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full text-center">
      <h3 className="mb-6 text-xl font-semibold text-slate-700">
        Sales Reps by Region
      </h3>

      <div className="flex justify-center" onWheel={blockScroll}>
        <ComposableMap
          projectionConfig={{ scale: 140 }}
          width={600}
          height={350}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup center={center} zoom={zoom}>
            <Geographies geography={geographies}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill: "#e2e8f0", outline: "none" },
                      hover: { fill: "#cbd5e0", outline: "none" },
                      pressed: { fill: "#a0aec0", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {regionMarkers.map(({ name, coordinates }) => (
              <Marker
                key={name}
                coordinates={coordinates}
                onClick={() => handleMarkerClick(coordinates, name)}
                style={{ cursor: "pointer" }}
              >
                <circle r={5} fill="#1e3a8a" />
                <text
                  textAnchor="middle"
                  y={-12}
                  className="text-[13px] font-sans fill-slate-800"
                >
                  {name}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <button
        onClick={handleReset}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-900"
      >
        Reset View
      </button>
    </div>
  );
}
