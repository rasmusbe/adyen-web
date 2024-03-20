import { h } from 'preact';
import { useState, useRef } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { MBWayInputProps } from './types';
import './MBWayInput.scss';
import PhoneInput from '../../../internal/PhoneInput';
import LoadingWrapper from '../../../internal/LoadingWrapper';
import usePhonePrefixes from '../../../internal/PhoneInput/usePhonePrefixes';
import { Status } from '../../../internal/BaseElement/types';

function MBWayInput(props: MBWayInputProps) {
    const { i18n, loadingContext } = useCoreContext();

    const phoneInputRef = useRef(null);

    const { allowedCountries = [] } = props;

    const [status, setStatus] = useState<string>(Status.Ready);

    this.setStatus = setStatus;
    this.showValidation = phoneInputRef?.current?.triggerValidation;

    const { loadingStatus: prefixLoadingStatus, phonePrefixes } = usePhonePrefixes({ allowedCountries, loadingContext, handleError: props.onError });

    const onChange = ({ data, valid, errors, isValid }) => {
        props.onChange({ data, valid, errors, isValid });
    };

    return (
        <LoadingWrapper status={prefixLoadingStatus}>
            <div className="adyen-checkout__mb-way">
                <PhoneInput {...props} items={phonePrefixes} ref={phoneInputRef} onChange={onChange} data={props.data} />

                {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
            </div>
        </LoadingWrapper>
    );
}

MBWayInput.defaultProps = {
    onChange: () => {},
    phoneNumberKey: 'mobileNumber',
    phoneNumberErrorKey: 'mobileNumber.invalid'
};

export default MBWayInput;
