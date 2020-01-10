import { getIntFromElement } from '../utils';

export function loadStructuralProfit(companyName: string) {
  return $.get(`/company/ranking/?searchTerm=${companyName}`).then(function(data) {
    const rankingBox = $($.parseHTML(data)).find(`div.box1:contains("${companyName}") .underBox4`);
    if (rankingBox.length === 0) {
      return;
    }
    return getIntFromElement(rankingBox);
  });
}
