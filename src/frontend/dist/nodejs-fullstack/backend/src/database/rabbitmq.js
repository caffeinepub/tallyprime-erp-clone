const amqp = require('amqplib');

let connection = null;
let channel = null;
let connected = false;

const QUEUES = {
  EMAIL: process.env.RABBITMQ_QUEUE_EMAIL || 'hisabkitab_email',
  WHATSAPP: process.env.RABBITMQ_QUEUE_WHATSAPP || 'hisabkitab_whatsapp',
  REPORTS: process.env.RABBITMQ_QUEUE_REPORTS || 'hisabkitab_reports',
  SYNC: process.env.RABBITMQ_QUEUE_SYNC || 'hisabkitab_sync'
};

async function initRabbitMQ() {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  connection = await amqp.connect(url);
  channel = await connection.createChannel();

  // Assert all queues as durable
  for (const q of Object.values(QUEUES)) {
    await channel.assertQueue(q, { durable: true });
  }
  connected = true;
  return channel;
}

function getChannel() {
  return channel;
}

async function publishToQueue(queueName, message) {
  if (!connected || !channel) {
    console.warn('RabbitMQ not connected, message dropped:', queueName);
    return false;
  }
  try {
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
    return true;
  } catch (e) {
    console.error('RabbitMQ publish error:', e.message);
    return false;
  }
}

async function consumeQueue(queueName, handler) {
  if (!connected || !channel) return;
  await channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const content = JSON.parse(msg.content.toString());
      await handler(content);
      channel.ack(msg);
    } catch (e) {
      console.error('Queue handler error:', e.message);
      channel.nack(msg, false, false);
    }
  });
}

module.exports = { initRabbitMQ, getChannel, publishToQueue, consumeQueue, QUEUES };
