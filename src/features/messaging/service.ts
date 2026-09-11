import { prisma } from '../../lib/prisma';
import {
  QuoteRequestInput,
  SendMessageInput,
  quoteRequestSchema,
  sendMessageSchema,
} from './validation';

export async function initiateQuoteRequest(input: QuoteRequestInput) {
  const data = quoteRequestSchema.parse(input);
  const subject = `Demande de devis : ${data.quantity} unités`;

  return await prisma.conversation.create({
    data: {
      buyerId: data.buyerId,
      supplierId: data.supplierId,
      productId: data.productId,
      subject,
      messages: {
        create: {
          senderId: data.buyerId,
          content: `[Quantité souhaitée : ${data.quantity}]\n\n${data.messageContent}`,
        },
      },
    },
    include: {
      messages: true,
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}

export async function sendMessage(input: SendMessageInput) {
  const data = sendMessageSchema.parse(input);

  const message = await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
    },
  });

  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export async function getConversation(conversationId: string) {
  return await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      supplier: {
        select: {
          id: true,
          companyName: true,
          country: true,
          verificationStatus: true,
          logoUrl: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          priceMin: true,
          priceMax: true,
          currency: true,
          moq: true,
          unit: true,
        },
      },
    },
  });
}

export async function getUserConversations(userId: string) {
  return await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: userId },
        { supplier: { userId: userId } },
      ],
    },
    include: {
      supplier: {
        select: {
          companyName: true,
          verificationStatus: true,
        },
      },
      product: {
        select: {
          title: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}
