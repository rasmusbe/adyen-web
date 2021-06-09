import { Selector, ClientFunction } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import cu from '../../cards/utils/cardUtils';
import { BCMC_CARD, UNKNOWN_VISA_CARD } from '../../cards/utils/constants';
import { CUSTOMCARDS_URL } from '../../pages';

const singleBrandingIconHolder = Selector('.secured-fields .pm-image');
const dualBrandingIconHolder = Selector('.secured-fields .pm-image-dual');

const cvcField = Selector('.secured-fields .pm-form-label--cvc');

const getPropFromPMData = ClientFunction(prop => {
    return window.securedFields.formatData().paymentMethod[prop];
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.secured-fields iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing dual branding resets in custom card`.page(CUSTOMCARDS_URL).clientScripts('customcard.dualBranding.clientScripts.js');

test(
    'Fill in dual branded card then ' +
        'check no sorting has occurred to place bcmc first, then' +
        'ensure only generic card logo shows after deleting digits',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        // Maestro first, Bcmc second
        await t
            // hidden single brand icon holder
            .expect(singleBrandingIconHolder.filterHidden().exists)
            .ok()
            // visible dual brand icon holder
            .expect(dualBrandingIconHolder.filterVisible().exists)
            .ok()
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        await cardUtils.deleteCardNumber(t);

        await t
            // visible single brand icon holder
            .expect(singleBrandingIconHolder.filterVisible().exists)
            .ok()
            // hidden dual brand icon holder
            .expect(dualBrandingIconHolder.filterHidden().exists)
            .ok()
            .expect(
                singleBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('alt')
            )
            .eql('card');
    }
);

test(
    'Fill in dual branded card then ' +
        'select bcmc then ' +
        'ensure cvc field is hidden ' +
        'ensure only generic card logo shows after deleting digits and ' +
        'that the brand has been reset on paymentMethod data ' +
        'and the cvc field is shown again',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            // hidden single brand icon holder
            .expect(singleBrandingIconHolder.filterHidden().exists)
            .ok()
            // visible dual brand icon holder
            .expect(dualBrandingIconHolder.filterVisible().exists)
            .ok()
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        // visible cvc holder
        await t.expect(cvcField.filterVisible().exists).ok();

        // Click BCMC brand icon
        await t.click(dualBrandingIconHolder.find('img').nth(1));

        // Should be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql('bcmc');

        // hidden cvc holder
        await t.expect(cvcField.filterHidden().exists).ok();

        await cardUtils.deleteCardNumber(t);

        // Generic card icon
        await t
            .expect(
                singleBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('alt')
            )
            .eql('card');

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);

        // visible cvc holder
        await t.expect(cvcField.filterVisible().exists).ok();
    }
);

test(
    'Fill in dual branded card then ' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
        'ensure that Visa logo shows',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            // visible dual brand icon holder
            .expect(dualBrandingIconHolder.filterVisible().exists)
            .ok()
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        // visa card icon
        await t
            .expect(
                singleBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('alt')
            )
            .eql('visa');
    }
);

test(
    'Fill in dual branded card then ' +
        'select maestro then ' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
        'ensure that Visa logo shows ' +
        'that the brand has been reset on paymentMethod data ',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            // visible dual brand icon holder
            .expect(dualBrandingIconHolder.filterVisible().exists)
            .ok()
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolder
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        // Click maestro brand icon
        await t.click(dualBrandingIconHolder.find('img').nth(0));

        // Should be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql('maestro');

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        // visa card icon
        await t
            .expect(
                singleBrandingIconHolder
                    .find('img')
                    .nth(0)
                    .getAttribute('alt')
            )
            .eql('visa');

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);
    }
);
