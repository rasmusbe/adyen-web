import type { FastlaneConstructor } from '../components/PayPalFastlane/types';

declare global {
    interface Window {
        paypal?: {
            Fastlane?: FastlaneConstructor;
        };
    }
}
