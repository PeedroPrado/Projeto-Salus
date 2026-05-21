// ======================================
// BIBLIOTECAS
// ======================================

#include <WiFi.h>

#include <PubSubClient.h>

#include <ArduinoJson.h>

#include <Stepper.h>

#include <ESP32Servo.h>

#include <Wire.h>

#include <LiquidCrystal_I2C.h>

// ======================================
// WIFI
// ======================================

const char* ssid = "LENIN&MARX";

const char* password = "anabrava";

// ======================================
// MQTT
// ======================================

const char* mqttServer =
  "broker.hivemq.com";

const int mqttPort = 1883;

const char* topicoEventos =
  "fatec/salus/capydev/eventos";

const char* topicoComandos =
  "fatec/salus/capydev/comandos";

// ======================================
// LEDS
// ======================================

const int ledVermelho = 19;

const int ledVerde = 5;

// ======================================
// BUZZER
// ======================================

const int buzzerPin = 23;

// ======================================
// SENSOR IR GAVETA
// ======================================

const int sensorGaveta = 13;

// ======================================
// MOTOR STEPPER
// ======================================

const int stepsPerRevolution = 2048;

// ULN2003

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

LiquidCrystal_I2C lcd(
  0x27,
  16,
  2
);

// ======================================
// SERVO SG90
// ======================================

Servo servoPorta;

const int pinoServo = 18;

// ======================================
// VARIÁVEIS GLOBAIS
// ======================================

String nomeMedicamento = "";

int medicamentoId = 0;

// ======================================
// OBJETOS MQTT
// ======================================

WiFiClient espClient;

PubSubClient client(espClient);

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
// TOCA BUZZER
// ======================================

void tocarBuzzer(
  int tempo
) {

  digitalWrite(
    buzzerPin,
    HIGH
  );

  delay(tempo);

  digitalWrite(
    buzzerPin,
    LOW
  );

}

// ======================================
// CONECTA WIFI
// ======================================

void conectarWiFi() {

  Serial.println(
    "Conectando WiFi..."
  );

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Conectando");

  lcd.setCursor(0, 1);

  lcd.print("WiFi...");

  WiFi.begin(
    ssid,
    password
  );

  while (
    WiFi.status() != WL_CONNECTED
  ) {

    delay(500);

    Serial.print(".");

  }

  Serial.println("");

  Serial.println(
    "WiFi conectado"
  );

  Serial.println(
    WiFi.localIP()
  );

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("WiFi OK");

  delay(2000);

}

// ======================================
// CONECTA MQTT
// ======================================

void conectarMQTT() {

  while (!client.connected()) {

    Serial.println(
      "Conectando MQTT..."
    );

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Conectando");

    lcd.setCursor(0, 1);

    lcd.print("MQTT...");

    String clientId =
      "ESP32-SALUS-";

    clientId +=
      String(random(0xffff), HEX);

    if (
      client.connect(
        clientId.c_str()
      )
    ) {

      Serial.println(
        "MQTT conectado"
      );

      lcd.clear();

      lcd.setCursor(0, 0);

      lcd.print("MQTT OK");

      // ======================================
      // ESCUTA COMANDOS
      // ======================================

      client.subscribe(
        topicoComandos
      );

      delay(2000);

    } else {

      Serial.print(
        "Erro MQTT: "
      );

      Serial.println(
        client.state()
      );

      delay(2000);

    }

  }

}

// ======================================
// ENVIA EVENTO MQTT
// ======================================

void enviarEvento(
  String status
) {

  DynamicJsonDocument doc(1024);

  doc["medicamento_id"] =
    medicamentoId;

  doc["nome"] =
    nomeMedicamento;

  doc["status"] =
    status;

  String mensagem;

  serializeJson(
    doc,
    mensagem
  );

  client.publish(
    topicoEventos,
    mensagem.c_str()
  );

  Serial.println(
    "Evento enviado:"
  );

  Serial.println(
    mensagem
  );

}

// ======================================
// GIRA CARROSSEL
// ======================================

void avancarDispenser() {

  Serial.println(
    "Girando carrossel..."
  );

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Girando");

  lcd.setCursor(0, 1);

  lcd.print("carrossel");

  // ======================================
  // 1 POSIÇÃO
  // ======================================

  motor.step(256);

  delay(300);

  desligarMotor();

}

// ======================================
// ABRE COMPORTA
// ======================================

void abrirComporta() {

  Serial.println(
    "Abrindo comporta..."
  );

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
  // TEMPO QUEDA
  // ======================================

  delay(2000);

  // ======================================
  // FECHA SERVO
  // ======================================

  servoPorta.write(0);

  delay(500);

}

// ======================================
// AGUARDA REMÉDIO
// ======================================

bool aguardarRemedio() {

  Serial.println(
    "Aguardando remedio..."
  );

  unsigned long tempoInicial =
    millis();

  while (
    millis() - tempoInicial
    < 10000
  ) {

    client.loop();

    // ======================================
    // REMÉDIO DETECTADO
    // ======================================

    if (
      digitalRead(sensorGaveta)
      == LOW
    ) {

      return true;

    }

  }

  return false;

}

// ======================================
// AGUARDA RETIRADA
// ======================================

