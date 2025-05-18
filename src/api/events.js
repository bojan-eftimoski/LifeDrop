import events from "../data/replayEvents.json";

export function getEvents() {
  return Promise.resolve(events);
}

export function getEventById(id) {
  return Promise.resolve(events.find((event) => event.id === id));
}
