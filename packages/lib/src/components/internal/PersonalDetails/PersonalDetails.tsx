import { h, Fragment } from 'preact';
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyPersonalDetails from './ReadOnlyPersonalDetails';
import { renderFormField } from '../FormFields';
import { personalDetailsValidationRules } from './validate';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PersonalDetailsProps, PersonalDetailsRef } from './types';
import { checkDateInputSupport } from '../FormFields/InputDate/utils';
import { PersonalDetailsSchema } from '../../../types';
import { getFormattedData, mapFieldKey } from './utils';
import useForm from '../../../utils/useForm';
import './PersonalDetails.scss';
import { SRPanel } from '../../../core/Errors/SRPanel';
import { sortErrorsByLayout } from '../../../core/Errors/utils';
import { selectOne } from '../SecuredFields/lib/utilities/dom';

const personalDetailsSchema = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'shopperEmail', 'telephoneNumber'];

export default function PersonalDetails(props: PersonalDetailsProps) {
    const {
        i18n,
        commonProps: { moveFocusOnSubmitErrors, SRPanelRef }
    } = useCoreContext();

    const { label = '', namePrefix, placeholders, requiredFields, visibility } = props;

    const isValidating = useRef(false);

    console.log('### PersonalDetails::PersonalDetails:: moveFocusOnSubmitErrors', moveFocusOnSubmitErrors);
    console.log('### PersonalDetails::PersonalDetails:: SRPanelRef', SRPanelRef);

    const personalDetailsRef = useRef<PersonalDetailsRef>({});
    // Just call once to create the object by which we expose the members expected by the parent PersonalDetails comp
    if (!Object.keys(personalDetailsRef.current).length) {
        props.setComponentRef(personalDetailsRef.current);
    }

    // An array containing all the errors to be passed to the SRPanel to be read by the screenreader
    const [SRErrors, setSRErrors] = useState<string[]>(null);

    const isDateInputSupported = useMemo(checkDateInputSupport, []);
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<PersonalDetailsSchema>({
        schema: requiredFields,
        // Ensure any passed validation rules are merged with the default ones
        rules: { ...personalDetailsValidationRules, ...props.validationRules },
        defaultData: props.data
    });

    const eventHandler = (mode: string): Function => (e: Event): void => {
        const { name } = e.target as HTMLInputElement;
        const key = name.split(`${namePrefix}.`).pop();

        handleChangeFor(key, mode)(e);
    };

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;
    const getErrorMessage = error => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);

    // Expose method expected by (parent) PersonalDetails.tsx
    personalDetailsRef.current.showValidation = () => {
        // set flag
        isValidating.current = true;

        triggerValidation();
    };

    useEffect(() => {
        const formattedData = getFormattedData(data);

        console.log('### PersonalDetails:::: errors=', errors);
        // console.log('### PersonalDetails:::: requiredFields=', requiredFields);

        const currentErrorsSortedByLayout = sortErrorsByLayout({
            errors,
            i18n,
            fieldTypeMappingFn: mapFieldKey
        });

        console.log('### PersonalDetails::currentErrorsSortedByLayout:: ', currentErrorsSortedByLayout);

        if (currentErrorsSortedByLayout) {
            if (isValidating.current) {
                const errorMsgArr: string[] = currentErrorsSortedByLayout.map(errObj => errObj.errorMessage);
                // setSRErrors(errorMsgArr);
                SRPanelRef.setErrors(errorMsgArr);

                // const fieldListArr: string[] = currentErrorsSortedByLayout.map(errObj => errObj.field);
                //
                // // adyen-checkout__fieldset--personalDetails
                // const pdHolder = selectOne(document, '.adyen-checkout__fieldset--personalDetails');
                // console.log('### PersonalDetails::::pdHolder ', pdHolder);
                // // Set focus on input
                // console.log('### PersonalDetails:::: fieldListArr[0]', fieldListArr[0]);
                // const field: HTMLElement = selectOne(pdHolder, `[name="${fieldListArr[0]}"]`);
                // console.log('### PersonalDetails:::: field', field);
                // field?.focus();
                setTimeout(() => {
                    isValidating.current = false;
                }, 300);
            } else {
                // setSRErrors(null); //
                console.log('### PersonalDetails::componentDidUpdate:: clearing errors:: updating but not validating');
                SRPanelRef?.setErrors(null);
            }
        } else {
            console.log('### PersonalDetails::componentDidUpdate:: clearing errors:: NO currentErrorsSortedByLayout');
            // setSRErrors(null); // re. was a single error, now it is cleared - so clear SR panel
            SRPanelRef.setErrors(null);
        }

        props.onChange({ data: formattedData, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyPersonalDetails {...props} data={data} />;

    return (
        <Fragment>
            {/*<SRPanel id={'personalDetailsErrors'} errors={SRErrors} showPanel={true} />*/}
            <Fieldset classNameModifiers={['personalDetails']} label={label}>
                {requiredFields.includes('firstName') && (
                    <Field
                        label={i18n.get('firstName')}
                        classNameModifiers={['col-50', 'firstName']}
                        errorMessage={getErrorMessage(errors.firstName)}
                        name={'firstName'}
                        i18n={i18n}
                    >
                        {renderFormField('text', {
                            name: generateFieldName('firstName'),
                            value: data.firstName,
                            classNameModifiers: ['firstName'],
                            onInput: eventHandler('input'),
                            onBlur: eventHandler('blur'),
                            placeholder: placeholders.firstName,
                            spellCheck: false,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('lastName') && (
                    <Field
                        label={i18n.get('lastName')}
                        classNameModifiers={['col-50', 'lastName']}
                        errorMessage={getErrorMessage(errors.lastName)}
                        name={'lastName'}
                        i18n={i18n}
                    >
                        {renderFormField('text', {
                            name: generateFieldName('lastName'),
                            value: data.lastName,
                            classNameModifiers: ['lastName'],
                            onInput: eventHandler('input'),
                            onBlur: eventHandler('blur'),
                            placeholder: placeholders.lastName,
                            spellCheck: false,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('gender') && (
                    <Field errorMessage={!!errors.gender} classNameModifiers={['gender']} name={'gender'} useLabelElement={false}>
                        {renderFormField('radio', {
                            i18n,
                            name: generateFieldName('gender'),
                            value: data.gender,
                            items: [
                                { id: 'MALE', name: 'male' },
                                { id: 'FEMALE', name: 'female' }
                            ],
                            classNameModifiers: ['gender'],
                            onInput: eventHandler('input'),
                            onChange: eventHandler('blur'),
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('dateOfBirth') && (
                    <Field
                        label={i18n.get('dateOfBirth')}
                        classNameModifiers={['col-50', 'lastName']}
                        errorMessage={getErrorMessage(errors.dateOfBirth)}
                        helper={isDateInputSupported ? null : i18n.get('dateOfBirth.format')}
                        name={'dateOfBirth'}
                        i18n={i18n}
                    >
                        {renderFormField('date', {
                            name: generateFieldName('dateOfBirth'),
                            value: data.dateOfBirth,
                            classNameModifiers: ['dateOfBirth'],
                            onInput: eventHandler('input'),
                            onBlur: eventHandler('blur'),
                            placeholder: placeholders.dateOfBirth,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('shopperEmail') && (
                    <Field
                        label={i18n.get('shopperEmail')}
                        classNameModifiers={['shopperEmail']}
                        errorMessage={getErrorMessage(errors.shopperEmail)}
                        dir={'ltr'}
                        name={'emailAddress'}
                        i18n={i18n}
                    >
                        {renderFormField('emailAddress', {
                            name: generateFieldName('shopperEmail'),
                            value: data.shopperEmail,
                            classNameModifiers: ['shopperEmail'],
                            onInput: eventHandler('input'),
                            onBlur: eventHandler('blur'),
                            placeholder: placeholders.shopperEmail,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('telephoneNumber') && (
                    <Field
                        label={i18n.get('telephoneNumber')}
                        classNameModifiers={['telephoneNumber']}
                        errorMessage={getErrorMessage(errors.telephoneNumber)}
                        dir={'ltr'}
                        name={'telephoneNumber'}
                        i18n={i18n}
                    >
                        {renderFormField('tel', {
                            name: generateFieldName('telephoneNumber'),
                            value: data.telephoneNumber,
                            classNameModifiers: ['telephoneNumber'],
                            onInput: eventHandler('input'),
                            onBlur: eventHandler('blur'),
                            placeholder: placeholders.telephoneNumber,
                            required: true
                        })}
                    </Field>
                )}
            </Fieldset>
        </Fragment>
    );
}

PersonalDetails.defaultProps = {
    data: {},
    onChange: () => {},
    placeholders: {},
    requiredFields: personalDetailsSchema,
    validationRules: personalDetailsValidationRules,
    visibility: 'editable'
};
