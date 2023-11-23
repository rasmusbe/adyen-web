import { h } from 'preact';
import Session from '../../../core/CheckoutSession';
import UIElement from './UIElement';
import { ActionHandledReturnObject, PaymentAction, PaymentAmount, PaymentAmountExtended } from '../../../types/global-types';
import Language from '../../../language';
import { BaseElementProps, IBaseElement } from '../BaseElement/types';
import { PayButtonProps } from '../PayButton/PayButton';
import { CoreConfiguration, ICore } from '../../../core/types';

export type PayButtonFunctionProps = Omit<PayButtonProps, 'amount'>;

export interface UIElementProps extends BaseElementProps {
    environment?: string;
    session?: Session;
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    beforeSubmit?: (state: any, element: UIElement, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onActionHandled?: (rtnObj: ActionHandledReturnObject) => void;
    onAdditionalDetails?: (state: any, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;
    onPaymentCompleted?: (result: any, element: UIElement) => void;
    beforeRedirect?: (resolve, reject, redirectData, element: UIElement) => void;

    isInstantPayment?: boolean;

    /**
     * Flags if the element is Stored payment method
     * @internal
     */
    isStoredPaymentMethod?: boolean;

    /**
     * Flag if the element is Stored payment method.
     * Perhaps can be deprecated and we use the one above?
     * @internal
     */
    oneClick?: boolean;

    /**
     * Stored payment method id
     * @internal
     */
    storedPaymentMethodId?: string;

    /**
     * Status set when creating the Component from action
     * @internal
     */
    statusType?: 'redirect' | 'loading' | 'custom';

    type?: string;
    name?: string;
    icon?: string;
    amount?: PaymentAmount;
    secondaryAmount?: PaymentAmountExtended;

    /**
     * Show/Hide pay button
     * @defaultValue true
     */
    showPayButton?: boolean;

    /**
     *  Set to false to not set the Component status to 'loading' when onSubmit is triggered.
     *  @defaultValue true
     */
    setStatusAutomatically?: boolean;

    /** @internal */
    payButton?: (options: PayButtonFunctionProps) => h.JSX.Element;

    /** @internal */
    loadingContext?: string;

    /** @internal */
    createFromAction?: (action: PaymentAction, props: object) => UIElement;

    /** @internal */
    clientKey?: string;

    /** @internal */
    elementRef?: any;

    /** @internal */
    i18n?: Language;
}

export interface IUIElement extends IBaseElement {
    isValid: boolean;
    displayName: string;
    accessibleName: string;
    type: string;
    icon: string;
    elementRef: IUIElement;
    submit(): void;
    setComponentRef(ref): void;
    updateParent(options?: CoreConfiguration): Promise<ICore>;
    setElementStatus(status: UIElementStatus, props: any): UIElement;
    setStatus(status: UIElementStatus, props?: { message?: string; [key: string]: any }): UIElement;
    handleAction(action: PaymentAction): UIElement | null;
    showValidation(): void;
    setState(newState: object): void;
    isAvailable(): Promise<void>;
}

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';

// An interface for the members exposed by a component to its parent UIElement
export interface ComponentMethodsRef {
    showValidation?: () => void;
    setStatus?(status: UIElementStatus): void;
}
