import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import CompanyDetails from '../CompanyDetails';
import PersonalDetails from '../PersonalDetails';
import Address from '../Address';
import Checkbox from '../FormFields/Checkbox';
import ConsentCheckbox from '../FormFields/ConsentCheckbox';
import { getActiveFieldsData, getInitialActiveFieldsets, fieldsetsSchema } from './utils';
import {
    OpenInvoiceActiveFieldsets,
    OpenInvoiceFieldsetsRefs,
    OpenInvoiceProps,
    OpenInvoiceRef,
    OpenInvoiceStateData,
    OpenInvoiceStateError,
    OpenInvoiceStateValid
} from './types';
import './OpenInvoice.scss';
import IbanInput from '../IbanInput';
import { partial } from '../SecuredFields/lib/utilities/commonUtils';
import { setSRMessagesFromErrors } from '../../../core/Errors/utils';
import { mapFieldKey } from '../Address/utils';

export default function OpenInvoice(props: OpenInvoiceProps) {
    const { countryCode, visibility } = props;
    const {
        i18n,
        commonProps: { moveFocusOnSubmitErrors }
    } = useCoreContext();

    /** An object by which to expose 'public' members to the parent UIElement */
    const openInvoiceRef = useRef<OpenInvoiceRef>({});
    // Just call once
    if (!Object.keys(openInvoiceRef.current).length) {
        props.setComponentRef?.(openInvoiceRef.current);
    }

    /** Screen Reader related stuff */
    const { current: SRPanelRef } = useRef(props.modules?.srPanel);

    const isValidating = useRef(false);

    /**
     * Generate a setSRMessages function, once only (since the initial set of arguments don't change).
     */
    const setSRMessages = partial(setSRMessagesFromErrors, {
        SRPanelRef,
        i18n,
        fieldTypeMappingFn: mapFieldKey, //TODO make bespoke fn?
        isValidating,
        moveFocusOnSubmitErrors,
        focusSelector: '.adyen-checkout__open-invoice'
    });

    /** end SR stuff */

    const initialActiveFieldsets: OpenInvoiceActiveFieldsets = getInitialActiveFieldsets(visibility, props.data);
    const [activeFieldsets, setActiveFieldsets] = useState<OpenInvoiceActiveFieldsets>(initialActiveFieldsets);

    const { current: fieldsetsRefs } = useRef<OpenInvoiceFieldsetsRefs>(
        fieldsetsSchema.reduce((acc, fieldset) => {
            acc[fieldset] = ref => {
                fieldsetsRefs[fieldset].current = ref;
            };
            return acc;
        }, {})
    );

    const checkFieldsets = () => Object.keys(activeFieldsets).every(fieldset => !activeFieldsets[fieldset] || !!valid[fieldset]);
    const hasConsentCheckbox = !!props.consentCheckboxLabel;
    const isStandAloneButton = !hasConsentCheckbox && Object.keys(activeFieldsets).every(key => !activeFieldsets[key]);
    const showSeparateDeliveryAddressCheckbox = visibility.deliveryAddress === 'editable' && visibility.billingAddress !== 'hidden';

    const [data, setData] = useState<OpenInvoiceStateData>({
        ...props.data,
        ...(hasConsentCheckbox && { consentCheckbox: false })
    });
    const [errors, setErrors] = useState<OpenInvoiceStateError>({});
    const [valid, setValid] = useState<OpenInvoiceStateValid>({});
    const [status, setStatus] = useState('ready');

    // Expose methods expected by parent
    openInvoiceRef.current.showValidation = () => {
        isValidating.current = true;
        fieldsetsSchema.forEach(fieldset => {
            if (fieldsetsRefs[fieldset].current) fieldsetsRefs[fieldset].current.showValidation();
        });

        setErrors({
            ...(hasConsentCheckbox && { consentCheckbox: !data.consentCheckbox })
        });
    };

    openInvoiceRef.current.setStatus = setStatus;

    useEffect(() => {
        const fieldsetsAreValid: boolean = checkFieldsets();
        const consentCheckboxValid: boolean = !hasConsentCheckbox || !!valid.consentCheckbox;
        const isValid: boolean = fieldsetsAreValid && consentCheckboxValid;
        const newData: OpenInvoiceStateData = getActiveFieldsData(activeFieldsets, data);

        // Create messages for SRPanel
        // TODO need a layout
        // TODO where are the IbanInput errors

        // Extract and then flatten billingAddress errors into a new object with *all* the field errors at top level
        const { billingAddress: extractedBillingAddressErrors, ...remainingErrors } = errors;
        const { personalDetails: extractedPDErrors, ...remainingErrors2 } = remainingErrors;

        // @ts-ignore failure to recognise objects
        const errorsForPanel = { ...remainingErrors2, ...extractedBillingAddressErrors, ...extractedPDErrors };
        console.log('### OpenInvoice:::: errorsForPanel', errorsForPanel);

        setSRMessages(errorsForPanel);

        props.onChange({ data: newData, errors, valid, isValid });
    }, [data, activeFieldsets]);

    const handleFieldset = key => state => {
        setData(prevData => ({ ...prevData, [key]: state.data }));
        setValid(prevValid => ({ ...prevValid, [key]: state.isValid }));
        setErrors(prevErrors => ({ ...prevErrors, [key]: state.errors }));
    };

    const handleSeparateDeliveryAddress = () => {
        setActiveFieldsets(prevActiveFields => ({
            ...prevActiveFields,
            deliveryAddress: !activeFieldsets.deliveryAddress
        }));
    };

    const handleConsentCheckbox = e => {
        const { checked } = e.target;
        setData(prevData => ({ ...prevData, consentCheckbox: checked }));
        setValid(prevValid => ({ ...prevValid, consentCheckbox: checked }));
        setErrors(prevErrors => ({ ...prevErrors, consentCheckbox: !checked }));
    };

    return (
        <div className="adyen-checkout__open-invoice">
            {activeFieldsets.companyDetails && (
                <CompanyDetails
                    data={props.data.companyDetails}
                    label="companyDetails"
                    onChange={handleFieldset('companyDetails')}
                    setComponentRef={fieldsetsRefs.companyDetails}
                    visibility={visibility.companyDetails}
                />
            )}

            {activeFieldsets.personalDetails && (
                <PersonalDetails
                    data={props.data.personalDetails}
                    requiredFields={props.personalDetailsRequiredFields}
                    label="personalDetails"
                    onChange={handleFieldset('personalDetails')}
                    setComponentRef={fieldsetsRefs.personalDetails}
                    visibility={visibility.personalDetails}
                />
            )}

            {activeFieldsets.bankAccount && (
                <IbanInput
                    holderName={true}
                    label="bankAccount"
                    data={data.bankAccount}
                    onChange={handleFieldset('bankAccount')}
                    ref={fieldsetsRefs.bankAccount}
                />
            )}

            {activeFieldsets.billingAddress && (
                <Address
                    allowedCountries={props.allowedCountries}
                    countryCode={countryCode}
                    requiredFields={props.billingAddressRequiredFields}
                    specifications={props.billingAddressSpecification}
                    data={data.billingAddress}
                    label="billingAddress"
                    onChange={handleFieldset('billingAddress')}
                    setComponentRef={fieldsetsRefs.billingAddress}
                    visibility={visibility.billingAddress}
                />
            )}

            {showSeparateDeliveryAddressCheckbox && (
                <Checkbox
                    label={i18n.get('separateDeliveryAddress')}
                    checked={activeFieldsets.deliveryAddress}
                    classNameModifiers={['separateDeliveryAddress']}
                    name="separateDeliveryAddress"
                    onChange={handleSeparateDeliveryAddress}
                />
            )}

            {activeFieldsets.deliveryAddress && (
                <Address
                    allowedCountries={props.allowedCountries}
                    countryCode={countryCode}
                    data={data.deliveryAddress}
                    label="deliveryAddress"
                    onChange={handleFieldset('deliveryAddress')}
                    setComponentRef={fieldsetsRefs.deliveryAddress}
                    visibility={visibility.deliveryAddress}
                />
            )}

            {hasConsentCheckbox && (
                <ConsentCheckbox
                    data={data}
                    errorMessage={!!errors.consentCheckbox}
                    label={props.consentCheckboxLabel}
                    onChange={handleConsentCheckbox}
                    i18n={i18n}
                />
            )}

            {props.showPayButton &&
                props.payButton({
                    status,
                    classNameModifiers: [...(isStandAloneButton ? ['standalone'] : [])],
                    label: i18n.get('confirmPurchase')
                })}
        </div>
    );
}
