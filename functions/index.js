const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK
admin.initializeApp();

// Initialize Stripe with Secret Key from environment config
// Usage: firebase functions:config:set stripe.secret="sk_test_..."
const stripe = require('stripe')(functions.config().stripe.secret);

/**
 * Creates a Payment Intent for Snooze Tax
 * 
 * Request Body:
 * - amount: number (in dollars, e.g., 0.25)
 * - currency: string (default: 'usd')
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    // 1. Validation
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { amount } = data;
    const currency = data.currency || 'usd';

    if (!amount || isNaN(amount) || amount < 0.25) {
        throw new functions.https.HttpsError('invalid-argument', 'Minimum amount is $0.25');
    }

    // Convert to cents (integer)
    const amountInCents = Math.round(amount * 100);

    try {
        // 2. Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: context.auth.uid,
                email: context.auth.token.email || 'unknown'
            }
        });

        // 3. Return Client Secret
        return {
            clientSecret: paymentIntent.client_secret,
        };

    } catch (error) {
        console.error('Stripe Error:', error);
        throw new functions.https.HttpsError('internal', 'Unable to create payment intent');
    }
});
