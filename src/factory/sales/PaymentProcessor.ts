// src/factory/sales/PaymentProcessor.ts
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import axios from 'axios';
import * as crypto from 'crypto';

export class PaymentProcessor {
    private stripe: Stripe;
    private paypalClient: any;
    private isTestMode: boolean;

    constructor(testMode: boolean = true) {
        this.isTestMode = testMode;

        // Stripe initialization
        this.stripe = new Stripe(
            testMode
                ? process.env.STRIPE_TEST_SECRET_KEY!
                : process.env.STRIPE_LIVE_SECRET_KEY!,
            {
                apiVersion: '2023-10-16',
                maxNetworkRetries: 3
            }
        );

        // PayPal initialization
        const environment = testMode
            ? new paypal.core.SandboxEnvironment(
                process.env.PAYPAL_CLIENT_ID!,
                process.env.PAYPAL_CLIENT_SECRET!
            )
            : new paypal.core.LiveEnvironment(
                process.env.PAYPAL_CLIENT_ID!,
                process.env.PAYPAL_CLIENT_SECRET!
            );

        this.paypalClient = new paypal.core.PayPalHttpClient(environment);
    }

    // STRIPE İŞLEMLERİ
    async createStripeProduct(product: DigitalProduct): Promise<StripeProduct> {
        try {
            // 1. Product oluştur
            const stripeProduct = await this.stripe.products.create({
                name: product.name,
                description: product.description,
                metadata: {
                    productId: product.id,
                    category: product.category,
                    builtBy: 'Optimus Factory'
                }
            });

            // 2. Price oluştur
            const price = await this.stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.round(product.price * 100), // Cent cinsinden
                currency: 'usd',
                recurring: product.recurring ? {
                    interval: 'month'
                } : undefined
            });

