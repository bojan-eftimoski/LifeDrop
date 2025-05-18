import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';

class MapCard extends StatefulWidget {
  final Position? currentPosition;
  final bool isMapError;
  final MapController mapController;

  const MapCard({
    super.key,
    required this.currentPosition,
    required this.isMapError,
    required this.mapController,
  });

  @override
  State<MapCard> createState() => _MapCardState();
}

class _MapCardState extends State<MapCard> {
  bool isTopoMap = true;

  // Triglav Lakes Valley Trail coordinates
  static const LatLng triglavLocation = LatLng(46.3374, 13.8345);

  // Main trail (Valley of the Seven Lakes)
  final List<LatLng> mainTrail = const [
    LatLng(46.3374, 13.8345), // Start point
    LatLng(46.3358, 13.8367),
    LatLng(46.3341, 13.8389),
    LatLng(46.3326, 13.8412),
    LatLng(46.3309, 13.8434),
    LatLng(46.3289, 13.8456), // First lake
    LatLng(46.3271, 13.8478),
    LatLng(46.3252, 13.8501),
    LatLng(46.3234, 13.8523), // Second lake
  ];

  // Eastern connecting trail
  final List<LatLng> easternTrail = const [
    LatLng(46.3289, 13.8456), // Connects at First lake
    LatLng(46.3295, 13.8489),
    LatLng(46.3301, 13.8523),
    LatLng(46.3312, 13.8567),
    LatLng(46.3328, 13.8589), // Eastern viewpoint
  ];

  // Western ridge trail
  final List<LatLng> westernTrail = const [
    LatLng(46.3374, 13.8345), // Connects at Start point
    LatLng(46.3382, 13.8312),
    LatLng(46.3395, 13.8289),
    LatLng(46.3412, 13.8267),
    LatLng(46.3428, 13.8245), // Western peak
  ];

  // Southern loop trail
  final List<LatLng> southernLoop = const [
    LatLng(46.3234, 13.8523), // Connects at Second lake
    LatLng(46.3218, 13.8545),
    LatLng(46.3201, 13.8534),
    LatLng(46.3189, 13.8512),
    LatLng(46.3195, 13.8478),
    LatLng(46.3212, 13.8456),
    LatLng(46.3234, 13.8523), // Loops back to Second lake
  ];

  // Points of interest along all trails
  final List<Map<String, dynamic>> pointsOfInterest = const [
    {
      'position': LatLng(46.3289, 13.8456),
      'name': 'First Triglav Lake',
      'type': 'lake',
    },
    {
      'position': LatLng(46.3234, 13.8523),
      'name': 'Second Triglav Lake',
      'type': 'lake',
    },
    {
      'position': LatLng(46.3374, 13.8345),
      'name': 'Trail Start',
      'type': 'start',
    },
    {
      'position': LatLng(46.3428, 13.8245),
      'name': 'Western Peak Viewpoint',
      'type': 'viewpoint',
    },
    {
      'position': LatLng(46.3328, 13.8589),
      'name': 'Eastern Viewpoint',
      'type': 'viewpoint',
    },
    {
      'position': LatLng(46.3195, 13.8478),
      'name': 'Southern Rest Area',
      'type': 'rest',
    },
  ];

  void _toggleMapType() {
    setState(() {
      isTopoMap = !isTopoMap;
    });
  }

  String get _mapAttributionText {
    if (isTopoMap) {
      return '© OpenTopoMap (CC-BY-SA)';
    }
    return '© OpenStreetMap contributors, Humanitarian OSM';
  }

  String get _mapUrlTemplate {
    if (isTopoMap) {
      return 'https://tile.opentopomap.org/{z}/{x}/{y}.png';
    }
    return 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            _buildMap(context),
            Positioned(
              top: 16,
              right: 16,
              child: Column(
                children: [
                  // Map Type Toggle Button
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: Icon(
                        isTopoMap ? Icons.terrain : Icons.emergency,
                        color: isTopoMap ? Colors.brown : Colors.red,
                      ),
                      onPressed: _toggleMapType,
                      tooltip:
                          isTopoMap
                              ? 'Switch to Emergency Map'
                              : 'Switch to Topo Map',
                    ),
                  ),
                  const SizedBox(height: 8),
                  // My Location Button
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.my_location),
                      onPressed: () => _centerOnLocation(context),
                      tooltip: 'My Location',
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Trail Center Button
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.hiking),
                      onPressed: _centerOnTrail,
                      tooltip: 'Center on Trail',
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
            ),
            // Map Attribution
            Positioned(
              bottom: 8,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _mapAttributionText,
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.black.withOpacity(0.6),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMap(BuildContext context) {
    if (widget.isMapError) {
      return const Center(
        child: Text(
          'Unable to load map.\nPlease check location permissions.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.red),
        ),
      );
    }

    return FlutterMap(
      mapController: widget.mapController,
      options: MapOptions(
        initialCenter: triglavLocation,
        initialZoom: 14,
        keepAlive: true,
      ),
      children: [
        TileLayer(
          urlTemplate: _mapUrlTemplate,
          userAgentPackageName: 'com.example.life_drop',
          tileProvider: NetworkTileProvider(),
          retinaMode: true,
        ),
        PolylineLayer(
          polylines: [
            // Main trail
            Polyline(points: mainTrail, color: Colors.red, strokeWidth: 4.0),
            // Eastern trail
            Polyline(
              points: easternTrail,
              color: Colors.orange,
              strokeWidth: 3.5,
            ),
            // Western trail
            Polyline(
              points: westernTrail,
              color: Colors.blue,
              strokeWidth: 3.5,
            ),
            // Southern loop
            Polyline(
              points: southernLoop,
              color: Colors.green,
              strokeWidth: 3.5,
            ),
          ],
        ),
        MarkerLayer(markers: _buildMarkers(context)),
      ],
    );
  }

  List<Marker> _buildMarkers(BuildContext context) {
    return [
      if (widget.currentPosition != null)
        Marker(
          point: LatLng(
            widget.currentPosition!.latitude,
            widget.currentPosition!.longitude,
          ),
          width: 40,
          height: 40,
          child: const Icon(Icons.my_location, color: Colors.blue, size: 40),
        ),
      ...pointsOfInterest.map(
        (poi) => Marker(
          point: poi['position'] as LatLng,
          width: 30,
          height: 30,
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(poi['name'] as String),
                  duration: const Duration(seconds: 2),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: Icon(
              _getPoiIcon(poi['type'] as String),
              color: _getPoiColor(poi['type'] as String),
              size: 30,
            ),
          ),
        ),
      ),
    ];
  }

  IconData _getPoiIcon(String type) {
    switch (type) {
      case 'lake':
        return Icons.water;
      case 'viewpoint':
        return Icons.landscape;
      case 'rest':
        return Icons.chair;
      case 'start':
        return Icons.hiking;
      default:
        return Icons.place;
    }
  }

  Color _getPoiColor(String type) {
    switch (type) {
      case 'lake':
        return Colors.blue;
      case 'viewpoint':
        return Colors.purple;
      case 'rest':
        return Colors.brown;
      case 'start':
        return Colors.green;
      default:
        return Colors.red;
    }
  }

  void _centerOnLocation(BuildContext context) {
    if (widget.currentPosition != null) {
      widget.mapController.move(
        LatLng(
          widget.currentPosition!.latitude,
          widget.currentPosition!.longitude,
        ),
        15,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location not available'),
          duration: Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _centerOnTrail() {
    widget.mapController.move(triglavLocation, 14);
  }
}
