import { UIElementProps } from '../internal/UIElement/types';
import { TxVariants } from '../tx-variants';

export type UpiPaymentData = {
    paymentMethod: {
        type: UpiSubTxVariant;
        virtualPaymentAddress?: string;
        appId?: string;
    };
};

export enum UpiMode {
    Vpa = 'vpa',
    QrCode = 'qrCode',
    Intent = 'intent'
}

export enum UpiSubTxVariant {
    UpiCollect = TxVariants.upi_collect,
    UpiQr = TxVariants.upi_qr,
    UpiIntent = TxVariants.upi_intent
}

export type App = { id: string; name: string; type?: UpiSubTxVariant };

export interface UPIConfiguration extends UIElementProps {
    defaultMode?: UpiMode;
    // upi_intent
    apps?: Array<App>;
    // Await
    paymentData?: string;
    // QR code
    qrCodeData?: string;
    brandLogo?: string;
}
