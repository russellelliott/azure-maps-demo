import React, { useState, useRef } from 'react';
import {
  AzureMap,
  AzureMapsProvider,
  AzureMapDataSourceProvider,
  AzureMapLayerProvider,
} from 'react-azure-maps';
import { AuthenticationType } from 'azure-maps-control';

const option = {
  authOptions: {
    authType: AuthenticationType.subscriptionKey,
    // Use the environment variable for the subscription key
    subscriptionKey: process.env.REACT_APP_AZURE_MAPS_KEY,
  },
  center: [-122.1291891, 47.65431], // Example: Redmond, WA
  zoom: 12,
  view: 'Auto',
};

const App = () => {
  const [isochroneData, setIsochroneData] = useState(null);
  const mapRef = useRef(null);

  const fetchIsochrone = async () => {
    console.log('Button clicked. Starting isochrone fetch...');
    const query = '47.65431,-122.1291891';
    const timeBudgetInSec = 900;
    const subscriptionKey = option.authOptions.subscriptionKey;

    if (!subscriptionKey) {
      console.error('Subscription key is missing!');
      alert('Subscription key is not loaded from environment variables. Please check your .env file and restart the server.');
      return;
    }

    const url = `https://atlas.microsoft.com/route/range/json?subscription-key=${subscriptionKey}&api-version=1.0&query=${query}&timeBudgetInSec=${timeBudgetInSec}`;

    try {
      console.log('Sending API request to:', url);
      const response = await fetch(url);

      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        alert('API request failed. See console for details.');
        return;
      }

      const json = await response.json();
      console.log('API response received:', json);

      if (json.reachableRange && json.reachableRange.boundary) {
        console.log('Parsing boundary data...');

        // Map the boundary coordinates from the API response
        const polygonCoordinates = json.reachableRange.boundary.map(point => [point.longitude, point.latitude]);

        // Ensure the polygon is a closed loop by adding the first coordinate to the end.
        // This is a requirement of GeoJSON polygons.
        if (polygonCoordinates.length > 0) {
          const firstCoordinate = polygonCoordinates[0];
          const lastCoordinate = polygonCoordinates[polygonCoordinates.length - 1];
          if (firstCoordinate[0] !== lastCoordinate[0] || firstCoordinate[1] !== lastCoordinate[1]) {
            polygonCoordinates.push(firstCoordinate);
          }
        }

        // Create a GeoJSON Feature with the polygon geometry
        const isochroneFeature = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [polygonCoordinates], // Note the extra array for the ring
          },
          properties: {},
        };

        // Wrap the feature in a GeoJSON FeatureCollection
        const featureCollection = {
          type: "FeatureCollection",
          features: [isochroneFeature],
        };

        console.log('Final GeoJSON data:', featureCollection);
        setIsochroneData(featureCollection);
        // Fit map to isochrone bounds after drawing
        setTimeout(() => {
          if (mapRef.current && window.atlas) {
            const coordinates = polygonCoordinates;
            const bounds = window.atlas.data.BoundingBox.fromLatLngs(coordinates.map(([lon, lat]) => new window.atlas.data.Position(lon, lat)));
            mapRef.current.setCamera({ bounds, padding: 40 });
          }
        }, 500);
      } else {
        console.error('Failed to retrieve isochrone data:', json);
        alert('Failed to retrieve isochrone data. Check console for details.');
      }
    } catch (error) {
      console.error('Error fetching isochrone:', error);
      alert('Error fetching isochrone. See console for details.');
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <AzureMapsProvider>
        <AzureMap options={option} ref={mapRef}>
          <button
            onClick={fetchIsochrone}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 100,
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            Show 15-min Drive Isochrone
          </button>

          {/* DataSourceProvider must be a direct child of AzureMap */}
          <AzureMapDataSourceProvider id="isochroneDataSource" data={isochroneData}>
            {isochroneData && (
              <AzureMapLayerProvider
                id="isochroneLayer"
                options={{
                  type: 'PolygonLayer',
                  fillColor: 'rgba(0, 150, 200, 0.5)',
                  strokeColor: '#0096C8',
                  strokeWidth: 2,
                }}
                dataSourceId="isochroneDataSource"
              />
            )}
          </AzureMapDataSourceProvider>
        </AzureMap>
      </AzureMapsProvider>
    </div>
  );
};

export default App;