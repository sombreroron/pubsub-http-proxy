import { Injectable } from '@nestjs/common';
import { Message, PubSub } from '@google-cloud/pubsub';

@Injectable()
export class PubSubClientService {
  private pubSubClient: PubSub;

  constructor() {
    this.pubSubClient = new PubSub();
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
    message: Message,
  ): Promise<{ message: string }> {
    try {
      const topic = this.pubSubClient.topic(topicName);
      const [exists] = await topic.exists();

      if (!exists) {
        await topic.create();
      }

      await topic.publishMessage({
        attributes: message.attributes,
        data: Buffer.from(JSON.stringify(message.data)),
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
}
