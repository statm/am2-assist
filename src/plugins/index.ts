import { registerPlugin } from '../plugin';

import { skipLoadingScreen } from './skipLoadingScreen';
import { slotMachineAutomation } from './slotMachineAutomation';
import { unfoldAgenda } from './unfoldAgenda';
import { starProgressBar } from './starProgressBar';
import { enhanceAircraftProfibilityDetail } from './aircraftProfibilityDetail';
import { reconfigurationAssist } from './reconfigurationAssist';
import { maximizeLoanAmountFM } from './maximizeLoanAmountFM';
import { maximizeLoanAmountExpress } from './maximizeLoanAmountExpress';
import { pricePerSeat } from './pricePerSeat';
import { aircraftPurchaseListStickyHeader } from './aircraftPurchaseListStickyHeader';
import { duperSim } from './duperSim';
import { routePurchaseListStickyHeader } from './routePurchaseListStickyHeader';
import { auditPriceApplying } from './auditPriceApplying';
import { auditListEnhancement } from './auditListEnhancement';
import { aircraftListProDisplay } from './aircraftListProDisplay';
import { routeListProDisplay } from './routeListProDisplay';
import { workshopScan } from './workshopScan';
import { collectDeliveries } from './collectDeliveries';
import { massPricing } from './massPricing';
import { paxDisplay } from './paxDisplay';

export function registerAllPlugins() {
    registerPlugin(slotMachineAutomation);
    registerPlugin(unfoldAgenda);
    registerPlugin(skipLoadingScreen);
    registerPlugin(starProgressBar);
    registerPlugin(enhanceAircraftProfibilityDetail);
    registerPlugin(reconfigurationAssist);
    registerPlugin(maximizeLoanAmountFM);
    registerPlugin(maximizeLoanAmountExpress);
    registerPlugin(pricePerSeat);
    registerPlugin(aircraftPurchaseListStickyHeader);
    registerPlugin(duperSim);
    registerPlugin(routePurchaseListStickyHeader);
    registerPlugin(auditPriceApplying);
    registerPlugin(auditListEnhancement);
    registerPlugin(aircraftListProDisplay);
    registerPlugin(routeListProDisplay);
    registerPlugin(workshopScan);
    registerPlugin(collectDeliveries);
    registerPlugin(massPricing);
    registerPlugin(paxDisplay);

    // dev purpose only
    // registerPlugin(playerDataCollection);
    // registerPlugin(aircraftInfoCollection);
}
