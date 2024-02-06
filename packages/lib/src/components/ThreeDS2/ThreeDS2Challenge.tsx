import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PrepareChallenge from './components/Challenge';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from './config';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import { TxVariants } from '../tx-variants';
import { ThreeDS2ChallengeConfiguration } from './types';
import AdyenCheckoutError, { API_ERROR } from '../../core/Errors/AdyenCheckoutError';

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeConfiguration> {
    public static type = TxVariants.threeDS2Challenge;

    public static defaultProps = {
        dataKey: 'threeDSResult',
        size: DEFAULT_CHALLENGE_WINDOW_SIZE,
        type: 'ChallengeShopper'
    };

    onComplete(state) {
        if (state) super.onComplete(state);
        this.unmount(); // re. fixing issue around back to back challenge calls
    }

    render() {
        // existy used because threeds2InMDFlow will send empty string for paymentData and we should be allowed to proceed with this
        if (!existy(this.props.paymentData)) {
            /**
             *   The presence of props.isMDFlow indicates the action to create this component came from the threeds2InMDFlow process which passes (an empty) paymentsData.
             *   The regular, "native" flow uses the authorisationToken from the 3DS2 action, which actionTypes.ts assigns to a property called paymentData
             */
            const dataTypeForError = hasOwnProperty(this.props, 'isMDFlow') ? 'paymentData' : 'authorisationToken';

            this.props.onError(new AdyenCheckoutError(API_ERROR, `No ${dataTypeForError} received. 3DS2 Challenge cannot proceed`));
            return null;
        }

        return <PrepareChallenge {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2Challenge;
