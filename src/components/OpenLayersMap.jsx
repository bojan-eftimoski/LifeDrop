import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style, Stroke } from "ol/style";
import Overlay from "ol/Overlay";

// Simple quadratic bezier function
function getBezierCurve(p0, p1, p2, segments = 50) {
  const curve = [];
  for (let t = 0; t <= 1; t += 1 / segments) {
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
    curve.push([x, y]);
  }
  return curve;
}

// Function to create a path with multiple curves
function createMultiCurvePath(start, end, numCurves = 2) {
  const path = [];
  const segmentLength = 1 / numCurves;

  for (let i = 0; i < numCurves; i++) {
    const segmentStart = i === 0 ? start : path[path.length - 1];
    const segmentEnd =
      i === numCurves - 1
        ? end
        : [
            start[0] + (end[0] - start[0]) * (i + 1) * segmentLength,
            start[1] + (end[1] - start[1]) * (i + 1) * segmentLength,
          ];

    // Calculate control point with offset
    const midPoint = [
      (segmentStart[0] + segmentEnd[0]) / 2,
      (segmentStart[1] + segmentEnd[1]) / 2,
    ];

    // Alternate the curve direction
    const offset = 0.02 * (i % 2 === 0 ? 1 : -1);
    const controlPoint = [midPoint[0] + offset, midPoint[1] + offset];

    const curvePoints = getBezierCurve(segmentStart, controlPoint, segmentEnd);
    path.push(...curvePoints);
  }

  return path;
}

export default function OpenLayersMap({
  center = [13.849, 46.38],
  zoom = 11,
  markers = [],
  height = 400,
  animatingDrones = new Set(),
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const [popup, setPopup] = useState(null);
  const [popupOverlay, setPopupOverlay] = useState(null);
  const [features, setFeatures] = useState([]);
  const [routes, setRoutes] = useState({});
  const [completedRoutes, setCompletedRoutes] = useState({});

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
    });

    mapInstanceRef.current = map;

    // Create popup overlay
    const popupElement = document.createElement("div");
    popupElement.className = "ol-popup";
    const popupOverlay = new Overlay({
      element: popupElement,
      positioning: "bottom-center",
      offset: [0, -10],
    });
    map.addOverlay(popupOverlay);
    setPopupOverlay(popupOverlay);

    // Handle click events
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature
      );
      if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        const content = feature.get("popupContent");
        popupOverlay.setPosition(coordinates);
        popupElement.innerHTML = content;
        setPopup({ content, coordinates });
      } else {
        popupOverlay.setPosition(undefined);
        setPopup(null);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!vectorSourceRef.current) return;

    // Clear existing features
    vectorSourceRef.current.clear();
    const newFeatures = [];
    const newRoutes = {};

    // Add completed routes first
    Object.values(completedRoutes).forEach((route) => {
      vectorSourceRef.current.addFeature(route);
    });

    markers.forEach((marker) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([marker.lng, marker.lat])),
        popupContent: marker.popupContent,
      });

      const style = new Style({
        image: new Icon({
          src: marker.iconUrl,
          scale: marker.isPerson ? 0.5 : marker.isAnimating ? 1.2 : 1,
          anchor: [0.5, 0.5],
        }),
      });

      feature.setStyle(style);
      vectorSourceRef.current.addFeature(feature);
      newFeatures.push(feature);

      // If this is an animating drone, create its route
      if (marker.isAnimating && marker.startCoords && marker.endCoords) {
        // Create path with multiple curves
        const numCurves = marker.id === "D3" ? 3 : 2; // D3 gets 3 curves, others get 2
        const pathPoints = createMultiCurvePath(
          [marker.startCoords[0], marker.startCoords[1]],
          [marker.endCoords[0], marker.endCoords[1]],
          numCurves
        );

        const routeFeature = new Feature({
          geometry: new LineString(
            pathPoints.map((point) => fromLonLat(point))
          ),
        });

        routeFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "red",
              width: 4, // Increased line width
              lineDash: [5, 5],
            }),
          })
        );

        vectorSourceRef.current.addFeature(routeFeature);
        newRoutes[marker.id] = routeFeature;
      }
    });

    setFeatures(newFeatures);
    setRoutes(newRoutes);
  }, [markers, completedRoutes]);

  // Add effect to handle completed animations
  useEffect(() => {
    const newCompletedRoutes = { ...completedRoutes };

    // Check for completed animations
    Object.entries(routes).forEach(([droneId, route]) => {
      if (!animatingDrones.has(droneId)) {
        // If the drone is no longer animating, add its route to completed routes
        newCompletedRoutes[droneId] = route;
      }
    });

    setCompletedRoutes(newCompletedRoutes);
  }, [animatingDrones, routes]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: `${height}px` }}
      className="relative"
    >
      {popup && (
        <div
          className="absolute bg-white p-2 rounded shadow-lg border border-gray-200"
          style={{
            left: `${popup.coordinates[0]}px`,
            top: `${popup.coordinates[1]}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {popup.content}
        </div>
      )}
    </div>
  );
}
