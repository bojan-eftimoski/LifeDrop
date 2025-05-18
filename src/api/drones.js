import drones from "../data/drones.json";

export function getDrones() {
  return Promise.resolve(drones);
}

export function getDroneById(id) {
  return Promise.resolve(drones.find((drone) => drone.id === id));
}
