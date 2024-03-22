import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import collectBrowserInfo from '../../utils/browserInfo';
import AmazonPayComponent from './components/AmazonPayComponent';
import { AmazonPayElementData, AmazonPayElementProps, CheckoutDetailsRequest } from './types';
import defaultProps from './defaultProps';
import { getCheckoutDetails } from './services';
import './AmazonPay.scss';
import { SendAnalyticsObject } from '../../core/Analytics/types';
import { ANALYTICS_RENDERED_STR } from '../../core/Analytics/constants';

export class AmazonPayElement extends UIElement<AmazonPayElementProps> {
    public static type = 'amazonpay';
    protected static defaultProps = defaultProps;

    protected submitAnalytics(analyticsObj: SendAnalyticsObject) {
        let extraAnalyticsObject = {};
        if (analyticsObj.type === ANALYTICS_RENDERED_STR) {
            const isExpress = this.props.isExpress;
            const expressPage = this.props.expressPage ?? null;
            extraAnalyticsObject = {
                isExpress,
                ...(isExpress && expressPage && { expressPage }) // We only care about the expressPage value if isExpress is true
            };
        }
        super.submitAnalytics({ ...analyticsObj, ...extraAnalyticsObject });
    }
    formatProps(props) {
        return {
            ...props,
            checkoutMode: props.isDropin ? 'ProcessOrder' : props.checkoutMode,
            environment: props.environment.toUpperCase(),
            locale: props.locale.replace('-', '_'),
            productType: props.isDropin && !props.addressDetails ? 'PayOnly' : props.productType
        };
    }

    /**
     * Formats the component data output
     */
    formatData(): AmazonPayElementData {
        const { amazonCheckoutSessionId: checkoutSessionId } = this.props;
        return {
            paymentMethod: {
                type: AmazonPayElement.type,
                ...(checkoutSessionId && { checkoutSessionId })
            },
            browserInfo: this.browserInfo
        };
    }

    getShopperDetails() {
        const { amazonCheckoutSessionId, configuration = {}, loadingContext, clientKey } = this.props;
        if (!amazonCheckoutSessionId) return console.error('Could not shopper details. Missing checkoutSessionId.');

        const request: CheckoutDetailsRequest = {
            checkoutSessionId: amazonCheckoutSessionId,
            getDeliveryAddress: true,
            publicKeyId: configuration.publicKeyId,
            region: configuration.region
        };

        return getCheckoutDetails(loadingContext, clientKey, request);
    }

    handleDeclineFlow() {
        const { amazonCheckoutSessionId, configuration = {}, loadingContext, clientKey } = this.props;
        if (!amazonCheckoutSessionId) return console.error('Could handle the decline flow. Missing checkoutSessionId.');

        const request: CheckoutDetailsRequest = {
            checkoutSessionId: amazonCheckoutSessionId,
            getDeclineFlowUrl: true,
            publicKeyId: configuration.publicKeyId,
            region: configuration.region
        };

        getCheckoutDetails(loadingContext, clientKey, request)
            .then((response = {}) => {
                if (!response?.declineFlowUrl) throw response;
                window.location.assign(response.declineFlowUrl);
            })
            .catch(error => {
                if (this.props.onError) this.props.onError(error, this.componentRef);
            });
    }

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    submit() {
        const { data, isValid } = this;
        const { onSubmit = () => {} } = this.props;

        if (this.componentRef && this.componentRef.submit) return this.componentRef.submit();
        return onSubmit({ data, isValid }, this);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <AmazonPayComponent
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                />
            </CoreProvider>
        );
    }
}

export default AmazonPayElement;
