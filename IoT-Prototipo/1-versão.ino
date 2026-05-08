#include <Wire.h>                  // Comunicação I2C
#include <LiquidCrystal_I2C.h>     // Biblioteca do LCD I2C
#include <ESP32Servo.h>            // Biblioteca do servo motor

// =========================
// CONFIGURAÇÃO DO LCD
// =========================

// Endereço I2C do LCD
// Se não funcionar, tente trocar 0x27 por 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

// =========================
// CONFIGURAÇÃO DO SERVO
// =========================

// Cria objeto do servo
Servo servo;

// =========================
// DEFINIÇÃO DOS PINOS
// =========================

#define BUZZER 23       // Buzzer conectado no GPIO 23
#define LED 19          // LED conectado no GPIO 19
#define SERVO_PIN 18    // Servo conectado no GPIO 18

// =========================
// SETUP
// =========================

void setup() {

  // Inicia comunicação serial
  Serial.begin(115200);

  // Define os pinos I2C do ESP32
  // SDA = 21
  // SCL = 22
  Wire.begin(21, 22);

  // Conecta o servo ao GPIO definido
  servo.attach(SERVO_PIN);

  // Compartimento começa FECHADO
  // 90 graus = fechado
  servo.write(90);

  // Configura buzzer e LED como saída
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);

  // Inicializa LCD
  lcd.init();

  // Liga iluminação do LCD
  lcd.backlight();

  // =========================
  // TELA INICIAL
  // =========================

  lcd.setCursor(0,0);
  lcd.print("Projeto Salus");

  lcd.setCursor(0,1);
  lcd.print("Equipe CapyDev");

  // Espera 2 segundos
  delay(2000);

  // Limpa LCD
  lcd.clear();

  // Garante novamente que inicia fechado
  servo.write(90);
}

// =========================
// LOOP PRINCIPAL
// =========================

void loop() {

  // =========================
  // ALERTA VISUAL
  // =========================

  // Liga LED
  digitalWrite(LED, HIGH);

  // =========================
  // LCD - MENSAGEM
  // =========================

  lcd.setCursor(0,0);
  lcd.print("Hora do");

  lcd.setCursor(0,1);
  lcd.print("remedio");

  // =========================
  // ALERTA SONORO
  // =========================

  // Bip suave
  for(int i = 0; i < 10; i++) {

    // Liga buzzer
    digitalWrite(BUZZER, HIGH);

    // Espera 2ms
    delay(2);

    // Desliga buzzer
    digitalWrite(BUZZER, LOW);

    // Espera 15ms
    delay(15);
  }

  // =========================
  // ABRE COMPORTA
  // =========================

  // 0 graus = aberto
  servo.write(0);

  // Tempo para o remédio cair
  delay(6000);

  // =========================
  // FECHA COMPORTA
  // =========================

  // 90 graus = fechado
  servo.write(90);

  // =========================
  // LCD - STATUS
  // =========================

  lcd.clear();

  lcd.setCursor(0,0);
  lcd.print("Compartimento");

  lcd.setCursor(0,1);
  lcd.print("Fechado");

  // =========================
  // DESLIGA LED
  // =========================

  digitalWrite(LED, LOW);

  // Espera antes de repetir
  delay(5000);

  // Limpa LCD
  lcd.clear();
}
