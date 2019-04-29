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
import { aircraftListStickyHeader } from './aircraftListStickyHeader';
import { duperSim } from './duperSim';
import { tcRateDisplay } from './tcRateDisplay';
import { routeFiltering } from './routeFiltering';
import { routeListStickyHeader } from './routeListStickyHeader';
import { auditPriceApplying } from './auditPriceApplying';
import { auditListEnhancement } from './auditListEnhancement';
import { playerDataCollection } from './playerDataCollection';
import { aircraftInfoCollection } from './aircraftInfoCollection';
import { workshopScan } from './workshopScan';

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
    registerPlugin(aircraftListStickyHeader);
    registerPlugin(duperSim);
    registerPlugin(tcRateDisplay);
    registerPlugin(routeFiltering);
    registerPlugin(routeListStickyHeader);
    registerPlugin(auditPriceApplying);
    registerPlugin(auditListEnhancement);
    registerPlugin(workshopScan);

    registerPlugin(playerDataCollection);
    registerPlugin(aircraftInfoCollection);
}
