import 'package:flutter/material.dart';
import '../pages/sos_screen.dart';

class EmergencyDialog extends StatefulWidget {
  final Function() onSendEmergency;

  const EmergencyDialog({super.key, required this.onSendEmergency});

  @override
  State<EmergencyDialog> createState() => _EmergencyDialogState();
}

class _EmergencyDialogState extends State<EmergencyDialog> {
  bool isRecording = false;
  final TextEditingController _emergencyMessageController =
      TextEditingController();

  @override
  void dispose() {
    _emergencyMessageController.dispose();
    super.dispose();
  }

  Widget _buildRecordButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isRecording ? Colors.red : Colors.blue,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (isRecording ? Colors.red : Colors.blue).withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isRecording ? Icons.stop_circle : Icons.mic,
            size: 48,
            color: Colors.white,
          ),
          const SizedBox(height: 16),
          Text(
            isRecording ? 'Tap to Stop' : 'Tap to Record',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (isRecording) ...[
            const SizedBox(height: 8),
            const Text(
              'Recording...',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ] else
            const SizedBox(
              height: 22,
            ), // Compensate for the missing "Recording..." text
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Emergency Alert',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 24),
            InkWell(
              onTap: () {
                setState(() {
                  isRecording = !isRecording;
                });
              },
              child: _buildRecordButton(),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _emergencyMessageController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Or type your emergency message here...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey[50],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  widget.onSendEmergency();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (context) => const SOSScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Send Emergency Alert',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
