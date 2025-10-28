import { Injectable } from '@nestjs/common';
import { Message, PubSub } from '@google-cloud/pubsub';
import * as avro from 'avsc';
import { MessageType } from './pubsub-client.enum';
import * as process from 'node:process';

export type PublishMessage = Message & { type?: MessageType; schema?: string };

@Injectable()
export class PubSubClientService {
  private pubSubClient: PubSub;
  private subscriptions: string[] = process.env.SUBSCRIPTIONS?.split(',') || [];

  constructor() {
    this.pubSubClient = new PubSub();

    this.subscriptions.forEach((subscriptionString) => {
      const [topic, subscription] = subscriptionString.split(':');
      this.createSubscription(topic, subscription);
    });
  }

  async createSubscription(
    topicName: string,
    subscriptionName: string,
  ): Promise<{ message: string }> {
    try {
      const topic = this.pubSubClient.topic(topicName);
      let [exists] = await topic.exists();

      if (!exists) {
        await topic.create();
      }

      [exists] = await topic.subscription(subscriptionName).exists();

      if (!exists) {
        await topic.subscription(subscriptionName).create();
        console.log(`Subscription created: ${subscriptionName}`);

        return { message: 'Subscription created' };
      } else {
        console.log(`Subscription already exists: ${subscriptionName}`);

        return { message: 'Subscription already exists' };
      }
    } catch (e) {
      console.error(`Error creating subscription: ${e.toString()}`, {
        topicName,
        subscriptionName,
      });
      throw e;
    }
  }

  async publishMessage(
    topicName: string,
    message: PublishMessage,
  ): Promise<{ message: string }> {
    try {
      let data: Buffer;
      const topic = this.pubSubClient.topic(topicName);
      const [exists] = await topic.exists();

      if (!exists) {
        await topic.create();
      }

      if (message.type === MessageType.AVRO) {
        data = this.createAvroData(message.data, message.schema);
      } else {
        data = this.createJsonData(message.data);
      }

      await topic.publishMessage({
        data,
        attributes: message.attributes,
        orderingKey: message.orderingKey,
      });
      console.log(`Message published to topic ${topicName}`);

      return { message: `Message published to topic ${topicName}` };
    } catch (e) {
      console.error(`Error publishing message: ${e.toString()}`, {
        topicName,
        message,
      });
      throw e;
    }
  }

  private createJsonData(data) {
    return Buffer.from(JSON.stringify(data));
  }

  private createAvroData(data, schema: string): Buffer {
    if (!schema) {
      throw new Error('Schema is required for Avro message');
    }

    const type = avro.parse(schema);
    return type.toBuffer(data);
  }
}
