import React from "react";
import { GoogleMap, LoadScript, Polygon } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px"
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

const polygonPath = [
  { lat: 37.782, lng: -122.447 },
  { lat: 37.782, lng: -122.443 },
  { lat: 37.778, lng: -122.443 },
  { lat: 37.778, lng: -122.447 }
];

const polygonOptions = {
  fillColor: "#FF0000",
  fillOpacity: 0.35,
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 1
};

function MapWithPolygon() {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
        <Polygon paths={polygonPath} options={polygonOptions} />
      </GoogleMap>
    </LoadScript>
  );
}

export default MapWithPolygon;
