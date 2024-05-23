import { Body, Controller, Param, Post } from '@nestjs/common';
import { PubSubClientService } from '../pubsub-client/pubsub-client.service';
import { Message } from '@google-cloud/pubsub';

@Controller()
export class ProxyController {
  constructor(private pubSubClient: PubSubClientService) {}

  @Post(':topic')
  async proxyActivity(@Param('topic') topic: string, @Body() body: Message) {
    return this.pubSubClient.publishMessage(topic, body);
  }

  @Post(':topic/:subscription')
  async createSubscription(
    @Param('topic') topic: string,
    @Param('subscription') subscription: string,
  ) {
    return this.pubSubClient.createSubscription(topic, subscription);
  }
}
