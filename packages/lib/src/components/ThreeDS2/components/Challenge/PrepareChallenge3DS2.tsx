import { Component, h } from 'preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import { createChallengeResolveData, prepareChallengeData, createOldChallengeResolveData, ErrorCodeObject } from '../utils';
import { PrepareChallenge3DS2Props, PrepareChallenge3DS2State } from './types';
import { ChallengeData, ThreeDS2FlowObject } from '../../types';
import '../../ThreeDS2.scss';
import Img from '../../../internal/Img';
import './challenge.scss';
import { hasOwnProperty } from '../../../../utils/hasOwnProperty';
import useImage from '../../../../core/Context/useImage';
import { ActionHandledReturnObject } from '../../../types';
import { ErrorObject } from '../../../../core/Errors/types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';
import { THREEDS2_CHALLENGE, THREEDS2_CHALLENGE_ERROR, THREEDS2_FULL, THREEDS2_NUM, MISSING_TOKEN_IN_ACTION_MSG } from '../../config';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import {
    ANALYTICS_API_ERROR,
    ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_TOKEN,
    ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_OTHER_PROPS,
    ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_ACSURL,
    ANALYTICS_ERROR_CODE_TOKEN_DECODE_OR_PARSING_FAILED
} from '../../../../core/Analytics/constants';

