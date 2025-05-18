import wristbands from "../data/wristbands.json";

export function getWristbands() {
  return Promise.resolve(wristbands);
}

export function getWristbandById(id) {
  return Promise.resolve(wristbands.find((wristband) => wristband.id === id));
}
