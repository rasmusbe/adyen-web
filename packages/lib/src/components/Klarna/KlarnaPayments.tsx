import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { KlarnaPaymentsProps } from './types';
import PayButton from '../internal/PayButton';
import { KlarnaContainer } from './components/KlarnaContainer/KlarnaContainer';
import { PaymentAction } from '../../types';
import Core from '../../core';

class KlarnaPayments extends UIElement<KlarnaPaymentsProps> {
    public static type = 'klarna';
    public static txVariants = ['klarna', 'klarna_account', 'klarna_paynow'];

    protected static defaultProps = {
        useKlarnaWidget: false
    };

    constructor(checkoutRef: Core, props?: KlarnaPaymentsProps) {
        super(checkoutRef, { ...props, type: props?.type ?? KlarnaPayments.type });

        this.onComplete = this.onComplete.bind(this);
        this.updateWithAction = this.updateWithAction.bind(this);
        this.submit = this.submit.bind(this);
    }
    get isValid() {
        return true;
    }

    protected formatData() {
        return {
            paymentMethod: {
                type: this.type,
                ...(this.props.useKlarnaWidget ? { subtype: 'sdk' } : {})
            }
        };
    }

    public payButton = props => {
        return <PayButton amount={this.props.amount} onClick={this.submit} {...props} />;
    };

    updateWithAction(action: PaymentAction): void {
        if (action.paymentMethodType !== this.type) throw new Error('Invalid Action');
        this.componentRef.setAction(action);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <KlarnaContainer
                    {...this.props}
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    displayName={this.displayName}
                    onComplete={state => this.handleAdditionalDetails(state)}
                    onError={this.props.onError}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default KlarnaPayments;
