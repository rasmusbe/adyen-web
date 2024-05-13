import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import './ExpandButton.scss';

interface RadioButtonProps {
    buttonId: string;
    isSelected: boolean;
    expandContentId: string;
    children: ComponentChildren;
    showRadioButton?: boolean;
    classNameModifiers?: string[];
}

function ExpandButton({ buttonId, isSelected, expandContentId, children, classNameModifiers = [] }: Readonly<RadioButtonProps>) {
    return (
        // eslint-disable-next-line jsx-a11y/role-supports-aria-props
        <button
            className={cx('adyen-checkout-expand-button', classNameModifiers)}
            id={buttonId}
            role="radio"
            aria-checked={isSelected}
            aria-expanded={isSelected}
            aria-controls={expandContentId}
            type="button"
        >
            {children}
        </button>
    );
}
export default ExpandButton;
