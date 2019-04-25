import { getIntFromString, getAircraftInfo } from '../utils';

export async function loadWorkshopInfo(start: number, end: number) {
    const workshopInfo = [];
    let id = start;
    while (id <= end) {
        let pageStr = "";
        try {
            pageStr = await $.get(`/shop/enablebonus/${id}`);
        } catch (e) {
        }
        const page = $($.parseHTML(pageStr));
        let popUp = page.find(".popupMiddle");
        if (popUp.length > 0 && !popUp.text().includes("An error") && popUp.find("p").length > 1) {
            const tcPrice = getIntFromString((popUp.find("p")[0] as any).innerText.trim());
            const itemName = (popUp.find("p")[1] as any).innerText.trim();
            let tcRate = 0;
            if (itemName.startsWith("Tax")) {
                //
            }
            else if (itemName.startsWith("Aircraft")) {
                let aircraft = getAircraftInfo(itemName.replace("Aircraft ", ""));
                if (aircraft) {
                    tcRate = getAircraftInfo(itemName.replace("Aircraft ", ""))!.price / tcPrice / 1000;
                }
            } else if (itemName.endsWith(" $")) {
                let money = getIntFromString(itemName);
                tcRate = money / tcPrice / 1000;
            }
            workshopInfo.push({ id, tcPrice, itemName, tcRate });
        }
        ++id;
    }
    return workshopInfo.sort((a, b) => a.id - b.id);
}
