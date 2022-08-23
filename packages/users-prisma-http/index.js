import 'dotenv/config';
import ip from 'ip';
import { Kafka, CompressionTypes, logLevel } from 'kafkajs';
import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = fastify({ logger: true })
const host = ip.address();
const kafka = new Kafka({
  logLevel: logLevel.DEBUG,
  brokers: [`${host}:9092`],
  clientId: 'my-app',
})

app.post('/users', async (request, reply) => {
  const address = await prisma.address.create({
    data: request.body.address,
  });

  await prisma.user.create({
    data: {
      ...request.body.user,
      addressId: address.id,
    },
  });
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic: 'create-user',
    compression: CompressionTypes.GZIP,
    messages: [
      { value: JSON.stringify(request.body) },
    ],
  })
  await producer.disconnect();
  return { ok: true };
});



app.listen({ port: 3333 });