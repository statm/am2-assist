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
import { aircraftFiltering } from './aircraftFiltering';
import { aircraftPurchaseListStickyHeader } from './aircraftPurchaseListStickyHeader';
import { duperSim } from './duperSim';
import { tcRateDisplay } from './tcRateDisplay';
import { routeFiltering } from './routeFiltering';
import { routePurchaseListStickyHeader } from './routePurchaseListStickyHeader';
import { auditPriceApplying } from './auditPriceApplying';
import { auditListEnhancement } from './auditListEnhancement';
import { playerDataCollection } from './playerDataCollection';
import { aircraftInfoCollection } from './aircraftInfoCollection';
import { workshopScan } from './workshopScan';
import { aircraftListProDisplay } from './aircraftListProDisplay';
import { routeListProDisplay } from './routeListProDisplay';

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
    registerPlugin(aircraftFiltering);
    registerPlugin(aircraftPurchaseListStickyHeader);
    registerPlugin(duperSim);
    registerPlugin(tcRateDisplay);
    registerPlugin(routeFiltering);
    registerPlugin(routePurchaseListStickyHeader);
    registerPlugin(auditPriceApplying);
    registerPlugin(auditListEnhancement);
    registerPlugin(workshopScan);
    registerPlugin(aircraftListProDisplay);
    registerPlugin(routeListProDisplay);

    registerPlugin(playerDataCollection);
    registerPlugin(aircraftInfoCollection);
}
