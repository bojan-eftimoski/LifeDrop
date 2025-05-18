# LifeDrop 🛰️🚁

LifeDrop is a smart emergency response system built for remote and hard-to-reach areas like national parks, hiking trails. It combines satellite connectivity, real-time tracking, autonomous drones, and a modular Smart First Aid Kit to deliver life-saving assistance quickly and effectively.

## 🩺 Problem It Solves

In remote regions, delayed medical help can lead to fatal outcomes. LifeDrop addresses this by enabling hikers or adventurers to trigger a drone-assisted response even when there's no mobile reception—ensuring timely first aid delivery and communication with emergency personnel.

## 🛠️ Technologies Used

### Frontend

* React
* Dart / Flutter (Mobile App)

### Backend

* Python
* Flask

### Satellite & Mapping

* Galileo GNSS
* OpenLayers / Mapbox (in fallback use)

### Hardware & Modeling

* Fusion 360 & CAD for designing the Smart First Aid Kit and device housing
* Microcontroller systems (ESP32 / Arduino compatible)

## 🚀 How to Run

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lifedrop.git
cd lifedrop
```

2. Install backend dependencies:

```bash
cd FlightPathAlgorithm
python app.py
```

3. Start the frontend:

```bash
cd DroneFlightInterface
npm install
npm run dev
```

4. (Optional) Run mobile app (if Flutter is set up):

```bash
cd UserMobileApp
flutter pub get
flutter run
```


## LifeDrop Beacon (Hardware)

We kept things simple and reliable. The whole system runs on an Arduino Uno. When you press the button, it grabs your current GPS location and sends it to a satellite through the Kinéis KIM1 module. You’ll hear a short beep if it works, or a longer one if something went wrong.

We use a small OLED screen to show what's happening — so even without a phone or app, you know the system is working. It’ll show messages like "Starting…", "Sending…", "Kineis: OK", etc.

Here’s what’s wired up:

* **Arduino Uno**
* **GNSS module** for location
* **KIM1 satellite modem** to send your coordinates
* **OLED screen** (I2C) for messages
* **Buzzer** for sound feedback
* **One button** (Pin 6) to trigger the whole process

### What Gets Sent

When you press the button, the Arduino takes the latitude and longitude, formats them into simple ASCII text (including the decimal point), and turns that into a 23-byte message. It looks like this:

```
Lat (ASCII) → up to 11 bytes
Lon (ASCII) → up to 11 bytes
+ 1 byte at the end (signal/check)
```

That’s what gets fired off to the satellite. Nothing fancy, just raw location info, readable even after decoding.

### How It’s Wired

| What         | Pin                    |
| ------------ | ---------------------- |
| GNSS module  | Serial RX (e.g. Pin 8) |
| Button       | Digital Pin 6          |
| Buzzer       | Digital Pin 5          |
| OLED display | I2C (SDA/SCL on A4/A5) |
| KIM1         | RX\_KIM / TX\_KIM      |
| GND          | Common ground shared   |

### Testing

We’ve tested this setup with both simulated GPS values and a real GNSS module. The OLED clearly shows what’s happening, and you get immediate feedback when the transmission succeeds or fails. Even with poor GPS signal, it sends fallback values so the location is never blank.

If you’re reading this and building something similar — it works. You just need to keep it light, remove the unnecessary sensors, and make sure you test your wiring twice.

More detailed firmware and hardware docs are available in the `/firmware` and `/hardware` folders.

## 💡 Features

* Emergency button/wristband with GNSS location triggering
* Admin dashboard with live drone and station tracking
* Automatic drone dispatch and curved flight path visualization
* Smart First Aid Kit with built-in camera and AI guidance module

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📷 Screenshots and Media

Coming soon…
