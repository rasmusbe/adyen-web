import { h } from 'preact';
import UIElement from '../UIElement';
import PrepareChallenge from './components/Challenge';
import { ErrorCodeObject } from './components/utils';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_CHALLENGE_ERROR } from './config';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import Language from '../../language';
import { ActionHandledReturnObject } from '../types';
import { ANALYTICS_API_ERROR, ANALYTICS_ACTION_ERROR, ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA } from '../../core/Analytics/constants';
import { AnalyticsObject } from '../../core/Analytics/types';
import { createAnalyticsObject } from '../../core/Analytics/utils';

export interface ThreeDS2ChallengeProps {
    token?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorCodeObject) => void;
    paymentData?: string;
    size?: string;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
    type?: string;
    loadingContext?: string;
    useOriginalFlow?: boolean;
    i18n?: Language;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
}

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeProps> {
    public static type = 'threeDS2Challenge';

    public static defaultProps = {
        dataKey: 'threeDSResult',
        size: DEFAULT_CHALLENGE_WINDOW_SIZE,
        type: 'ChallengeShopper'
    };

    submitAnalytics(aObj) {
        const analyticsObj: AnalyticsObject = createAnalyticsObject({ ...aObj, component: ThreeDS2Challenge.type });

        console.log('### ThreeDS2Challenge::submitAnalytics:: analyticsObj', analyticsObj);

        // TODO based on aObj.class decide how to send this object to the analytics queue
    }

    onComplete(state) {
        if (state) super.onComplete(state);
        this.unmount(); // re. fixing issue around back to back challenge calls
    }

    render() {
        // existy used because threeds2InMDFlow will send empty string for paymentData and we should be allowed to proceed with this
        if (!existy(this.props.paymentData)) {
            /**
             *  One component is used for both old and new 3DS2 challenge flows
             *   - The presence of useOriginalFlow indicates the old flow which used paymentData from the 3DS2 action
             *   - The new flow uses authorisationToken from the 3DS2 action, passed internally in a prop called paymentData
             */
            const dataTypeForError = hasOwnProperty(this.props, 'useOriginalFlow') ? 'paymentData' : 'authorisationToken';

            this.props.onError({ errorCode: 'threeds2.challenge', message: `No ${dataTypeForError} received. Challenge cannot proceed` });

            this.submitAnalytics({
                class: ANALYTICS_ACTION_ERROR,
                code: ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`
            });

            return null;
        }

        return (
            <PrepareChallenge
                {...this.props}
                onComplete={this.onComplete}
                onSubmitAnalytics={this.submitAnalytics}
                isMDFlow={this.props.paymentData.length < 15}
            />
        );
    }
}

export default ThreeDS2Challenge;
