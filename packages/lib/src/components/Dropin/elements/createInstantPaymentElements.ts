import createElements from './createElements';
import { PaymentMethod } from '../../../types';
import UIElement from '../../UIElement';

/**
 *  Returns a filtered (available) list of InstantPaymentMethods Elements
 * @param paymentMethods - Instant payment methods
 * @param props - Props to be passed through to every paymentMethod
 * @param create - Reference to the main instance `Core#create` method
 */
const createInstantPaymentElements = (paymentMethods: PaymentMethod[] = [], props, checkout): Promise<UIElement[]> | [] =>
    paymentMethods.length ? createElements(paymentMethods, { ...props, isInstantPayment: true, showPayButton: true }, checkout) : [];

export default createInstantPaymentElements;
