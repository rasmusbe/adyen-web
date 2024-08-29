import { Meta, StoryObj } from '@storybook/preact';
import UIElement from '../../src/components/internal/UIElement';

export type GlobalStoryProps = AdyenCheckoutProps & {
    useSessions: boolean;
};

export interface PaymentMethodStoryProps<T> extends GlobalStoryProps {
    componentConfiguration: T;
}

export type StoryConfiguration<T> = StoryObj<PaymentMethodStoryProps<T>>;

export type MetaConfiguration<T> = Meta<PaymentMethodStoryProps<T>>;

export type AdyenCheckoutProps = {
    showPayButton: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
    onPaymentCompleted?: (data: any, element?: UIElement) => void;
};
