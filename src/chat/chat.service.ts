import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  private messages: { user: string, message: string }[] = [];

  getAllMessages() {
    return this.messages;
  }

  createMessage(user: string, message: string) {
    const newMessage = { user, message };
    this.messages.push(newMessage);
    return newMessage;
  }
}