class PrepareChallenge3DS2 extends Component<PrepareChallenge3DS2Props, PrepareChallenge3DS2State> {
    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        onActionHandled: () => {},
        isMDFlow: false
    };

    constructor(props) {
        super(props);

        if (this.props.token) {
            const challengeData: ChallengeData | ErrorObject = prepareChallengeData({
                token: this.props.token,
                size: this.props.challengeWindowSize || this.props.size
            });

            this.state = {
                status: 'init',
                challengeData: challengeData as ChallengeData
            };
        } else {
            // Will be picked up in componentDidMount
            this.state = { challengeData: { success: false, error: MISSING_TOKEN_IN_ACTION_MSG } };

            console.debug(`${THREEDS2_CHALLENGE_ERROR}: ${MISSING_TOKEN_IN_ACTION_MSG}`);

            this.setStatusError(
                {
                    errorInfo: "Missing 'token' property from threeDS2 action"
                },
                true
            );
        }
    }

    public onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        this.props.onSubmitAnalytics({ type: THREEDS2_FULL, message: rtnObj.actionDescription });

        this.props.onActionHandled(rtnObj);
    };

    public onFormSubmit = (msg: string) => {
        this.props.onSubmitAnalytics({
            type: THREEDS2_FULL,
            message: msg
        });
    };

    componentDidMount() {
        const hasChallengeData = !('success' in this.state.challengeData && !this.state.challengeData.success);

        if (hasChallengeData) {
            /**
             * Check the structure of the created challengeData
             */
            const { acsURL } = this.state.challengeData as ChallengeData;
            const hasValidAcsURL = isValidHttpUrl(
                acsURL,
                process.env.NODE_ENV === 'development' && process.env.__CLIENT_ENV__?.indexOf('localhost:8080') > -1 // allow http urls if in development and testing against localhost:8080);
            );

            // Only render component if we have an acsURL.
            if (!hasValidAcsURL) {
                // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
                const errorCodeObject = {
                    code: ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_ACSURL,
                    errorType: ANALYTICS_API_ERROR,
                    message: `${THREEDS2_CHALLENGE_ERROR}: Decoded token is missing a valid acsURL property`,
                    metadata: { acsURL } // NEW TODO - check acsURL isn't secret
                };
                this.props.onSubmitAnalytics(errorCodeObject);

                this.setStatusError(
                    {
                        errorInfo: 'Challenge Data does not have a valid acsURL'
                    },
                    true
                );

                console.debug('### PrepareChallenge3DS2::exiting:: no valid acsURL');
                return;
            }

            const { acsTransID, messageVersion, threeDSServerTransID } = (this.state.challengeData as ChallengeData).cReqData;

            // Only render component if we have a acsTransID, messageVersion & threeDSServerTransID
            if (!acsTransID || !messageVersion || !threeDSServerTransID) {
                this.setStatusError(
                    {
                        errorInfo:
                            'Challenge Data missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)',
                        errorObj: this.state.challengeData
                    },
                    true
                );

                // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
                this.props.onSubmitAnalytics({
                    code: ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_OTHER_PROPS,
                    errorType: ANALYTICS_API_ERROR,
                    message: `${THREEDS2_CHALLENGE_ERROR}: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)`
                });
                return;
            }

            // Proceed to allow component to render
            this.setState({ status: 'performingChallenge' });
        } else {
            const errorMsg: string = (this.state.challengeData as ErrorObject).error;

            const errorCode =
                errorMsg.indexOf(MISSING_TOKEN_IN_ACTION_MSG) > -1
                    ? ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_TOKEN
                    : ANALYTICS_ERROR_CODE_TOKEN_DECODE_OR_PARSING_FAILED;

            // Send error to analytics endpoint // TODO - check logs to see if the base64 decoding errors *ever* happen
            this.props.onSubmitAnalytics({
                code: errorCode,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_CHALLENGE_ERROR}: ${errorMsg}` // can be: 'Missing "token" property from threeDS2 action', 'not base64', 'malformed URI sequence' or 'Could not JSON parse token'
            });

            console.debug('### PrepareChallenge3DS2::exiting:: no challengeData');
        }
    }

    setStatusComplete(resultObj, errorCodeObject: ErrorCodeObject = null) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the 'old',v66, flow triggered by a 'threeDS2Challenge' action (which includes the threeds2InMDFlow)
             *  than for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.useOriginalFlow ? createOldChallengeResolveData : createChallengeResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj.transStatus, this.props.paymentData);

            // TODO - do we want to know about these events (timeout or no transStatus - which are "valid" 3DS2 scenarios) from an analytics perspective, and, if so, how do we classify them? ...errors? info?
            // let analyticsObject: SendAnalyticsObject;
            // const finalResObject = errorCodeObject ? errorCodeObject : resultObj;
            // if (finalResObject.errorCode) {
            //     const errorTypeAndCode = {
            //         code: finalResObject.errorCode === 'timeout' ? ANALYTICS_ERROR_CODE_3DS2_TIMEOUT : ANALYTICS_ERROR_CODE_NO_TRANSSTATUS,
            //         errorType: finalResObject.errorCode === 'timeout' ? ANALYTICS_NETWORK_ERROR : ANALYTICS_INTERNAL_ERROR // TODO - for a timeout is this really a Network error? Or is it a "ThirdParty" error i.e. the ACS has had a problem serving the fingerprinting page in a timely manner?
            //     };
            //
            //     // Challenge process has timed out,
            //     // or, It's an error reported by the backend 'cos no transStatus could be retrieved // TODO - check logs to see if this *ever* happens
            //     analyticsObject = {
            //         event: ANALYTICS_EVENT_ERROR,
            //         message: finalResObject.message,
            //         metadata: { errorCodeObject, resultObject: resultObj }, // pass along both the full error object as well as the result object that came from the backend
            //         ...errorTypeAndCode
            //     };
            //
            //     // Send info about the error to analytics endpoint
            //     this.props.onSubmitAnalytics(analyticsObject);
            // }

            // Create log object - the process is completed, one way or another
            const analyticsObject: SendAnalyticsObject = {
                type: THREEDS2_FULL,
                message: `${THREEDS2_NUM} challenge has completed`,
                // TODO - can we use metadata for this purpose?
                metadata: { resultObject: resultObj, ...(errorCodeObject && { errorCodeObject }) } // if the challenge has concluded due to an error - also pass this information along
            };

            // Send log to analytics endpoint
            this.props.onSubmitAnalytics(analyticsObject);

            // call onComplete (equals onAdditionalDetails - except for 3DS2InMDFlow)
            this.props.onComplete(data);
        });
    }

    /**
     * Display error in the UI,
     * and, optionally, decide whether to send any of these errors to the merchant defined onError callback
     * This can be problematic in the regular flow since merchants tend to treat any calls to their onError handler as 'fatal',
     * In the MDFlow however we control what the onError handler does - so we can use the isMDFlow param, if necessary, to make this decision
     *
     * @param errorInfoObj -
     * @param isMDFlow -
     */
    setStatusError(errorInfoObj, isFatal) {
        this.setState({ status: 'error', errorInfo: errorInfoObj.errorInfo });

        // Decide whether to call this.props.onError
        if (isFatal) {
            this.props.onError(errorInfoObj); // For some reason this doesn't fire if it's in a callback passed to the setState function
        }
    }

    render(_, { challengeData }) {
        const getImage = useImage();
        if (this.state.status === 'performingChallenge') {
            return (
                <DoChallenge3DS2
                    onCompleteChallenge={(challenge: ThreeDS2FlowObject) => {
                        let errorCodeObject: ErrorCodeObject = null;

                        // Challenge has resulted in an error (no transStatus could be retrieved) - but we still treat this as a valid scenario
                        if (hasOwnProperty(challenge.result, 'errorCode') && challenge.result.errorCode.length) {
                            // Tell the merchant there's been an error
                            errorCodeObject = {
                                errorCode: challenge.result.errorCode,
                                message: `${THREEDS2_CHALLENGE_ERROR}: ${
                                    challenge.result.errorDescription ? challenge.result.errorDescription : 'no transStatus could be retrieved'
                                }`
                            };

                            /**
                             * NOTE: we can now use this.props.isMDFlow to decide if we want to send any of these errors to the onError handler
                             *  - this is problematic in the regular flow since merchants tend to treat any calls to their onError handler as 'fatal',
                             *   but in the MDFlow we control what the onError handler does.
                             */
                            if (this.props.isMDFlow) {
                                this.props.onError(errorCodeObject);
                            }
                        }

                        // Proceed with call to onAdditionalDetails (except for in 3DS2InMDFlow)
                        this.setStatusComplete(challenge.result, errorCodeObject);
                    }}
                    onErrorChallenge={(challenge: ThreeDS2FlowObject) => {
                        /**
                         * Called when challenge times-out (which is still a valid scenario)...
                         */
                        if (hasOwnProperty(challenge, 'errorCode')) {
                            const timeoutObject: ErrorCodeObject = {
                                errorCode: challenge.errorCode,
                                message: `${THREEDS2_CHALLENGE}: ${challenge.errorCode}`
                            };

                            if (this.props.isMDFlow) {
                                this.props.onError(timeoutObject);
                            }

                            this.setStatusComplete(challenge.result, timeoutObject);
                            return;
                        }
                    }}
                    {...challengeData}
                    onActionHandled={this.onActionHandled}
                    onFormSubmit={this.onFormSubmit}
                />
            );
        }

        if (this.state.status === 'error') {
            return (
                <div className="adyen-checkout__threeds2-challenge-error">
                    <Img
                        className="adyen-checkout__status__icon adyen-checkout__status__icon--error"
                        src={getImage({
                            imageFolder: 'components/'
                        })('error')}
                        alt={''}
                    />
                    <div className="adyen-checkout__status__text">
                        {this.state.errorInfo ? this.state.errorInfo : this.props.i18n.get('error.message.unknown')}
                    </div>
                </div>
            );
        }

        return null;
    }
}

export default PrepareChallenge3DS2;
