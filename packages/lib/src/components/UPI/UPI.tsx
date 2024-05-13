import { h, RefObject } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import UPIComponent from './components/UPIComponent';
import { CoreProvider } from '../../core/Context/CoreProvider';
import Await from '../internal/Await';
import QRLoader from '../internal/QRLoader';
import { UPIConfiguration, UpiMode, UpiPaymentData, UpiSubTxVariant } from './types';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import { TxVariants } from '../tx-variants';
import type { ICore } from '../../core/types';
import isMobile from '../../utils/isMobile';

class UPI extends UIElement<UPIConfiguration> {
    public static type = TxVariants.upi;
    public static txVariants = [TxVariants.upi, TxVariants.upi_qr, TxVariants.upi_collect, TxVariants.upi_intent];
    private selectedMode: UpiMode;

    constructor(checkout: ICore, props: UPIConfiguration) {
        super(checkout, props);
        this.selectedMode = this.props.defaultMode;
    }

    formatProps(props: UPIConfiguration) {
        if (!isMobile()) {
            return {
                ...super.formatProps(props),
                defaultMode: props?.defaultMode ?? UpiMode.QrCode,
                // For large screen, ignore the apps
                apps: []
            };
        }

        const hasIntentApps = props.apps?.length > 0;
        const fallbackDefaultMode = hasIntentApps ? UpiMode.Intent : UpiMode.Vpa;
        const allowedModes = [fallbackDefaultMode, UpiMode.QrCode];
        const upiCollectApp = {
            id: UpiMode.Vpa,
            name: props.i18n.get('upi.collect.dropdown.label'),
            type: UpiSubTxVariant.UpiCollect
        };
        const apps = hasIntentApps ? [...props.apps.map(app => ({ ...app, type: UpiSubTxVariant.UpiIntent })), upiCollectApp] : [];
        return {
            ...super.formatProps(props),
            defaultMode: allowedModes.includes(props?.defaultMode) ? props.defaultMode : fallbackDefaultMode,
            apps
        };
    }

    public get isValid(): boolean {
        return this.state.isValid;
    }

    public formatData(): UpiPaymentData {
        if (this.selectedMode === UpiMode.QrCode) {
            return {
                paymentMethod: {
                    type: UpiSubTxVariant.UpiQr
                }
            };
        }

        const { virtualPaymentAddress, app } = this.state.data;
        const type = this.selectedMode === UpiMode.Vpa ? UpiSubTxVariant.UpiCollect : app?.type;
        return {
            paymentMethod: {
                ...(type && { type }),
                ...(type === UpiSubTxVariant.UpiCollect && virtualPaymentAddress && { virtualPaymentAddress }),
                ...(type === UpiSubTxVariant.UpiIntent && app?.id && { appId: app.id })
            }
        };
    }

    private onUpdateMode = (mode: UpiMode): void => {
        this.selectedMode = mode;
    };

    private renderContent(type: string): h.JSX.Element {
        switch (type) {
            case 'qrCode':
                return (
                    <QRLoader
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        {...this.props}
                        qrCodeData={this.props.qrCodeData ? encodeURIComponent(this.props.qrCodeData) : null}
                        type={TxVariants.upi_qr}
                        brandLogo={this.props.brandLogo || this.icon}
                        onComplete={this.onComplete}
                        introduction={this.props.i18n.get('upi.qrCodeWaitingMessage')}
                        countdownTime={5}
                        onActionHandled={this.props.onActionHandled}
                    />
                );
            case 'await':
                return (
                    <Await
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        onError={this.props.onError}
                        clientKey={this.props.clientKey}
                        paymentData={this.props.paymentData}
                        onComplete={this.onComplete}
                        brandLogo={this.icon}
                        type={TxVariants.upi_collect}
                        messageText={this.props.i18n.get('upi.vpaWaitingMessage')}
                        awaitText={this.props.i18n.get('await.waitForConfirmation')}
                        showCountdownTimer
                        countdownTime={5}
                        onActionHandled={this.props.onActionHandled}
                    />
                );
            default:
                return (
                    <UPIComponent
                        ref={(ref: RefObject<typeof UPIComponent>) => {
                            this.componentRef = ref;
                        }}
                        payButton={this.payButton}
                        onChange={this.setState}
                        onUpdateMode={this.onUpdateMode}
                        apps={this.props.apps}
                        defaultMode={this.props.defaultMode}
                        showPayButton={this.props.showPayButton}
                    />
                );
        }
    }

    public render(): h.JSX.Element {
        const { type } = this.props;
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>{this.renderContent(type)}</SRPanelProvider>
            </CoreProvider>
        );
    }
}

export default UPI;
