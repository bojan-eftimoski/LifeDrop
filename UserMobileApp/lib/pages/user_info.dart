import 'package:flutter/material.dart';

class UserInfo extends StatelessWidget {
  const UserInfo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Health Profile',
          style: TextStyle(
            color: Colors.black,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSection('Personal Information', [
            _buildInfoTile('Full Name', 'John Doe'),
            _buildInfoTile('Age', '28 years'),
            _buildInfoTile('Blood Type', 'O+'),
          ]),
          const SizedBox(height: 20),
          _buildSection('Medical History', [
            _buildInfoTile('Chronic Conditions', 'None'),
            _buildInfoTile('Past Surgeries', 'Appendectomy (2019)'),
            _buildInfoTile('Current Medications', 'None'),
          ]),
          const SizedBox(height: 20),
          _buildSection('Allergies & Sensitivities', [
            _buildInfoTile('Food Allergies', 'Peanuts'),
            _buildInfoTile('Drug Allergies', 'Penicillin'),
            _buildInfoTile('Other Allergies', 'None'),
          ]),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 10,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
          ),
          const Divider(height: 1),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return Column(
      children: [
        ListTile(
          title: Text(
            label,
            style: const TextStyle(color: Colors.grey, fontSize: 16),
          ),
          subtitle: Text(
            value,
            style: const TextStyle(
              color: Colors.black87,
              fontSize: 18,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        const Divider(height: 1),
      ],
    );
  }
}
