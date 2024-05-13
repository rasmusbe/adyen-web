import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import { App } from '../../../types';
import uuid from '../../../../../utils/uuid';
import PaymentMethodIcon from '../../../../Dropin/components/PaymentMethod/PaymentMethodIcon';
import './UPIIntentAppItem.scss';
import ExpandButton from '../../../../internal/ExpandButton/ExpandButton';

interface UPIIntentAppItemProps {
    app: App;
    imgSrc: string;
    isSelected: boolean;
    onSelect?: Function;
    children?: ComponentChildren;
}

const UPIIntentAppItem = ({ app, imgSrc, isSelected, onSelect = () => {}, children }: UPIIntentAppItemProps): h.JSX.Element => {
    const buttonId = `adyen-checkout-upi-app-item-expand-button-${app.id}-${uuid()}`;
    const containerId = `adyen-checkout-upi-app-item-details-${app.id}`;
    const handleAppSelected = (app: App) => {
        onSelect(app);
    };

    return (
        <li
            className={cx({
                'adyen-checkout-upi-app-item': true,
                'adyen-checkout-upi-app-item--selected': isSelected
            })}
            role="button"
            aria-expanded={isSelected}
            onClick={() => handleAppSelected(app)}
        >
            <div className="adyen-checkout-upi-app-item-header">
                <ExpandButton buttonId={buttonId} isSelected={isSelected} expandContentId={containerId}>
                    <PaymentMethodIcon src={imgSrc} altDescription={app.name} type={app.id}></PaymentMethodIcon>
                    <label htmlFor={buttonId}>{app.name}</label>
                </ExpandButton>
            </div>
            {isSelected && children && (
                <div className="adyen-checkout-upi-app-item-details" id={containerId} role="region">
                    {children}
                </div>
            )}
        </li>
    );
};

export default UPIIntentAppItem;
