import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import LoadingWrapper from '../../internal/LoadingWrapper';
import InputText from '../../internal/FormFields/InputText';
import Field from '../../internal/FormFields/Field';
import useForm from '../../../utils/useForm';
import { ancvValidationRules } from '../validate';
import { ANCVDataState } from '../types';
import { UIElementProps } from '../../internal/UIElement/types';
import { Status } from '../../internal/BaseElement/types';

export interface ANCVInputProps extends UIElementProps {
    ref?: any;
    showPayButton: boolean;
    onSubmit: () => void;
}

type ANCVInputDataState = ANCVDataState;

function ANCVInput({ showPayButton, payButton, onChange, onSubmit }: ANCVInputProps) {
    const { i18n } = useCoreContext();

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<ANCVInputDataState>({
        schema: ['beneficiaryId'],
        rules: ancvValidationRules
    });

    useEffect(() => {
        onChange({ data, errors, valid, isValid }, this);
    }, [data, valid, errors, isValid]);

    const [status, setStatus] = useState<Status>(Status.Ready);

    this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    return (
        <LoadingWrapper>
            <div className="adyen-checkout__ancv">
                <p className="adyen-checkout-form-instruction">{i18n.get('ancv.form.instruction')}</p>
                <Field
                    errorMessage={!!errors.beneficiaryId && i18n.get(errors.beneficiaryId.errorMessage)}
                    label={i18n.get('ancv.input.label')}
                    isValid={valid.beneficiaryId}
                    name={'beneficiaryId'}
                >
                    <InputText
                        value={data.beneficiaryId}
                        name={'beneficiaryId'}
                        spellcheck={true}
                        required={true}
                        onInput={handleChangeFor('beneficiaryId', 'input')}
                        onBlur={handleChangeFor('beneficiaryId', 'blur')}
                    />
                </Field>
                {showPayButton && payButton({ status, label: i18n.get('confirmPurchase'), onClick: onSubmit })}
            </div>
        </LoadingWrapper>
    );
}

ANCVInput.defaultProps = {};

export default ANCVInput;
