import 'package:flutter/material.dart';

class GPSSignalWidget extends StatelessWidget {
  final int signalStrength; // 0-4
  final double accuracy; // in meters
  final int satellites;

  const GPSSignalWidget({
    super.key,
    required this.signalStrength,
    required this.accuracy,
    required this.satellites,
  });

  Color _getSignalColor(int strength) {
    return Colors.green; // Always return green regardless of signal strength
  }

  Widget _buildSignalBar(bool isActive, Color color) {
    return Container(
      width: 4,
      height: 8 + (isActive ? 0 : 8),
      margin: const EdgeInsets.symmetric(horizontal: 1),
      decoration: BoxDecoration(
        color: isActive ? color : Colors.grey[300],
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 0),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  Icons.gps_fixed,
                  color: _getSignalColor(signalStrength),
                  size: 32,
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'GPS Signal',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _getSignalColor(signalStrength),
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      'Accuracy: ±${accuracy.round()}m',
                      style: const TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
            Row(
              children: [
                Text(
                  '$satellites satellites',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(width: 8),
                Row(
                  children: List.generate(
                    4,
                    (index) => _buildSignalBar(
                      index < signalStrength,
                      _getSignalColor(signalStrength),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
