import { Module } from '@nestjs/common';
import { PubSubClientService } from './pubsub-client.service';

@Module({
  providers: [PubSubClientService],
  exports: [PubSubClientService],
})
export class PubSubClientModule {}