bool aguardarRetirada() {

  Serial.println(
    "Aguardando retirada..."
  );

  unsigned long tempoInicial =
    millis();

  while (
    millis() - tempoInicial
    < 300000
  ) {

    client.loop();

    // ======================================
    // REMÉDIO RETIRADO
    // ======================================

    if (
      digitalRead(sensorGaveta)
      == HIGH
    ) {

      return true;

    }

  }

  return false;

}

// ======================================
// PROCESSA ENTREGA
// ======================================

void processarEntrega() {

  // ======================================
  // GIRA CARROSSEL
  // ======================================

  avancarDispenser();

  // ======================================
  // ABRE COMPORTA
  // ======================================

  abrirComporta();

  // ======================================
  // VERIFICA GAVETA
  // ======================================

  bool remedioDisponivel =
    aguardarRemedio();

  // ======================================
  // FALHA ENTREGA
  // ======================================

  if (!remedioDisponivel) {

    Serial.println(
      "Falha ao entregar"
    );

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Falha");

    lcd.setCursor(0, 1);

    lcd.print("Entrega");

    tocarBuzzer(3000);

    enviarEvento(
      "falha_entrega"
    );

    return;

  }

  // ======================================
  // REMÉDIO DISPONÍVEL
  // ======================================

  Serial.println(
    "Remedio disponivel"
  );

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Retire o");

  lcd.setCursor(0, 1);

  lcd.print("remedio");

  digitalWrite(
    ledVermelho,
    HIGH
  );

  tocarBuzzer(1000);

  enviarEvento(
    "disponivel"
  );

  // ======================================
  // AGUARDA RETIRADA
  // ======================================

  bool retirado =
    aguardarRetirada();

  digitalWrite(
    ledVermelho,
    LOW
  );

  // ======================================
  // RETIRADO
  // ======================================

  if (retirado) {

    Serial.println(
      "Remedio retirado"
    );

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Remedio");

    lcd.setCursor(0, 1);

    lcd.print("retirado");

    digitalWrite(
      ledVerde,
      HIGH
    );

    tocarBuzzer(300);

    enviarEvento(
      "retirado"
    );

    delay(3000);

    digitalWrite(
      ledVerde,
      LOW
    );

  } else {

    // ======================================
    // NÃO RETIRADO
    // ======================================

    Serial.println(
      "Remedio nao retirado"
    );

    lcd.clear();

    lcd.setCursor(0, 0);

    lcd.print("Nao");

    lcd.setCursor(0, 1);

    lcd.print("retirado");

    tocarBuzzer(5000);

    enviarEvento(
      "nao_retirado"
    );

    delay(3000);

  }

  // ======================================
  // TELA PADRÃO
  // ======================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Projeto Salus");

  lcd.setCursor(0, 1);

  lcd.print("Aguardando");

}

// ======================================
// RECEBE COMANDOS MQTT
// ======================================

void callback(
  char* topic,
  byte* payload,
  unsigned int length
) {

  String mensagem = "";

  for (
    int i = 0;
    i < length;
    i++
  ) {

    mensagem +=
      (char) payload[i];

  }

  Serial.println(
    "Mensagem recebida:"
  );

  Serial.println(
    mensagem
  );

  // ======================================
  // PROCESSA JSON
  // ======================================

  DynamicJsonDocument doc(1024);

  DeserializationError erro =
    deserializeJson(
      doc,
      mensagem
    );

  if (erro) {

    Serial.println(
      "Erro JSON"
    );

    return;

  }

  medicamentoId =
    doc["id"];

  nomeMedicamento =
    doc["nome"].as<String>();

  // ======================================
  // LOGS
  // ======================================

  Serial.println(
    "Processando..."
  );

  Serial.print(
    "Medicamento: "
  );

  Serial.println(
    nomeMedicamento
  );

  // ======================================
  // PROCESSA ENTREGA
  // ======================================

  processarEntrega();

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
  // LEDS
  // ======================================

  pinMode(
    ledVermelho,
    OUTPUT
  );

  pinMode(
    ledVerde,
    OUTPUT
  );

  digitalWrite(
    ledVermelho,
    LOW
  );

  digitalWrite(
    ledVerde,
    LOW
  );

  // ======================================
  // BUZZER
  // ======================================

  pinMode(
    buzzerPin,
    OUTPUT
  );

  digitalWrite(
    buzzerPin,
    LOW
  );

  // ======================================
  // SENSOR IR
  // ======================================

  pinMode(
    sensorGaveta,
    INPUT
  );

  // ======================================
  // MOTOR
  // ======================================

  motor.setSpeed(5);

  // ======================================
  // SERVO
  // ======================================

  servoPorta.attach(
    pinoServo
  );

  servoPorta.write(0);

  delay(1000);

  // ======================================
  // WIFI
  // ======================================

  conectarWiFi();

  // ======================================
  // MQTT
  // ======================================

  client.setServer(
    mqttServer,
    mqttPort
  );

  client.setCallback(
    callback
  );

  // ======================================
  // TELA INICIAL
  // ======================================

  lcd.clear();

  lcd.setCursor(0, 0);

  lcd.print("Sistema pronto");

  lcd.setCursor(0, 1);

  lcd.print("Aguardando");

}

// ======================================
// LOOP PRINCIPAL
// ======================================

void loop() {

  if (!client.connected()) {

    conectarMQTT();

  }

  client.loop();

}
