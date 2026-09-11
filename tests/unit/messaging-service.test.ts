import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initiateQuoteRequest, sendMessage } from '../../src/features/messaging/service';
import { prisma } from '../../src/lib/prisma';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    conversation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}));

describe('Messagerie et Demande de Devis B2B', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit créer une conversation et un premier message initial structuré', async () => {
    (prisma.conversation.create as any).mockResolvedValue({
      id: 'conv-1',
      buyerId: 'user-buyer',
      supplierId: 'comp-supp',
      subject: 'Demande de devis : 500 unités',
      messages: [
        {
          id: 'msg-1',
          content: '[Quantité souhaitée : 500]\n\nBonjour, quel est le délai pour Paris ?',
        },
      ],
    });

    const res = await initiateQuoteRequest({
      buyerId: 'user-buyer',
      supplierId: 'comp-supp',
      productId: 'prod-1',
      quantity: 500,
      messageContent: 'Bonjour, quel est le délai pour Paris ?',
    });

    expect(res.id).toBe('conv-1');
    expect(prisma.conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          buyerId: 'user-buyer',
          supplierId: 'comp-supp',
          productId: 'prod-1',
          subject: 'Demande de devis : 500 unités',
        }),
      })
    );
  });

  it('doit permettre l\'envoi d\'un message de réponse', async () => {
    (prisma.message.create as any).mockResolvedValue({
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-supplier',
      content: 'Bonjour, nous pouvons livrer sous 10 jours.',
    });

    const msg = await sendMessage({
      conversationId: 'conv-1',
      senderId: 'user-supplier',
      content: 'Bonjour, nous pouvons livrer sous 10 jours.',
    });

    expect(msg.id).toBe('msg-2');
    expect(prisma.message.create).toHaveBeenCalled();
  });
});
