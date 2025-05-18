# LifeDrop 🛰️🚁

LifeDrop is a smart emergency response system built for remote and hard-to-reach areas like national parks, hiking trails, or ski slopes. It combines satellite connectivity, real-time tracking, autonomous drones, and a modular Smart First Aid Kit to deliver life-saving assistance quickly and effectively.

## 🩺 Problem It Solves
In remote regions, delayed medical help can lead to fatal outcomes. LifeDrop addresses this by enabling hikers or adventurers to trigger a drone-assisted response even when there's no mobile reception—ensuring timely first aid delivery and communication with emergency personnel.

## 🛠️ Technologies Used

### Frontend
- React
- Dart / Flutter (Mobile App)

### Backend
- Python
- Flask

### Satellite & Mapping
- Galileo GNSS
- OpenLayers / Mapbox (in fallback use)

### Hardware & Modeling
- Fusion 360 & CAD for designing the Smart First Aid Kit and device housing
- Microcontroller systems (ESP32 / Arduino compatible)

## 🚀 How to Run

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lifedrop.git
cd lifedrop
```

2. Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

3. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

4. (Optional) Run mobile app (if Flutter is set up):

```bash
cd mobile_app
flutter pub get
flutter run
```

## 💡 Features
- Emergency button/wristband with GNSS location triggering
- Admin dashboard with live drone and station tracking
- Automatic drone dispatch and curved flight path visualization
- Smart First Aid Kit with built-in camera and AI guidance module

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License
[MIT](LICENSE)

## 📷 Screenshots and Media
Coming soon…
