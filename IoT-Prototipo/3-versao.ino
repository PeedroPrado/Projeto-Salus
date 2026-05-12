#include <WiFi.h>
#include <HTTPClient.h>

#include <Stepper.h>
#include <ESP32Servo.h>

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#include <ArduinoJson.h>

// ======================================
// WIFI
// ======================================
const char* ssid = "TEO e FRED";
const char* password = "casadosgatos";

// ======================================
// LEDS
// ======================================
const int ledVermelho = 19;
const int ledVerde = 5;

// ======================================
// SENSORES
// ======================================
const int sensorRemedio = 4;
const int sensorBandeja = 13;

// ======================================
// BACKEND
// ======================================
int compartimentoDestino = 0;

String nomeMedicamento = "";

int medicamentoId = 0;

// ======================================
// MOTOR
// ======================================
const int stepsPerRevolution = 2048;

const int IN1 = 14;
const int IN2 = 27;
const int IN3 = 26;
const int IN4 = 25;

Stepper motor(
  stepsPerRevolution,
  IN1,
  IN2,
  IN3,
  IN4
);

// ======================================
// LCD
// ======================================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ======================================
// SERVO
// ======================================
Servo servoPorta;

const int pinoServo = 18;

// ======================================
// DESLIGA MOTOR
// ======================================
void desligarMotor() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);

}

// ======================================
// ENVIA EVENTO
// ======================================
void enviarEvento(String status) {

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.setTimeout(5000);

    String url = "http://192.168.15.4:3000/iot/evento";

    http.begin(url);

    http.addHeader("Content-Type", "application/json");

    String json = "{";

    json += "\"medicamento_id\":" + String(medicamentoId) + ",";
    json += "\"compartimento\":" + String(compartimentoDestino) + ",";
    json += "\"status\":\"" + status + "\"";

    json += "}";

    int resposta = http.POST(json);

    Serial.print("Resposta servidor: ");
    Serial.println(resposta);

    Serial.print("HTTP Evento: ");
    Serial.println(resposta);

    http.end();

  }

}

// ======================================
// BUSCA MEDICAMENTO
// ======================================
bool buscarMedicamento() {

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.begin("http://192.168.15.4:3000/iot/proximo-medicamento");

    int httpCode = http.GET();

    if (httpCode == 200) {

      String payload = http.getString();

      Serial.println(payload);

      DynamicJsonDocument doc(1024);

      deserializeJson(doc, payload);

      compartimentoDestino = doc["compartimento"];

      nomeMedicamento = doc["nome"].as<String>();

      medicamentoId = doc["id"];

      Serial.print("Compartimento: ");
      Serial.println(compartimentoDestino);

      Serial.print("Medicamento: ");
      Serial.println(nomeMedicamento);

      http.end();

      return true;

    } else {

      
  Serial.print("Erro HTTP: ");
  Serial.println(httpCode);

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Sem horarios");

  lcd.setCursor(0, 1);

  lcd.print("agendados");

  http.end();

  return false;

}
    }

  }

// ======================================
// AVANCA DISPENSER
// ======================================

void avancarDispenser() {

  Serial.println("Avancando dispenser");

  motor.step(256);

  delay(300);

  desligarMotor();

}

// ======================================
// LIBERAR REMEDIO
// ======================================
void liberarRemedio() {

lcd.clear();

lcd.setCursor(0, 0);

lcd.print("Aguardando");

lcd.setCursor(0, 1);

lcd.print("proximo horario");
  

  // ======================================
  // VERIFICA REMEDIO
  // ======================================

  if (digitalRead(sensorRemedio) == HIGH) {

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Sem remedio");

    digitalWrite(ledVermelho, HIGH);

    enviarEvento("sem_remedio");

    desligarMotor();

    delay(3000);

    digitalWrite(ledVermelho, LOW);

    return;

  }

  // ======================================
  // LIBERANDO
  // ======================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Liberando");

  lcd.setCursor(0, 1);

  lcd.print(nomeMedicamento);

  // ======================================
// ABRE SERVO
// ======================================

servoPorta.write(90);

delay(1000);

// ======================================
// AGUARDA REMEDIO CAIR
// ======================================

delay(3000);

// ======================================
// FECHA SERVO
// ======================================

servoPorta.write(0);

delay(500);
  // ======================================
  // AGUARDA RETIRADA
  // ======================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Retire o");

  lcd.setCursor(0, 1);

  lcd.print("remedio");

  digitalWrite(ledVermelho, HIGH);

  delay(1500);

  digitalWrite(ledVermelho, LOW);

  // ======================================
  // REMEDIO RETIRADO
  // ======================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Remedio");

  lcd.setCursor(0, 1);

  lcd.print("retirado");

  digitalWrite(ledVerde, HIGH);

  enviarEvento("retirado");

  delay(2000);

  digitalWrite(ledVerde, LOW);

  lcd.print("Próximo Remédio");

  lcd.setCursor(0, 1);

  lcd.print("Horário");


}

// ======================================
// SETUP
// ======================================
void setup() {

  Serial.begin(115200);

  Serial.println("BACKEND 192.168.15.4");

  // ======================================
  // LCD
  // ======================================

  lcd.init();

  lcd.backlight();

  lcd.setCursor(0, 0);

  lcd.print("Projeto Salus");

  delay(2000);

  // ======================================
  // WIFI
  // ======================================

  WiFi.mode(WIFI_STA);

  WiFi.disconnect(true, true);

  delay(1000);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Conectando");

    lcd.setCursor(0, 1);

    lcd.print("WiFi...");

  }

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("WiFi conectado");

  delay(2000);

  Serial.println(WiFi.localIP());

  // ======================================
  // LEDS
  // ======================================

  pinMode(ledVermelho, OUTPUT);
  pinMode(ledVerde, OUTPUT);

  digitalWrite(ledVermelho, LOW);
  digitalWrite(ledVerde, LOW);

  // ======================================
  // SENSORES
  // ======================================

  pinMode(sensorRemedio, INPUT);

  pinMode(sensorBandeja, INPUT);

  // ======================================
  // MOTOR
  // ======================================

  motor.setSpeed(5);

  // ======================================
  // SERVO
  // ======================================

  servoPorta.attach(pinoServo);

  servoPorta.write(0);

  delay(1000);

}

// ======================================
// LOOP
// ======================================
void loop() {

  if (buscarMedicamento()) {

    avancarDispenser();

    liberarRemedio();

    delay(60000);

  }
    // ======================================
    // AGUARDA PROXIMA CONSULTA
    // ======================================

    delay(60000);

  }

