# LifeDrop - Hardware Overview

## Components

### 1. **Arduino Uno**

* Central controller for sensor data, satellite communication, and feedback.
* Reads GNSS coordinates directly from an onboard GNSS module.
* On trigger (button press), processes and sends location data via Kinéis satellite.
* Controls the OLED display and buzzer.

### 2. **GNSS Module**

* Provides real-time global location coordinates to Arduino.
* Connected via hardware or software serial.
* If no fix is available, Arduino sends a fallback simulated location.

### 3. **Kinéis Satellite Shield (KIM1 Module)**

* Used for long-range, global satellite communication.
* Sends 23-byte payloads containing GPS coordinates and optional signal metadata.
* Configured via AT commands using KIM Arduino Library.
* Communicates via SoftwareSerial over `RX_KIM` and `TX_KIM`.

### 4. **0.96" OLED I2C Display**

* Displays system boot status, GPS coordinates, payload data, and Kinéis responses.
* Uses `U8G2` library with hardware I2C support.

### 5. **Buzzer**

* Provides audio feedback on user action (button press) and transmission result.
* Quick beep = sent OK
* Long beep = error or KIM1 not initialized

### 6. **Push Button (Digital Pin 6)**

* Triggers the GPS coordinate transmission manually.
* Debounced using timing logic in software.

---

## Transmission Format

* Coordinates are encoded as ASCII strings, one character per byte.
* Payload: `Lat (11 bytes) + Lon (11 bytes) + Signal Byte (1 byte)` = **23 bytes**.
* Format allows human-readable decoding and compatibility with backend parsers.

---

## Wiring Summary

| Component    | Pin/Interface           |
| ------------ | ----------------------- |
| GNSS TX      | Arduino RX (e.g. Pin 8) |
| Button       | Digital Pin 6           |
| Buzzer       | Digital Pin 5           |
| OLED Display | I2C (SDA/SCL via A4/A5) |
| KIM1 TX/RX   | RX\_KIM / TX\_KIM       |
| GND          | Common Ground Shared    |

---

## Power Requirements

* 5V regulated power for Arduino Uno
* GNSS and KIM1 powered via 3.3V or 5V logic-safe regulators
* KIM1 and peripherals draw low current (\~<250 mA typical burst)

---

## File Structure

* `LifeDrop.ino` — Main firmware for Arduino Uno
* `KIM_Arduino_Library` — Driver for Kinéis satellite modem

---

## Testing

* Tested in offline environments with live GNSS input
* OLED confirms GNSS fix and payload formatting
* KIM1 module validated via AT command debug log

---
