import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PubSubClientService } from '../pubsub-client/pubsub-client.service';
import { Message } from '@google-cloud/pubsub';
import { MessageType } from '../pubsub-client/pubsub-client.enum';

@Controller()
export class ProxyController {
  constructor(private pubSubClient: PubSubClientService) {}

  @Post(':topic')
  async proxyActivity(
    @Param('topic') topic: string,
    @Body() body: Message & { type: MessageType },
  ) {
    try {
      return await this.pubSubClient.publishMessage(topic, body);
    } catch (e) {
      throw new HttpException(e.toString(), HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':topic/:subscription')
  async createSubscription(
    @Param('topic') topic: string,
    @Param('subscription') subscription: string,
  ) {
    try {
      return this.pubSubClient.createSubscription(topic, subscription);
    } catch (e) {
      throw new HttpException(e.toString(), HttpStatus.BAD_REQUEST);
    }
  }
}
