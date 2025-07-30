import React, { useEffect, useRef } from "react";
import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";

function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new atlas.Map(mapRef.current, {
      center: [-122.33, 47.6], // Seattle coords
      zoom: 10,
      authOptions: {
        authType: "subscriptionKey",
        subscriptionKey: process.env.REACT_APP_AZURE_MAPS_KEY,
      },
    });

    map.events.add("ready", () => {
      console.log("Azure Map is ready!");
    });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export default App;
