import ip from 'ip';
import { Kafka, logLevel } from 'kafkajs';
import { fastify } from 'fastify';
import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/users-mongo');

import User from './User.js';

const server = fastify({ logger: true });

const host = ip.address();
const kafka = new Kafka({
  logLevel: logLevel.DEBUG,
  brokers: [`${host}:9092`],
  clientId: 'my-app',
})

const consumer = kafka.consumer({ groupId: 'test-group' })
await consumer.connect()
await consumer.subscribe({ topic: 'create-user', fromBeginning: true })
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const messageLikeString = message.value.toString();
    const messageLikeObj = JSON.parse(messageLikeString);
    const user = await User.create({
      ...messageLikeObj.user,
      address: messageLikeObj.address,
    });
    console.log({
      body: user,
    })
  },
})

await server.listen({ port: 3030 });
