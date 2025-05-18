import stations from "../data/stations.json";

export function getStations() {
  return Promise.resolve(stations);
}

export function getStationById(id) {
  return Promise.resolve(stations.find((station) => station.id === id));
}
