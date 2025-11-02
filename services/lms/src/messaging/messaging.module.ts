import { Module, Global } from '@nestjs/common';
import { MessageBrokerService } from './message-broker.service';

@Global()
@Module({
  providers: [MessageBrokerService],
  exports: [MessageBrokerService],
})
export class MessagingModule {}
