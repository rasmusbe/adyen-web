import { ClientFunction, Selector } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { CARDS_URL } from '../../pages';
import { MAESTRO_CARD, TEST_DATE_VALUE, TEST_CVC_VALUE, BCMC_CARD } from '../utils/constants';

const cvcSpan = Selector('.card-field .adyen-checkout__field__cvc');
const optionalCVCSpan = Selector('.card-field .adyen-checkout__field__cvc--optional');
const cvcLabel = Selector('.card-field .adyen-checkout__label__text');
const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

const dualBrandingIconHolderActive = Selector('.card-field .adyen-checkout__card__dual-branding__buttons--active');

const getPropFromPMData = ClientFunction(prop => {
    return window.card.formatData().paymentMethod[prop];
});

/**
 * Needed for hack detailed in 3rd test, below
 */
const setForceClick = ClientFunction(val => {
    window.testCafeForceClick = val;
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing branding - especially regarding optional and hidden cvc fields`.page(CARDS_URL).clientScripts('branding.clientScripts.js');

test(
    'Test for generic card icon, ' +
        'then enter number recognised as maestro (by our regEx), ' +
        'then add digit so it will be seen as a bcmc card (by our regEx) ,' +
        'then delete number (back to generic card)',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        await t
            // generic card icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('nocard.svg')

            // visible cvc field
            .expect(cvcSpan.filterVisible().exists)
            .ok()

            // with regular text
            .expect(cvcLabel.withExactText('CVC / CVV').exists)
            .ok()

            // and not optional
            .expect(optionalCVCSpan.exists)
            .notOk();

        // Partially fill card field with digits that will be recognised as maestro
        await cardUtils.fillCardNumber(t, '670');

        await t
            // maestro card icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('maestro.svg')

            // with "optional" text
            .expect(cvcLabel.withExactText('CVC / CVV (optional)').exists)
            .ok()
            // and optional class
            .expect(optionalCVCSpan.exists)
            .ok();

        await t.wait(500);

        // Add digit so card is recognised as bcmc
        await cardUtils.fillCardNumber(t, '3');

        await t
            // bcmc icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('bcmc.svg')

            // hidden cvc field
            .expect(cvcSpan.filterHidden().exists)
            .ok();

        await t.wait(500);

        // Delete number
        await cardUtils.deleteCardNumber(t);

        // Card is reset
        await t
            // generic card icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('nocard.svg')

            // visible cvc field
            .expect(cvcSpan.filterVisible().exists)
            .ok()

            // with regular text
            .expect(cvcLabel.withExactText('CVC / CVV').exists)
            .ok()

            // and not optional
            .expect(optionalCVCSpan.exists)
            .notOk();
    }
);

test('Test card is valid with maestro details (cvc optional) ' + 'then test it is invalid (& brand reset) when number deleted', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // generic card
    await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

    // Maestro
    await cardUtils.fillCardNumber(t, MAESTRO_CARD);
    await cardUtils.fillDate(t, TEST_DATE_VALUE);

    await t
        // maestro card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('maestro.svg')

        // with "optional" text
        .expect(cvcLabel.withExactText('CVC / CVV (optional)').exists)
        .ok()
        // and optional class
        .expect(optionalCVCSpan.exists)
        .ok();

    await t.expect(getIsValid('card')).eql(true);

    // add cvc
    await cardUtils.fillCVC(t, TEST_CVC_VALUE);

    // Is valid
    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg');

    // Is not valid
    await t.expect(getIsValid('card')).eql(false);
});

/**
 * 3rd Test
 *
 * NOTE: test doesn't work properly - the click away from the CVC field is not triggering a blur event within the securedField
 * so the error event & focus:false event from the iframe are never sent.
 *
 * However if you run localhost:3024 and recreate the steps in the test, it does create the expected error - so this seems to be be a bug with TestCafe.
 *
 * The solution is a HORRIBLE HORRIBLE HACK - the setForceClick function - which sets a flag var that SecuredField.ts will look for if the url
 * is running at the test port of 3024. Then SecuredField will call it's own onClickCallback - which was created to solve problems with iOS not
 * registering iframes losing focus
 */
test(
    'Test card is invalid if filled with maestro details but optional cvc field is left "in error" (partially filled) ' +
        'then test it is valid if cvc completed' +
        'then test it is valid if cvc deleted',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // generic card
        await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

        // Maestro
        await cardUtils.fillCardNumber(t, MAESTRO_CARD);
        await cardUtils.fillDate(t, TEST_DATE_VALUE);

        await t
            // maestro card icon
            .expect(brandingIcon.getAttribute('src'))
            .contains('maestro.svg')

            // with "optional" text
            .expect(cvcLabel.withExactText('CVC / CVV (optional)').exists)
            .ok()
            // and optional class
            .expect(optionalCVCSpan.exists)
            .ok();

        // Partial cvc
        await cardUtils.fillCVC(t, '73');

        await setForceClick(true);

        // Click label - to force blur event that will trigger error and reset card.isValid
        await t
            .click('.adyen-checkout__label__text')
            // Expect error
            .expect(Selector('.adyen-checkout__field--error').exists)
            .ok()
            .wait(2000);

        // Is not valid
        await t.expect(getIsValid('card')).eql(false);

        // Complete cvc
        await cardUtils.fillCVC(t, '7');

        // Is valid
        await t.expect(getIsValid('card')).eql(true);

        // Delete CVC
        await cardUtils.deleteCVC(t);

        // Is valid
        await t.expect(getIsValid('card')).eql(true);
    }
);

/**
 * Relies on same hack as above
 */
test(
    'Test card is valid if filled with maestro details but optional cvc field is left empty' +
        'then test it is invalid if cvc left in error' +
        'then test it is valid if switched to bcmc' +
        'then test it is invalid if switched back to maestro ' +
        'then test it is valid if cvc field cleared',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Maestro
        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded bcmc & maestro
        await cardUtils.fillDate(t, TEST_DATE_VALUE);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        // #1 Valid (maestro)
        await t.expect(getIsValid('card')).eql(true);

        // Partial cvc
        await cardUtils.fillCVC(t, '7');

        await setForceClick(true);

        // Click label - to force blur event that will trigger error and reset card.isValid
        await t.click('.adyen-checkout__label__text').wait(1000);

        // #2 Not valid (maestro w. cvc in error)
        await t.expect(getIsValid('card')).eql(false);

        // Click brand icons
        await t
            .click(dualBrandingIconHolderActive.find('img').nth(1))
            .expect(getPropFromPMData('brand'))
            .eql('bcmc')
            .wait(1000);

        // #3 Is valid (bcmc)
        await t.expect(getIsValid('card')).eql(true);

        // Click brand icons
        await t
            .click(dualBrandingIconHolderActive.find('img').nth(0))
            .expect(getPropFromPMData('brand'))
            .eql('maestro')
            .wait(1000);

        // #4 Not valid (maestro w. cvc in error)
        await t.expect(getIsValid('card')).eql(false);

        // Delete CVC
        await cardUtils.deleteCVC(t);

        // #5 Valid (maestro)
        await t.expect(getIsValid('card')).eql(true);
    }
);
