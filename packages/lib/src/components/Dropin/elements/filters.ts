import promiseTimeout from '../../../utils/promiseTimeout';
import type { IUIElement } from '../../internal/UIElement/types';
import { PaymentMethod } from '../../../types/global-types';
import { TxVariants } from '../../tx-variants';

export const UNSUPPORTED_PAYMENT_METHODS = ['androidpay', 'samsungpay', 'clicktopay'];

// filter payment methods that we don't support in the Drop-in
export const filterUnsupported = paymentMethod => !UNSUPPORTED_PAYMENT_METHODS.includes(paymentMethod.constructor['type']);

// filter payment methods that we support (that are in the paymentMethods/index dictionary)
export const filterPresent = paymentMethod => !!paymentMethod;

// filter payment methods that are available to the user
export const filterAvailable = (elements: IUIElement[]) => {
    const elementIsAvailablePromises = elements.map(element => {
        const { promise } = promiseTimeout(5000, element.isAvailable(), {});
        return promise;
    });

    return Promise.allSettled(elementIsAvailablePromises).then(promiseResults => {
        return elements.filter((element, i) => promiseResults[i].status === 'fulfilled');
    });
};

export const optionallyFilterUpiSubTxVariants = (paymentMethods: Array<PaymentMethod>) => {
    const hasUpiParent = paymentMethods.some(pm => pm?.type === 'upi');
    // If we don't get the 'upi' parent, we render multiple upi components
    if (!hasUpiParent) return paymentMethods;

    // If we get the 'upi' parent, we remove upi sub tx_variant components
    const UPI_SUB_TX_VARIANTS = [TxVariants.upi_qr, TxVariants.upi_collect, TxVariants.upi_intent];
    return paymentMethods.filter(pm => !UPI_SUB_TX_VARIANTS.includes(pm?.type as TxVariants));
};
