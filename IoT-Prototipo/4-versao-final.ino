// ======================================
// BIBLIOTECAS
// ======================================

#include <WiFi.h>

#include <PubSubClient.h>

#include <ArduinoJson.h>

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
// PINOS
// ======================================

const int ledPin = 2;

const int motorPin = 5;

const int sensorPin = 18;

// ======================================
// VARIÁVEIS GLOBAIS
// ======================================

int compartimentoDestino = 0;

String nomeMedicamento = "";

int medicamentoId = 0;

// ======================================
// OBJETOS
// ======================================

WiFiClient espClient;

PubSubClient client(espClient);

// ======================================
// CONECTA WIFI
// ======================================

void conectarWiFi() {

  Serial.println(
    "Conectando WiFi..."
  );

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

}

// ======================================
// CONECTA MQTT
// ======================================

void conectarMQTT() {

  while (!client.connected()) {

    Serial.println(
      "Conectando MQTT..."
    );

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

      // ======================================
      // ESCUTA COMANDOS
      // ======================================

      client.subscribe(
        topicoComandos
      );

      Serial.println(
        "Topico de comandos conectado"
      );

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

  Serial.println(mensagem);

  // ======================================
  // PROCESSA JSON
  // ======================================

  DynamicJsonDocument doc(1024);

  deserializeJson(
    doc,
    mensagem
  );

  medicamentoId =
    doc["id"];

  compartimentoDestino =
    doc["compartimento"];

  nomeMedicamento =
    doc["nome"].as<String>();

  // ======================================
  // LOGS
  // ======================================

  Serial.println(
    "Processando medicamento..."
  );

  Serial.print(
    "ID: "
  );

  Serial.println(
    medicamentoId
  );

  Serial.print(
    "Medicamento: "
  );

  Serial.println(
    nomeMedicamento
  );

  Serial.print(
    "Compartimento: "
  );

  Serial.println(
    compartimentoDestino
  );

  // ======================================
  // EXECUTA DISPENSER
  // ======================================

  avancarDispenser();

  liberarRemedio();

  // ======================================
  // ENVIA EVENTO MQTT
  // ======================================

  enviarEvento(
    "medicamento_liberado"
  );

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

  doc["compartimento"] =
    compartimentoDestino;

  doc["status"] = status;

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

  Serial.println(mensagem);

}

// ======================================
// AVANÇA DISPENSER
// ======================================

void avancarDispenser() {

  Serial.println(
    "Movendo dispenser..."
  );

}

// ======================================
// LIBERA REMÉDIO
// ======================================

void liberarRemedio() {

  Serial.println(
    "Liberando remédio..."
  );

}

// ======================================
// SETUP
// ======================================

void setup() {

  Serial.begin(115200);

  pinMode(
    ledPin,
    OUTPUT
  );

  conectarWiFi();

  client.setServer(
    mqttServer,
    mqttPort
  );

  client.setCallback(
    callback
  );

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
