import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { PubSubClientModule } from '../pubsub-client/pubsub-client.module';

@Module({
  imports: [PubSubClientModule],
  controllers: [ProxyController],
})
export class ProxyModule {}
