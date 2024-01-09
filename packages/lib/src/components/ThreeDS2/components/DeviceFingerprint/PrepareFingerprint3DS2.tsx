import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, handleErrorCode, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject, ThreeDS2AnalyticsObject } from '../../types';
import { ActionHandledReturnObject } from '../../../types';
import { ANALYTICS_ACTION_LOG } from '../../../../core/Analytics/constants';
import { THREEDS2_FULL } from '../../config';

class PrepareFingerprint3DS2 extends Component<PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State> {
    public static type = 'scheme';

    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        paymentData: '',
        showSpinner: true,
        onActionHandled: () => {}
    };

    constructor(props) {
        super(props);

        const { token, notificationURL } = this.props; // See comments on prepareFingerPrintData regarding notificationURL

        if (token) {
            const fingerPrintData: FingerPrintData = prepareFingerPrintData({ token, notificationURL });

            this.state = {
                status: 'init',
                fingerPrintData
            };
        } else {
            this.state = { status: 'error' };
            // TODO - confirm that we should do this, or is it possible to proceed to the challenge anyway?
            //  ...in which case we should console.debug the error object and then call: this.setStatusComplete({ threeDSCompInd: 'N' });
            this.props.onError({
                errorCode: this.props.dataKey,
                message: 'Missing fingerprintToken parameter'
            });
        }
    }

    public submitAnalytics = (what: ThreeDS2AnalyticsObject) => {
        console.log('### PrepareFingerprint3DS2::submitAnalytics:: what', what);
        this.props.onSubmitAnalytics(what);
    };

    public onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        // Leads to an "iframe loaded" log action
        this.submitAnalytics({ action: ANALYTICS_ACTION_LOG, type: THREEDS2_FULL, message: rtnObj.actionDescription });
        this.props.onActionHandled(rtnObj);
    };

    public onFormSubmit = (msg: string) => {
        this.submitAnalytics({
            action: ANALYTICS_ACTION_LOG,
            type: THREEDS2_FULL,
            message: msg
        } as ThreeDS2AnalyticsObject);
    };

    componentDidMount() {
        // If no fingerPrintData or no threeDSMethodURL - don't render component. Instead exit with threeDSCompInd: 'U'
        if (!this.state.fingerPrintData || !this.state.fingerPrintData.threeDSMethodURL) {
            this.setStatusComplete({ threeDSCompInd: 'U' });
            console.debug('### PrepareFingerprint3DS2::exiting:: no fingerPrintData or no threeDSMethodURL');
            return;
        }

        // Render
        this.setState({ status: 'retrievingFingerPrint' });
    }

    setStatusComplete(resultObj: ResultObject) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the endpoint expects:
             *  - this will be the /details endpoint for the 'old', v66, flow triggered by a 'threeDS2Fingerprint' action
             *  - and will be the /submitThreeDS2Fingerprint endpoint for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.useOriginalFlow ? createOldFingerprintResolveData : createFingerprintResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj, this.props.paymentData);

            /**
             * For 'threeDS2' action = call to callSubmit3DS2Fingerprint
             * For 'threeDS2Fingerprint' action = equals call to onAdditionalDetails (except for in 3DS2InMDFlow)
             */
            this.props.onComplete(data);
        });
    }

    render({ showSpinner }, { status, fingerPrintData }) {
        if (status === 'retrievingFingerPrint') {
            return (
                <DoFingerprint3DS2
                    onCompleteFingerprint={fingerprint => {
                        this.setStatusComplete(fingerprint.result);
                    }}
                    onErrorFingerprint={fingerprint => {
                        /**
                         * Called when fingerprint times-out (which is still a valid scenario)...
                         */
                        const errorCodeObject = handleErrorCode(fingerprint.errorCode);
                        console.debug('### PrepareFingerprint3DS2::fingerprint timed-out:: errorCodeObject=', errorCodeObject);
                        this.setStatusComplete(fingerprint.result);
                    }}
                    showSpinner={showSpinner}
                    {...fingerPrintData}
                    onActionHandled={this.onActionHandled}
                    onFormSubmit={this.onFormSubmit}
                />
            );
        }

        return null;
    }
}

export default PrepareFingerprint3DS2;
