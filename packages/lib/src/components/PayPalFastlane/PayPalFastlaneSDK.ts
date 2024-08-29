import { resolveEnvironment } from '../../core/Environment';
import requestFastlaneToken from './services/request-fastlane-token';
import Script from '../../utils/Script';

import type { Fastlane, AuthenticatedCustomerResult, ShowShippingAddressSelectorResult } from './types';
import type { FastlaneTokenData } from './services/request-fastlane-token';

interface Configuration {
    clientKey: string;
    locale?: 'en_us' | 'es_us' | 'fr_rs' | 'zh_us';
    environment?: 'test' | 'live' | 'live-us' | 'live-au' | 'live-apse' | 'live-in' | string;
}

async function PayPalFastlaneSDK(configuration: Configuration): Promise<FastlaneSDK> {
    const fastlane = new FastlaneSDK(configuration);
    return await fastlane.initialize();
}

class FastlaneSDK {
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
        return this;
    }

    public async authenticate(email: string): Promise<AuthenticatedCustomerResult> {
        const { customerContextId } = await this.fastlaneSdk.identity.lookupCustomerByEmail(email);

        if (customerContextId) {
            return this.fastlaneSdk.identity.triggerAuthenticationFlow(customerContextId);
        } else {
            return {
                authenticationState: 'not_found',
                profileData: undefined
            };
        }
    }

    public showShippingAddressSelector(): Promise<ShowShippingAddressSelectorResult> {
        if (!this.fastlaneSdk.profile) return null;
        return this.fastlaneSdk.profile.showShippingAddressSelector();
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
