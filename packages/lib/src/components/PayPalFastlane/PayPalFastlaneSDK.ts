import { resolveEnvironment } from '../../core/Environment';
import requestFastlaneToken from './services/request-fastlane-token';
import Script from '../../utils/Script';

import type { Fastlane, AuthenticatedCustomerResult } from './types';
import type { FastlaneTokenData } from './services/request-fastlane-token';

interface Configuration {
    clientKey: string;
    locale?: 'en_us' | 'es_us' | 'fr_rs' | 'zh_us';
    environment?: 'test' | 'live' | 'live-us' | 'live-au' | 'live-apse' | 'live-in' | string;
}

class PayPalFastlaneSDK {
    private readonly clientKey: string;
    private readonly checkoutShopperURL: string;
    private readonly locale: string;

    private fastlaneSdk: Fastlane;

    constructor(configuration: Configuration) {
        this.clientKey = configuration.clientKey;
        this.checkoutShopperURL = resolveEnvironment(configuration.environment);
        this.locale = configuration.locale || 'en_us';
    }

    public async initialize() {
        const tokenData = await this.requestClientToken();
        await this.fetchSdk(tokenData.value, tokenData.clientId);
        await this.initializeFastlane();
    }

    public lookupCustomerByEmail(email: string): Promise<{ customerContextId: string }> {
        return this.fastlaneSdk.identity.lookupCustomerByEmail(email);
    }

    public triggerAuthenticationFlow(customerContextId: string): Promise<AuthenticatedCustomerResult> {
        return this.fastlaneSdk.identity.triggerAuthenticationFlow(customerContextId);
    }

    public async mountWatermark(container: HTMLElement | string, options) {
        const component = await this.fastlaneSdk.FastlaneWatermarkComponent(options);
        component.render(container);
    }

    private requestClientToken(): Promise<FastlaneTokenData> {
        return requestFastlaneToken(this.checkoutShopperURL, this.clientKey);
    }

    private async fetchSdk(clientToken: string, clientId: string) {
        const url = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons,fastlane`;
        const script = new Script(url, 'body', {}, { sdkClientToken: clientToken });

        try {
            await script.load();
        } catch (error) {
            console.error(error);
        }
    }

    private async initializeFastlane() {
        this.fastlaneSdk = await window.paypal.Fastlane({});
        this.fastlaneSdk.setLocale(this.locale);
    }
}

export default PayPalFastlaneSDK;
