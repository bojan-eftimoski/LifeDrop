import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:flutter_map/flutter_map.dart';
import '../components/profile_card.dart';
import '../components/map_card.dart';
import '../components/sos_button.dart';
import '../components/emergency_dialog.dart';
import '../components/gps_signal_widget.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  BluetoothDevice? connectedDevice;
  BluetoothCharacteristic? writeChar;
  Position? currentPosition;
  final MapController mapController = MapController();
  bool isMapError = false;
  int gpsStrength = 0;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => isMapError = true);
        print('Location services are disabled.');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => isMapError = true);
          print('Location permissions are denied');
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() {
        currentPosition = position;
        isMapError = false;
      });
      print('Location obtained: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      setState(() => isMapError = true);
      print('Error getting location: $e');
    }
  }

  Future<void> _getLocation(BluetoothCharacteristic? writeChar) async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('Location services are disabled.');
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print('Location permissions are denied');
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      print('Location permissions are permanently denied.');
      return;
    }

    Position? position;
    try {
      position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print('Error getting location: $e');
      return;
    }

    if (position != null) {
      print('Latitude: ${position.latitude}, Longitude: ${position.longitude}');
      if (writeChar != null) {
        final gps = '{"lat":${position.latitude},"lon":${position.longitude}}';
        await writeChar.write(gps.codeUnits);
        print("Sent GPS: $gps");
      }
    }
  }

  Future<void> _connectToLifeDrop() async {
    print("🔍 Starting scan...");

    // Start scan
    await FlutterBluePlus.startScan(timeout: Duration(seconds: 5));

    // Wait for scan results
    await Future.delayed(Duration(seconds: 6)); // Give it time to populate

    List<ScanResult> results = FlutterBluePlus.lastScanResults;
    bool deviceFound = false;

    for (ScanResult r in results) {
      print("📡 Found: ${r.device.name}");
      if (r.device.name.trim() == "LifeDrop Module") {
        deviceFound = true;
        await FlutterBluePlus.stopScan();
        connectedDevice = r.device;
        print("🔗 Connecting to device...");
        try {
          await connectedDevice!.connect(timeout: Duration(seconds: 5));
          print("✅ Connected!");
          List<BluetoothService> services =
              await connectedDevice!.discoverServices();
          for (var service in services) {
            for (var c in service.characteristics) {
              print("🧭 Char: ${c.uuid}");
              if (c.uuid.toString().toLowerCase().contains("6e400002")) {
                writeChar = c;
                print("✅ Ready to write!");
              }
            }
          }
        } catch (e) {
          print("❌ Connection failed: $e");
        }
        break;
      }
    }

    if (!deviceFound) {
      print("LifeDrop Module not found after scan.");
    }
  }

  void _showEmergencyModal() {
    showDialog(
      context: context,
      builder:
          (context) => EmergencyDialog(onSendEmergency: _connectToLifeDrop),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final safeAreaPadding = MediaQuery.of(context).padding;
    final availableHeight =
        screenHeight - safeAreaPadding.top - safeAreaPadding.bottom;

    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 233, 233, 233),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              // Profile Section - 10%
              SizedBox(
                height: availableHeight * 0.12,
                child: const ProfileCard(),
              ),
              const SizedBox(height: 8),
              // SOS Button Section - 22%
              SizedBox(
                height: availableHeight * 0.22,
                child: SOSButton(
                  isConnected: connectedDevice != null,
                  onTap: _showEmergencyModal,
                ),
              ),
              const SizedBox(height: 8),
              // Map Section - 50%
              SizedBox(
                height: availableHeight * 0.48,
                child: MapCard(
                  currentPosition: currentPosition,
                  isMapError: isMapError,
                  mapController: mapController,
                ),
              ),
              const SizedBox(height: 8),
              // GPS Signal Section - 10%
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 22),
                child: SizedBox(
                  height: availableHeight * 0.10,
                  child: GPSSignalWidget(
                    signalStrength: gpsStrength,
                    accuracy: currentPosition?.accuracy ?? 0,
                    satellites: 6,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
