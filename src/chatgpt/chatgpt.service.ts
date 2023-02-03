import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Cron } from '@nestjs/schedule';
import { AppConfig, ChatgptConfig } from 'src/configs/config.interface';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ChatgptService {
  logger = new Logger('ChatgptService');
  enableMessageRecord = false;
  apiKey: string;
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService
  ) {
    const { enableMessageRecord } =
      this.configService.get<AppConfig>('appConfig');
    this.enableMessageRecord = enableMessageRecord;
    const { apiKey } = this.configService.get<ChatgptConfig>('chatgpt');
    this.apiKey = apiKey;
  }
  async getChatGPT() {
    const { ChatGPTAPI } = await import('chatgpt');
    const chatgpt = new ChatGPTAPI({
      apiKey: this.apiKey,
    });
    return chatgpt;
  }
  // Send Chatgpt Message via ChatgptPoolService
  async sendChatGPTMessage(
    message: string,
    opts?: {
      sessionId?: string;
      tenantId: string;
    }
  ) {
    const email = 'APIKEY';
    const { sessionId, tenantId } = opts;
    const conversation = await this.prismaService.chatGPTConversation.findFirst(
      {
        where: { sessionId, tenantId },
      }
    );
    const chatgpt = await this.getChatGPT();
    // Send Message
    this.logger.debug(`Send message to ${email}: ${message}`);
    try {
      const messageResponse = await chatgpt.sendMessage(message, {
        conversationId: conversation?.conversationId,
        parentMessageId: conversation?.messageId,
      });
      const messageResult = {
        conversationId: messageResponse.id,
        messageId: messageResponse.parentMessageId,
        response: messageResponse.text,
      };
      if (!messageResult) {
        this.logger.error(`Send message to ${email} failed`);
        return {
          conversationId: null,
          messageId: null,
          message: null,
        };
      }
      // Save conversation info
      await this.prismaService.chatGPTConversation.upsert({
        where: { tenantId_sessionId: { sessionId, tenantId } },
        create: {
          sessionId,
          email,
          conversationId: messageResult.conversationId,
          messageId: messageResult.messageId,
          tenantId,
        },
        update: {
          email,
          conversationId: messageResult.conversationId,
          messageId: messageResult.messageId,
        },
      });
      if (this.enableMessageRecord) {
        await this.recordChatGPTMessage({
          message,
          chatGPTResponse: messageResult,
        });
      }
      return messageResult;
    } catch (e) {
      // Update Email status
      await this.chatGPTExceptionHandle({
        email,
        exception: e,
      });
      throw e;
    }
  }
  async sendChatGPTMessageOnetime(message: string) {
    const email = 'APIKEY';
    this.logger.debug(`Send message to ${email}: ${message}`);
    const chatgpt = await this.getChatGPT();
    try {
      const messageResponse = await chatgpt.sendMessage(message);
      const messageResult = {
        conversationId: messageResponse.id,
        messageId: messageResponse.parentMessageId,
        response: messageResponse.text,
      };
      if (!messageResult) {
        this.logger.error(`Send message to ${email} failed`);
        return {
          conversationId: null,
          messageId: null,
          message: null,
        };
      }
      if (this.enableMessageRecord) {
        await this.recordChatGPTMessage({
          message,
          chatGPTResponse: messageResult,
        });
      }
      return messageResult;
    } catch (e) {
      // Update Email status
      await this.chatGPTExceptionHandle({
        email,
        exception: e,
      });
      throw e;
    }
  }
  async recordChatGPTMessage({
    message,
    chatGPTResponse,
  }: {
    message: string;
    chatGPTResponse: {
      response: string;
      conversationId: string;
      messageId: string;
    };
  }) {
    const { response, conversationId, messageId } = chatGPTResponse;
    try {
      await this.prismaService.chatGPTMessageResult.create({
        data: {
          message,
          response,
          conversationId,
          messageId,
        },
      });
    } catch (e) {
      this.logger.error(`Record message failed: ${e}`);
    }
  }
  async resetSession(sessionId: string, tenantId: string) {
    this.logger.debug(`Reset conversation ${sessionId}`);
    const conversation = await this.prismaService.chatGPTConversation.delete({
      where: {
        tenantId_sessionId: { sessionId, tenantId },
      },
    });
    if (!conversation) {
      this.logger.error(`Conversation ${sessionId} not found`);
      return {};
    } else {
      this.logger.debug(`Conversation ${sessionId} deleted`);
      return conversation;
    }
  }
  async chatGPTExceptionHandle({
    exception,
    email,
  }: {
    exception: Error & {
      statusCode: number;
      statusText: string;
    };
    email: string;
  }): Promise<void> {
    switch (true) {
      case exception.message.includes('Only one message at a time.'):
        this.logger.error(`Account ${email} is busy`);
        break;
      case exception.message.includes('1h'):
        this.logger.error(`Account ${email} is overload 1h`);
        break;
      case exception.statusCode === 429:
        // await this.prismaService.chatGPTAccount.update({
        //   where: { email },
        //   data: { status: 'Overload' },
        // });
        this.logger.error(`Account ${email} is busy`);
        break;
      default:
        this.logger.error(
          `Account ${email} is error, ${exception.message} ${exception.statusCode} ${exception.statusText}`
        );
        break;
    }
  }
}
