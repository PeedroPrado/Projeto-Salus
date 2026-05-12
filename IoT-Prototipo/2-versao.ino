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

// LEDS

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

// Variável que recebe o id do Medicamento

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
// CONTROLE
// ======================================
bool liberou = false;


// BUSCA O REMEDIO E SE NAO HOUVER PARA O MOTOR
int tentativas = 0;

// HORARIOS FALSOS DE 30 SEGUNDOS

unsigned long ultimoHorario = 0;

const unsigned long intervalo = 30000;


int compartimentoAtual = 0;

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

    String url = "http://192.168.15.3:3000/iot/evento";

    http.begin(url);

    http.addHeader("Content-Type", "application/json");

    String json = "{";

json += "\"medicamento_id\":" + String(medicamentoId) + ",";

json += "\"compartimento\":" + String(compartimentoDestino) + ",";

json += "\"status\":\"" + status + "\"";

json += "}";

    int resposta = http.POST(json);

    Serial.print("Resposta servidor: ");

    delay(100);

    Serial.println(resposta);

    lcd.clear();

    lcd.setCursor(0, 0);

    if (resposta == 200) {

      lcd.print("Evento enviado");

    } else {

      lcd.print("Erro HTTP");

    }

    delay(1000);

    http.end();

  }

}

bool buscarMedicamento() {

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.begin("http://192.168.15.3:3000/iot/proximo-medicamento");

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

      http.end();

      return false;

    }

  }

  return false;

}

void irParaCompartimento(int compartimento) {

  int passos = (compartimento - 1) * 256;

  Serial.print("Indo para compartimento: ");

  Serial.println(compartimento);

  motor.step(passos);

  desligarMotor();

}

// ======================================
// LIBERAR REMEDIO
// ======================================

void liberarRemedio() {

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Liberando");

  lcd.setCursor(0, 1);

  lcd.print(nomeMedicamento);

  // resto da função...



  // abre servo
  servoPorta.write(90);

  delay(1000);

  // fecha servo
  servoPorta.write(0);

  delay(1000);

  // ======================================
  // AGUARDA BANDEJA
  // ======================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Aguardando");

  lcd.setCursor(0, 1);

  lcd.print("bandeja");

  while (digitalRead(sensorBandeja) == HIGH) {

    delay(10);

  }

  // ======================================
  // AGUARDA RETIRADA
  // ======================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Retire o");

  lcd.setCursor(0, 1);

  lcd.print("remedio");

  digitalWrite(ledVermelho, HIGH);

  while (digitalRead(sensorBandeja) == LOW) {

    delay(10);

  }

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

}


// ======================================
// SETUP
// ======================================
void setup() {

  Serial.begin(115200);

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

  buscarMedicamento();

  Serial.println(WiFi.localIP());

  // LEDS

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

// HORARIO - ESPERA 30 SEGUNDOS
if (millis() - ultimoHorario >= intervalo) {

  if (buscarMedicamento()) {

    irParaCompartimento(compartimentoDestino);

    liberarRemedio();

    delay(5000);

  }

  ultimoHorario = millis();

}

 // ======================================
// PROCURA REMEDIO
// ======================================
if (
  digitalRead(sensorRemedio) == HIGH &&
  liberou == false
) {

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Procurando");

  motor.step(8);

  tentativas++;

  // ======================================
  // 1 VOLTA COMPLETA
  // ======================================
  if (tentativas >= 256) {

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Sem remedio");

    desligarMotor();

    // ======================================
    // STANDBY
    // ======================================
    while (digitalRead(sensorRemedio) == HIGH) {

      delay(200);

    }

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Remedio");

    lcd.setCursor(0, 1);

    lcd.print("detectado");

    tentativas = 0;

  }

}

  // ======================================
  // ENCONTROU
  // ======================================
  else if (
    digitalRead(sensorRemedio) == LOW &&
    liberou == false
  ) {

    liberou = true;

    tentativas = 0;

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Remedio");

    lcd.setCursor(0, 1);

    lcd.print("encontrado");

    desligarMotor();

    delay(1000);

    // ======================================
    // ABRE SERVO
    // ======================================
    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Abrindo");

    lcd.setCursor(0, 1);

    lcd.print("compartimento");

    servoPorta.write(90);

    delay(1000);

    // ======================================
    // FECHA SERVO
    // ======================================
    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Fechando");

    servoPorta.write(0);

    delay(1000);

    // ======================================
    // AGUARDA BANDEJA
    // ======================================
    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Aguardando");

    lcd.setCursor(0, 1);

    lcd.print("bandeja");

    while (digitalRead(sensorBandeja) == HIGH) {

      delay(10);

    }

    // ======================================
    // REMEDIO DETECTADO
    // ======================================
    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Remedio");

    lcd.setCursor(0, 1);

    lcd.print("detectado");

    delay(1000);

    // ======================================
    // AGUARDA RETIRADA
    // ======================================
    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Retire o");

    digitalWrite(ledVermelho, HIGH);

    lcd.setCursor(0, 1);

    lcd.print("remedio");

    while (digitalRead(sensorBandeja) == LOW) {

  delay(10);

}

enviarEvento("retirado");

    digitalWrite(ledVermelho, LOW);


    // ======================================
    // RETIRADO
    // ======================================
    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Remedio");

    lcd.setCursor(0, 1);

    lcd.print("retirado");

    digitalWrite(ledVerde, HIGH);

    enviarEvento("retirado");

    delay(1000);

    digitalWrite(ledVerde, LOW);

    // ======================================
    // PROXIMO
    // ======================================
    lcd.clear();

lcd.setCursor(0, 0);

lcd.print("Aguardando");

lcd.setCursor(0, 1);

lcd.print("horario");

ultimoHorario = millis();

while (millis() - ultimoHorario < intervalo) {

  delay(100);

}

lcd.clear();

lcd.setCursor(0, 0);

lcd.print("Novo horario");

delay(1000);

liberou = false;
  }

}
