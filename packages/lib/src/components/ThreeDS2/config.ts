import { ThreeDS2FlowObject } from './types';

export const THREEDS2_FINGERPRINT = '3DS2Fingerprint';
export const THREEDS2_FINGERPRINT_ERROR = '3DS2Fingerprint_Error';
export const THREEDS2_FINGERPRINT_SUBMIT = 'callSubmit3DS2Fingerprint_Response';
export const THREEDS2_CHALLENGE = '3DS2Challenge';
export const THREEDS2_CHALLENGE_ERROR = '3DS2Challenge_Error';

export const DEFAULT_CHALLENGE_WINDOW_SIZE = '02';

export const THREEDS_METHOD_TIMEOUT = 10000;
export const CHALLENGE_TIMEOUT = 600000;

export const CHALLENGE_TIMEOUT_REJECT_OBJECT: ThreeDS2FlowObject = {
    result: {
        transStatus: 'U'
    },
    type: 'challengeResult',
    errorCode: 'timeout'
};

export const FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT: ThreeDS2FlowObject = {
    result: {
        threeDSCompInd: 'N'
    },
    type: 'fingerPrintResult',
    errorCode: 'timeout'
};

// Re. EMV 3-D Specification: EMVCo_3DS_Spec_210_1017.pdf
export const CHALLENGE_WINDOW_SIZES = {
    '01': ['250px', '400px'],
    '02': ['390px', '400px'],
    '03': ['500px', '600px'],
    '04': ['600px', '400px'],
    '05': ['100%', '100%']
};
