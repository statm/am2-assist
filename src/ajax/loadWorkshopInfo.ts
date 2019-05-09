import { getIntFromString } from '../utils';

class ScanProgressInfo {
    public id: number;
    public item: WorkshopItem | undefined;
}

export class WorkshopItem {
    public id: number;
    public name: string;
    public price: number;
}

export async function* loadWorkshopInfo(start: number, end: number) {
    let id = start;
    while (id <= end) {
        const progress = new ScanProgressInfo();
        progress.id = id;

        let pageStr = '';
        try {
            pageStr = await $.get(`/shop/enablebonus/${id}`);
        } catch (e) {
        }
        const page = $($.parseHTML(pageStr));
        const popUp = page.find('.popupMiddle');

        if (popUp.length > 0 && !popUp.text().includes('An error') && popUp.find('p').length > 1) {
            const item = new WorkshopItem();
            item.id = id;
            // tslint:disable-next-line:no-any
            item.price = getIntFromString((popUp.find('p')[0] as any).innerText.trim());
            // tslint:disable-next-line:no-any
            item.name = (popUp.find('p')[1] as any).innerText.trim();
            progress.item = item;
        }
        ++id;
        yield progress;
    }
}
