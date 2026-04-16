import { Router } from 'express';

const router = Router();

router.get('/faqs', (_req, res) => {
  res.json({
    faqs: [
      {
        id: 1,
        title: 'Where is my order?',
        body: 'Track your order from Your Orders. You can view shipment progress and delivery estimates there.'
      },
      {
        id: 2,
        title: 'How do returns work?',
        body: 'Most items are eligible for return/replacement within 7 days from delivery, based on product policy.'
      },
      {
        id: 3,
        title: 'How do I contact support?',
        body: 'Use the in-app help options on this page or email support@amazon-clone.in for assistance.'
      },
      {
        id: 4,
        title: 'Why did my card payment fail?',
        body: 'Card payments can fail due to bank declines, OTP issues, expired cards, or incorrect details. Please retry with valid details.'
      },
      {
        id: 5,
        title: 'What benefits do Prime members get?',
        body: 'Prime members get free delivery, priority support, and exclusive deals in this clone implementation.'
      }
    ]
  });
});

export default router;
