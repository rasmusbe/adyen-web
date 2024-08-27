import { Fastlane, FastlaneConstructor } from '../components/PayPalFastlane/types';

declare module '*.module.scss' {
    const content: { [className: string]: string };
    export default content;
}

declare global {
    interface Window {
        paypal?: {
            Fastlane?: FastlaneConstructor;
        };
    }
}
