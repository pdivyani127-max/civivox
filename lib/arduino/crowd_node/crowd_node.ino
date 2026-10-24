/*
  Crowd Noise Node  -  Arduino UNO + LM393 sound module
  Counts how often the sound sensor fires, turns that into Low / Moderate / Crowded,
  lights the built-in LED when Crowded, and prints one JSON line over USB every window.
  No audio is ever recorded - only "was it loud or not" samples.

  WIRING (3 wires, no other parts needed):
    LM393 VCC -> Arduino 5V
    LM393 GND -> Arduino GND
    LM393 DO  -> Arduino pin 2        (leave AO unconnected)
  The built-in LED on pin 13 is the alert light.

  SETUP: turn the small screw (potentiometer) on the LM393 until its own LED stays off
  in a quiet room but flickers when you clap or talk loudly. Then press the Arduino
  RESET button: it spends 10 seconds in a quiet room to learn the "normal" level.
*/

const int SOUND_PIN = 2;
const int LED_PIN = 13;

// Most LM393 modules pull DO LOW when sound is loud. If your readings look inverted
// (always busy in a quiet room), change LOW to HIGH here.
const int ACTIVE_STATE = LOW;

const unsigned long SAMPLE_MS = 5;          // look at the sensor every 5 ms
const unsigned long WINDOW_MS = 5000;       // one report every 5 seconds
const unsigned long CALIBRATION_MS = 10000; // learn the quiet level at start-up (10 s)
const int MODERATE_ABOVE = 10;              // % points above quiet level = Moderate
const int CROWDED_ABOVE = 30;               // % points above quiet level = Crowded

int baseline = 0;
int prevCurrent = -1;
int prevSmoothed = -1;

// Returns the % of samples in which the sensor reported loud sound
int measureWindow(unsigned long durationMs, bool blink) {
  unsigned long start = millis();
  unsigned long samples = 0, active = 0;
  while (millis() - start < durationMs) {
    if (digitalRead(SOUND_PIN) == ACTIVE_STATE) active++;
    samples++;
    if (blink) digitalWrite(LED_PIN, (millis() / 250) % 2);
    delay(SAMPLE_MS);
  }
  return samples ? (int)(100UL * active / samples) : 0;
}

void setup() {
  pinMode(SOUND_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Calibrating - keep the room quiet for 10 seconds...");
  baseline = measureWindow(CALIBRATION_MS, true);
  digitalWrite(LED_PIN, LOW);
  Serial.print("Quiet level learned: ");
  Serial.print(baseline);
  Serial.println("%");
}

void loop() {
  int current = measureWindow(WINDOW_MS, false);
  // average with the previous window so one short clap does not cause an alert
  int smoothed = (prevCurrent < 0) ? current : (prevCurrent + current) / 2;

  const char* level = "low";
  if (smoothed >= baseline + CROWDED_ABOVE) level = "crowded";
  else if (smoothed >= baseline + MODERATE_ABOVE) level = "moderate";

  const char* trend = "steady";
  if (prevSmoothed >= 0) {
    if (smoothed - prevSmoothed >= 8) trend = "rising";
    else if (prevSmoothed - smoothed >= 8) trend = "falling";
  }

  digitalWrite(LED_PIN, level[0] == 'c' ? HIGH : LOW);

  // One JSON line for the bridge script
  Serial.print("{\"level\":\"");
  Serial.print(level);
  Serial.print("\",\"activity\":");
  Serial.print(smoothed);
  Serial.print(",\"trend\":\"");
  Serial.print(trend);
  Serial.println("\"}");

  prevCurrent = current;
  prevSmoothed = smoothed;
}