            // 3. Checkout session oluştur
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: price.id,
                        quantity: 1
                    }
                ],
                mode: product.recurring ? 'subscription' : 'payment',
                success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.BASE_URL}/cancel`,
                metadata: {
                    productId: product.id,
                    customer_email: 'will_be_provided'
                },
                allow_promotion_codes: true,
                billing_address_collection: 'required'
            });

            return {
                productId: stripeProduct.id,
                priceId: price.id,
                sessionId: session.id,
                url: session.url!,
                status: 'active'
            };

        } catch (error: any) {
            console.error('Stripe product creation failed:', error);
            throw new Error(`Stripe error: ${error.message}`);
        }
    }

    // PAYPAL İŞLEMLERİ
    async createPayPalOrder(
        product: DigitalProduct,
        customerEmail?: string
    ): Promise<PayPalOrder> {
        try {
            const request = new paypal.orders.OrdersCreateRequest();

            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: product.price.toString(),
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: product.price.toString()
                                }
                            }
                        },
                        items: [
                            {
                                name: product.name,
                                description: product.description?.substring(0, 127),
                                quantity: '1',
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: product.price.toString()
                                },
                                category: 'DIGITAL_GOODS'
                            }
                        ]
                    }
                ],
                application_context: {
                    brand_name: 'Optimus Digital Factory',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    return_url: `${process.env.BASE_URL}/paypal-success`,
                    cancel_url: `${process.env.BASE_URL}/paypal-cancel`,
                    shipping_preference: 'NO_SHIPPING'
                },
                payer: customerEmail ? {
                    email_address: customerEmail
                } : undefined
            });

            const response = await this.paypalClient.execute(request);
            const order = response.result;

            // Onay linkini bul
            const approveLink = order.links.find((link: any) => link.rel === 'approve');

            if (!approveLink) {
                throw new Error('No approval link found in PayPal response');
            }

            return {
                orderId: order.id,
                status: order.status,
                approveUrl: approveLink.href,
                createdAt: order.create_time
            };

        } catch (error: any) {
            console.error('PayPal order creation failed:', error);
            throw new Error(`PayPal error: ${error.statusCode} - ${error.message}`);
        }
    }

    // KRİPTO ÖDEMELERİ
    async setupCryptoPayment(
        product: DigitalProduct,
        currency: 'BTC' | 'ETH' | 'USDT'
    ): Promise<CryptoPayment> {
        // Coinbase Commerce veya benzeri servis kullanılabilir
        // Bu örnekte basit bir QR kod ve adres oluşturma

        // Rastgele bir wallet adresi oluştur (gerçekte bu Coinbase API'sinden gelmeli)
        const address = this.generateCryptoAddress(currency);
        const amount = await this.convertUSDtoCrypto(product.price, currency);

        // QR kod URL'si
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${this.getPaymentURI(currency, address, amount)}`;

        // Payment tracking ID
        const paymentId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            paymentId,
            currency,
            address,
            amount,
            amountUSD: product.price,
            qrCodeUrl,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 dakika
            status: 'pending'
        };
    }

    private generateCryptoAddress(currency: string): string {
        // Gerçek implementasyonda: Coinbase Commerce API veya kendi node'unuz
        const prefix = currency === 'BTC' ? 'bc1q' :
            currency === 'ETH' ? '0x' :
                'T';

        const randomPart = crypto.randomBytes(20).toString('hex');
        return prefix + randomPart.substring(0, currency === 'BTC' ? 40 : 40);
    }

    private async convertUSDtoCrypto(usdAmount: number, currency: string): Promise<number> {
        try {
            // Gerçek exchange rate al
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${this.getCoinGeckoId(currency)}&vs_currencies=usd`,
                { timeout: 5000 }
            );

            const rate = response.data[this.getCoinGeckoId(currency)]?.usd;
            if (rate) {
                return usdAmount / rate;
            }
        } catch (error) {
            console.warn('Failed to fetch crypto rate, using fallback:', error);
        }

        // Fallback rates
        const fallbackRates: Record<string, number> = {
            'BTC': 45000,
            'ETH': 2500,
            'USDT': 1
        };

        return usdAmount / (fallbackRates[currency] || 1);
    }

    private getCoinGeckoId(currency: string): string {
        const mapping: Record<string, string> = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'USDT': 'tether'
        };
        return mapping[currency] || 'bitcoin';
    }

    private getPaymentURI(currency: string, address: string, amount: number): string {
        const uris: Record<string, string> = {
            'BTC': `bitcoin:${address}?amount=${amount}`,
            'ETH': `ethereum:${address}?value=${amount * 1e18}`, // Wei cinsinden
            'USDT': `tron:${address}?amount=${amount * 1e6}` // Sun cinsinden
        };
        return encodeURIComponent(uris[currency] || `crypto:${address}`);
    }

    // ÖDEME ONAY TAKİBİ
    async checkPaymentStatus(paymentId: string, gateway: 'stripe' | 'paypal' | 'crypto'): Promise<PaymentStatus> {
        switch (gateway) {
            case 'stripe':
                return await this.checkStripePayment(paymentId);
            case 'paypal':
                return await this.checkPayPalPayment(paymentId);
            case 'crypto':
                return await this.checkCryptoPayment(paymentId);
            default:
                throw new Error(`Unknown gateway: ${gateway}`);
        }
    }

    private async checkStripePayment(sessionId: string): Promise<PaymentStatus> {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        return {
            paymentId: session.id,
            gateway: 'stripe',
            status: session.payment_status,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'USD',
            customerEmail: session.customer_details?.email || undefined,
            paidAt: session.payment_intent
                ? new Date((session.payment_intent as any).created * 1000)
                : undefined
        };
    }

    private async checkPayPalPayment(orderId: string): Promise<PaymentStatus> {
        const request = new paypal.orders.OrdersGetRequest(orderId);
        const response = await this.paypalClient.execute(request);
        const order = response.result;

        return {
            paymentId: order.id,
            gateway: 'paypal',
            status: order.status === 'APPROVED' ? 'paid' : order.status.toLowerCase(),
            amount: parseFloat(order.purchase_units[0].amount.value),
            currency: order.purchase_units[0].amount.currency_code,
            paidAt: order.update_time ? new Date(order.update_time) : undefined
        };
    }

    private async checkCryptoPayment(paymentId: string): Promise<PaymentStatus> {
        // Gerçek implementasyonda: Blockchain explorer API veya own node
        // Bu örnekte rastgele bir durum dönüyor
        const statuses: Array<'pending' | 'paid' | 'failed'> = ['pending', 'paid', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return {
            paymentId,
            gateway: 'crypto',
            status: randomStatus,
            amount: 0.1,
            currency: 'BTC',
            paidAt: randomStatus === 'paid' ? new Date() : undefined
        };
    }

    // REFUND İŞLEMİ
    async processRefund(
        paymentId: string,
        gateway: 'stripe' | 'paypal',
        reason?: string
    ): Promise<RefundResult> {
        try {
            if (gateway === 'stripe') {
                const refund = await this.stripe.refunds.create({
                    payment_intent: paymentId,
                    reason: reason as any
                });

                return {
                    success: true,
                    refundId: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status,
                    gateway: 'stripe'
                };
            } else {
                // PayPal refund
                const request = new paypal.payments.CapturesRefundRequest(paymentId);
                request.requestBody({
                    amount: {
                        value: '10.00', // Gerçekte amount dynamic olmalı
                        currency_code: 'USD'
                    },
                    note_to_payer: reason
                });

                const response = await this.paypalClient.execute(request);

                return {
                    success: true,
                    refundId: response.result.id,
                    amount: parseFloat(response.result.amount.value),
                    status: response.result.status,
                    gateway: 'paypal'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                gateway
            };
        }
    }
}

// Type Definitions
export interface DigitalProduct {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    recurring?: boolean;
}

export interface StripeProduct {
    productId: string;
    priceId: string;
    sessionId: string;
    url: string;
    status: string;
}

export interface PayPalOrder {
    orderId: string;
    status: string;
    approveUrl: string;
    createdAt: string;
}

export interface CryptoPayment {
    paymentId: string;
    currency: string;
    address: string;
    amount: number;
    amountUSD: number;
    qrCodeUrl: string;
    createdAt: Date;
    expiresAt: Date;
    status: 'pending' | 'paid' | 'expired' | 'failed';
}

export interface PaymentStatus {
    paymentId: string;
    gateway: string;
    status: string;
    amount: number;
    currency: string;
    customerEmail?: string;
    paidAt?: Date;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    amount?: number;
    status?: string;
    gateway: string;
    error?: string;
}
