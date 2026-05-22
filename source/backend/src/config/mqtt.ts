import mqtt from 'mqtt';

const client = mqtt.connect(
  'wss://broker.hivemq.com:8884/mqtt'
);

client.on('connect', () => {

  console.log(
    '✅ Conectado ao broker MQTT'
  );

  client.subscribe(
    'fatec/salus/capydev/eventos'
  );

});

client.on('message', (_, message) => {

  console.log(
    '📩 Mensagem recebida:'
  );

  console.log(
    message.toString()
  );

});

// ======================================
// ENVIA COMANDO MQTT
// ======================================

export function enviarComando(
  payload: any
) {

  client.publish(
    'fatec/salus/capydev/comandos',
    JSON.stringify(payload)
  );

  console.log(
    '📤 Comando enviado'
  );

}

export default client;