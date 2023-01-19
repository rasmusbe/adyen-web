import { unformatDate } from '../FormFields/InputDate/utils';
import Language from '../../../language';
import { selectOne } from '../SecuredFields/lib/utilities/dom';

export const getFormattedData = data => {
    const { firstName, lastName, gender, dateOfBirth, shopperEmail, telephoneNumber } = data;

    return {
        ...((firstName || lastName) && {
            shopperName: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(gender && { gender })
            }
        }),
        ...(dateOfBirth && { dateOfBirth: unformatDate(dateOfBirth) }),
        ...(shopperEmail && { shopperEmail }),
        ...(telephoneNumber && { telephoneNumber })
    };
};

export const mapFieldKey = (key: string, i18n: Language): string => {
    switch (key) {
        case 'gender':
        case 'dateOfBirth':
            return i18n.get(key);
        // We know that the translated error messages do contain a reference to the field they refer to, so we won't need to map them
        default:
            return null;
    }
};

export const setFocusOnFirstField = (holder, fieldToFocus) => {
    const pdHolder = selectOne(document, holder);
    // Set focus on input
    const field: HTMLElement = selectOne(pdHolder, `[name="${fieldToFocus}"]`);
    field?.focus();
};
