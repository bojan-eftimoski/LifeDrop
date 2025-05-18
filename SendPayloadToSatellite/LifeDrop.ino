#include <Wire.h>
#include <U8g2lib.h>
#include "KIM_Arduino_Library.h"
#include <SoftwareSerial.h>

#define BUZZER_PIN 5
#define BUTTON_PIN 6

char ID[2]   = "ID";
char FW[2]   = "FW";
char TX[2]   = "TX";
char PWR[3]  = "PWR";
char AFMT[4] = "AFMT";
char SAVE[8] = "SAVE_CFG";

SoftwareSerial kimSerial(RX_KIM, TX_KIM);
KIM kineis(&kimSerial);

U8G2_SSD1306_128X64_NONAME_1_HW_I2C display(U8G2_R2, U8X8_PIN_NONE);

bool kim1initialized = false;
const long buttonPressInterval = 5000;
unsigned long lastPress = 0;

double simLatitude = 41.6478;
double simLongitude = 20.7506;

void beep(int ms) {
  for (int i = 0; i < ms / 4; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(2);
    digitalWrite(BUZZER_PIN, LOW);
    delay(2);
  }
}

bool buttonPressed() {
  return digitalRead(BUTTON_PIN) == HIGH;
}

void show(const char* l1, const char* l2 = "", const char* l3 = "", const char* l4 = "") {
  display.firstPage();
  do {
    display.setFont(u8g2_font_6x12_tr);
    display.drawStr(0, 12, l1);
    if (l2[0]) display.drawStr(0, 24, l2);
    if (l3[0]) display.drawStr(0, 36, l3);
    if (l4[0]) display.drawStr(0, 48, l4);
  } while (display.nextPage());
}

void showStr(const String& l1, const String& l2 = "", const String& l3 = "", const String& l4 = "") {
  show(l1.c_str(), l2.c_str(), l3.c_str(), l4.c_str());
}

void floatToAsciiHexPayload(double value, byte* payload, int offset) {
  char buf[16];
  dtostrf(value, 0, 6, buf);
  int len = strlen(buf);
  for (int i = 0; i < len && (i + offset) < 23; i++) {
    payload[offset + i] = buf[i];
  }
}

void sendPayload(double lat, double lon) {
  byte payload[23] = {0};
  char hexPayload[47];

  floatToAsciiHexPayload(lat, payload, 0);   // Latitude into bytes 0–10
  floatToAsciiHexPayload(lon, payload, 11);  // Longitude into bytes 11–21
  payload[22] = 42;                          // Signal byte

  for (int i = 0; i < 23; i++) {
    sprintf(&hexPayload[i * 2], "%02X", payload[i]);
  }
  hexPayload[46] = '\0';

  Serial.println("Sending payload:");
  Serial.println(hexPayload);
  showStr("Sending...", "Lat: " + String(lat, 6), "Lon: " + String(lon, 6));

  if (kim1initialized) {
    kineis.KIM_powerON(true);
    delay(200);
    kineis.KIM_sendATCommandSet(TX, sizeof(TX), hexPayload, 46);
    delay(2000);
    int status = kineis.KIM_getState();
    if (status == KIM_OK) {
      Serial.println("Sent OK");
      show("Kineis: OK");
      beep(100);
    } else {
      Serial.println("Send failed");
      show("Kineis: X");
      beep(300);
    }
    kineis.KIM_powerON(false);
  } else {
    show("Kineis not ready");
  }
}

bool initKineis() {
  show("Init Kineis...");
  kineis.KIM_powerON(true);
  kineis.KIM_userWakeupPinToggle();

  if (!kineis.KIM_check()) {
    kim1initialized = false;
    show("Kineis Error");
    beep(1000);
    return false;
  }

  show("Kineis OK", "Reading ID...");
  delay(400);
  String id = kineis.KIM_sendATCommandGet(ID, sizeof(ID));
  showStr("ID: " + id);

  delay(400);
  String fw = kineis.KIM_sendATCommandGet(FW, sizeof(FW));
  showStr("FW: " + fw);

  delay(400);
  kineis.KIM_sendATCommandSet(AFMT, sizeof(AFMT), "1,16,32", sizeof("1,16,32"));
  show("Set AFMT");

  delay(400);
  kineis.KIM_sendATCommandSet(PWR, sizeof(PWR), "1000", sizeof("1000") - 1);
  show("Set Power");

  delay(400);
  kineis.KIM_sendATCommandSet(SAVE, sizeof(SAVE), "", sizeof(""));
  show("Saved Config");

  kim1initialized = true;
  return true;
}

void setup() {
  Serial.begin(9600);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  Wire.begin();

  display.begin();
  display.setFont(u8g2_font_6x12_tr);
  show("LifeDrop", "Starting...");

  delay(3000);

  if (initKineis()) {
    show("Ready", "Press button");
  }
}

void loop() {
  if (buttonPressed() && millis() - lastPress > buttonPressInterval) {
    lastPress = millis();
    beep(50);
    sendPayload(simLatitude, simLongitude);
  }
}