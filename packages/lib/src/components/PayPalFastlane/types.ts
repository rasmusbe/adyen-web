export type FastlaneConstructor = (options: FastlaneOptions) => Fastlane;

/**
 * PayPal Fastlane Reference:
 * https://developer.paypal.com/docs/checkout/fastlane/reference/#link-customizeyourintegration
 */

// TODO: Verify if we pass options here
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FastlaneOptions {}

export interface Fastlane {
    identity: {
        lookupCustomerByEmail: (email: string) => Promise<{ customerContextId: string }>;
        triggerAuthenticationFlow: (customerContextId: string, options?: AuthenticationFlowOptions) => Promise<AuthenticatedCustomerResult>;
    };
    profile: {
        showShippingAddressSelector: () => Promise<ShowShippingAddressSelectorResult>;
        showCardSelector: () => ShowCardSelectorResult;
    };
    setLocale: (locale: string) => void;
    FastlaneWatermarkComponent: (options: FastlaneWatermarkOptions) => FastlaneWatermarkComponent;
}

interface FastlaneWatermarkOptions {
    includeAdditionalInfo: boolean;
}
interface FastlaneWatermarkComponent {
    render: (container) => null;
}

// TODO: fill this in after workshop
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AuthenticationFlowOptions {}

/**
 * The AuthenticatedCustomerResult object type is returned from the identity.triggerAuthenticationFlow() call.
 */
export interface AuthenticatedCustomerResult {
    authenticationState: 'succeeded' | 'failed' | 'canceled' | 'not_found';
    profileData: ProfileData;
}
interface ProfileData {
    name: Name;
    shippingAddress: Shipping;
    card: PaymentToken;
}
interface Name {
    firstName: string;
    lastName: string;
    fullName: string;
}

interface Phone {
    nationalNumber: string;
    countryCode: string;
}

interface Address {
    addressLine1: string;
    addressLine2: string;
    adminArea1: string;
    adminArea2: string;
    postalCode: string;
    countryCode: string;
    phone: Phone;
}

interface Shipping {
    name: Name;
    address: Address;
    companyName: string;
}
interface PaymentToken {
    id: string;
    paymentSource: PaymentSource;
}
interface PaymentSource {
    card: CardPaymentSource;
}
interface CardPaymentSource {
    brand: string;
    expiry: string;
    lastDigits: string;
    name: string;
    billingAddress: Address;
}

/**
 * Profile method reference types
 */
export interface ShowShippingAddressSelectorResult {
    selectionChanged: boolean;
    selectedAddress: Address;
}
interface ShowCardSelectorResult {
    selectionChanged: boolean;
    selectedCard: PaymentToken;
}
