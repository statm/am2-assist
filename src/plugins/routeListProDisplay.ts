import { Plugin } from '../plugin';
import { assert, isAMPlus } from '../utils';

class HubInfo {
  public isShared: boolean;
  public name: string;
  public flag: string;
  public turnover: string;
  public result: string;
  public performance: string;
  public detailsUrl: string;
}

class RouteInfo {
  public isShared: boolean;
  public from: string;
  public to: string;
  public flag: string;
  public distance: string;
  public remainingOffer: string;
  public turnover: string;
  public profits: string;
  public performance: string;
  public detailsUrl: string;
}

function extractInfo(): [Array<HubInfo>, Array<RouteInfo>] {
  const hubs: Array<HubInfo> = [];
  const hubBoxes = $('div#displayRegular div.hubListBox');
  hubBoxes.each(function() {
    const hub = $(this);
    const info = new HubInfo();

    info.isShared = hub.attr('title') !== undefined;
    info.name = hub
      .find('div.hubListBoxTitle > i')
      .get(0)
      .previousSibling!.nodeValue!.trim()
      .split(' ')[0];
    info.flag = hub
      .find('div.hubListBoxTitle > img')
      .last()
      .get(0).outerHTML;
    info.detailsUrl = hub.find('div.hubListBoxTitle > a').attr('href')!;
    info.turnover = hub.find('div.content > div.hubListBoxLists li:eq(0) b').text();
    info.result = hub.find('div.content > div.hubListBoxLists li:eq(1) b').text();
    info.performance = hub.find('div.content > img').get(0).outerHTML;

    hubs.push(info);
  });

  const routes: Array<RouteInfo> = [];
  const routeBoxes = $('div#displayRegular div.lineListBox');
  routeBoxes.each(function() {
    const box = $(this);
    const info = new RouteInfo();

    info.isShared = box.attr('title') !== undefined;
    info.from = box.find('div.title > span.grey').text();
    info.to = box
      .find('div.title > span.grey')
      .get(0)
      .nextSibling!.nodeValue!.replace('/', '')
      .trim()
      .split(' ')[0];
    info.flag = box.find('div.title > img').get(0).outerHTML;
    info.detailsUrl = box.find('div.title > a').attr('href')!;
    info.distance = box.find('li.li1 b').text();
    info.remainingOffer = box
      .find('li.li2 b')
      .text()
      .trim();
    info.turnover = box.find('li.li3 b').text();
    info.profits = box.find('li.li4 b').text();
    info.performance = box.find('div.content > img').get(0).outerHTML;

    routes.push(info);
  });

  return [hubs, routes];
}

function constructTables(hubs: Array<HubInfo>, routes: Array<RouteInfo>): JQuery<HTMLElement> {
  const result = $(`
        <div id="displayPro">
            <table>
                <tbody>
                    <tr>
                        <th class="tableString"><span class="hubBtn">Hub</span></th>
                        <th><span class="blueBtn">Leadership</span></th>
                        <th><span class="blueBtn">Alliance leader</span></th>
                        <th><span class="blueBtn" title="D-1">Turnover</span></th>
                        <th><span class="blueBtn" title="D-1">Result</span></th>
                        <th><span class="blueBtn" title="D-1">Performance</span></th>
                        <th style="width: 60px;"></th>
                    </tr>
                </tbody>
            </table>
            <br>
            <br>
            <table>
                <tbody>
                    <tr>
                        <th class="tableString"><span class="blueBtn">Route</span></th>
                        <th><span class="blueBtn">Distance</span></th>
                        <th><span class="blueBtn" title="D-1">Remaining demand</span></th>
                        <th><span class="blueBtn" title="D-1">Turnover</span></th>
                        <th><span class="blueBtn" title="D-1">Result</span></th>
                        <th><span class="blueBtn" title="D-1">Performance</span></th>
                        <th style="width: 60px;"></th>
                    </tr>
                </tbody>
            </table>
        </div>
    `);
  const hubTable = result.find('tbody:eq(0)');
  hubs.forEach((hub: HubInfo, index: number) => {
    const row = $(`
            <tr${index % 2 === 1 ? ' class="rowB"' : ''}>
                <td class="tableString">
                    <div class="fixedwidth25 fll">
                        ${
                          hub.isShared
                            ? '<img src="/images/icons20/alliance_hubSharing.png?v1.6.11">'
                            : '&nbsp;'
                        }
                    </div>
                    <div class="fll">
                        ${hub.name} / ${hub.flag}
                    </div>
                </td>
                <td> - </td>
                <td> - </td>
                <td>${hub.turnover}</td>
                <td>${hub.result}</td>
                <td>
                    ${hub.performance}
                </td>
                <td>
                    <a href="${
                      hub.detailsUrl
                    }" title="Hub details"><img src="/images/icons20/network_showHub.png?v1.6.11"></a>
                </td>
            </tr>
        `);
    hubTable.append(row);
  });

  const routeTable = result.find('tbody:eq(1)');
  routes.forEach((route: RouteInfo, index: number) => {
    const row = $(`
            <tr${index % 2 === 1 ? ' class="rowB"' : ''}>
                <td class="tableString">
                    <div class="fixedwidth25 fll">
                        ${
                          route.isShared
                            ? '<img src="/images/icons20/alliance_hubSharing.png?v1.6.11">'
                            : '&nbsp;'
                        }
                    </div>
                    ${route.from} / ${route.to} ${route.flag}
                </td>
                <td>${route.distance}</td>
                <td>${route.remainingOffer}</td>
                <td>${route.turnover}</td>
                <td>${route.profits}</td>
                <td>
                    ${route.performance}
                </td>
                <td>
                    <a href="${
                      route.detailsUrl
                    }" title="Route details"><img src="/images/icons20/network_showLine.png?v1.6.11"></a>
                </td>
            </tr>
        `);
    routeTable.append(row);
  });

  // Re-apply tooltips
  result.find('[title]').tooltip({
    position: {
      my: 'center center',
      at: 'center top-10',
    },
  });

  return result;
}

export const routeListProDisplay: Plugin = {
  name: 'ROUTE LIST PRO DISPLAY',
  urlPatterns: ['network/'],
  action: async function() {
    const tableCount = $('div#displayPro').length;
    assert(tableCount === 0 || tableCount === 1);
    const isInProDisplay = tableCount === 1;

    // Construct and display pro table
    if (!isInProDisplay) {
      const [hubs, routes] = extractInfo();
      const proDisplayTables = constructTables(hubs, routes);
      $('div#displayRegular').replaceWith(proDisplayTables);
    }

    // Remove view switch button
    if (await isAMPlus()) {
      if (isInProDisplay) {
        $('img#displayMode')
          .parent()
          .remove();
      }
    } else {
      $('a#displayMode').remove();
      $('div#popupAmPlusSubscribe').remove();
    }

    // UI tweaks
    $('form#map_options').css('margin-bottom', 0);
  },
};
