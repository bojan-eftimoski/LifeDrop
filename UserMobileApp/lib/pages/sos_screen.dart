import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:async';
import '../components/gps_signal_widget.dart';
import 'dart:math';

class SOSScreen extends StatefulWidget {
  const SOSScreen({super.key});

  @override
  State<SOSScreen> createState() => _SOSScreenState();
}

class _SOSScreenState extends State<SOSScreen> {
  int _minutes = 10;
  int _seconds = 0;
  late Timer _timer;
  final MapController _mapController = MapController();

  // Simulated positions
  final LatLng _userPosition = const LatLng(46.3374, 13.8345);
  final LatLng _dronePosition = const LatLng(46.3289, 13.8456);

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_seconds > 0) {
          _seconds--;
        } else if (_minutes > 0) {
          _minutes--;
          _seconds = 59;
        } else {
          _timer.cancel();
        }
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String _formatTime() {
    return '${_minutes.toString().padLeft(2, '0')}:${_seconds.toString().padLeft(2, '0')}';
  }

  Widget _buildMap() {
    // Calculate intermediate points for wavy line
    List<LatLng> getWavyPoints(LatLng start, LatLng end) {
      final points = <LatLng>[];
      final numPoints = 20; // More points for smoother curve

      for (int i = 0; i <= numPoints; i++) {
        double t = i / numPoints;

        // Base position along straight line
        double lat = start.latitude + (end.latitude - start.latitude) * t;
        double lng = start.longitude + (end.longitude - start.longitude) * t;

        // Add subtle wave effect
        double wave = sin(t * 3.14159 * 2) * 0.0002; // Reduced amplitude

        points.add(LatLng(lat + wave, lng + wave));
      }

      return points;
    }

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(initialCenter: _userPosition, initialZoom: 14),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.life_drop',
        ),
        PolylineLayer(
          polylines: [
            Polyline(
              points: getWavyPoints(_userPosition, _dronePosition),
              color: Colors.red,
              strokeWidth: 3.0,
              isDotted: false,
            ),
          ],
        ),
        MarkerLayer(
          markers: [
            Marker(
              point: _userPosition,
              width: 40,
              height: 40,
              child: const Icon(
                Icons.person_pin_circle,
                color: Colors.blue,
                size: 40,
              ),
            ),
            Marker(
              point: _dronePosition,
              width: 40,
              height: 40,
              child: const Icon(Icons.emergency, color: Colors.red, size: 40),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final mapHeight = screenHeight * 0.5; // 50% of screen height
    final bottomSectionHeight = screenHeight * 0.45; // 45% of screen height
    final timerSize = 240.0;
    final whiteOverlap = 30.0;

    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 233, 233, 233),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background color
          Container(color: const Color.fromARGB(255, 233, 233, 233)),
          // Content Stack
          Column(
            children: [
              // Map Section
              SizedBox(height: mapHeight, child: _buildMap()),
              const Spacer(),
            ],
          ),
          // White Bottom Section
          Positioned(
            top: mapHeight - whiteOverlap,
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
              ),
              child: Padding(
                padding: EdgeInsets.only(
                  top: (timerSize / 2) + 100,
                  left: 20,
                  right: 20,
                ),
                child: Column(
                  children: [
                    const Text(
                      'Emergency services have been notified',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Stay calm and remain in your current location.\nHelp via DRONE will arrive shortly.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.black54,
                        fontSize: 16,
                        height: 1.5,
                      ),
                    ),
                    const Spacer(),
                    const GPSSignalWidget(
                      signalStrength: 3,
                      accuracy: 5.0,
                      satellites: 8,
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
          // Timer
          Positioned(
            top: mapHeight - (timerSize / 2),
            left: 0,
            right: 0,
            child: Center(
              child: Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(200),
                ),
                child: Container(
                  width: timerSize,
                  height: timerSize,
                  padding: const EdgeInsets.all(25),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: timerSize,
                        height: timerSize,
                        child: CircularProgressIndicator(
                          value: (_minutes * 60 + _seconds) / (10 * 60),
                          strokeWidth: 15,
                          backgroundColor: Colors.red.withOpacity(0.1),
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            Colors.red,
                          ),
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(height: 10),
                          Text(
                            _formatTime(),
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 54,
                              fontWeight: FontWeight.bold,
                              height: 1,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'minutes',
                            style: TextStyle(
                              color: Colors.black54,
                              fontSize: 20,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
