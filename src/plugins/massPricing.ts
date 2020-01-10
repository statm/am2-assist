import { Plugin } from '../plugin';
import { isAMPlus, assert, sleep } from '../utils';

function resetStatusIcons() {
  $('.mpStatusIcon').remove();
  $('td.reliability')
    .next()
    .each(function() {
      const lineId = $(this)
        .find('a')
        .attr('href')!
        .split('/')[3];
      const statusIcon = $(
        `<img id="mpStatus${lineId}" class="mpStatusIcon" src="//i.imgur.com/pDMku5j.gif" width="16" height="16"/>`,
      );
      $(this)
        .css({ width: 74, paddingLeft: 3 })
        .append(statusIcon);
    });
}

async function adjustUI() {
  const table = $('#auditDashboard .internalAuditTable');
  table.css({ marginTop: 0 });
  if (!(await isAMPlus())) {
    $('table.internalAuditTable tbody tr:not([id])').hide();
    $('table.internalAuditTable tbody tr').height(28);
  } else {
    table.find('td:nth-child(2), th:nth-child(2)').css({ width: 103 });
    table.find('td:nth-child(3), th:nth-child(3)').css({ width: 118 });
    table.find('td:nth-child(4), th:nth-child(4)').css({ width: 128 });
    table.find('td:nth-child(5), th:nth-child(5)').css({ width: 108 });
  }

  const massPricingPanel = $(`
        <div>
            <a id="mpStartButton" href="#" class="validBtnBlue" style="position: unset; top: unset; left: unset; width: unset">
                Mass pricing
            </a>
            <span id="mpStatusText" style="padding-left: 5px"/>
        </div>
    `);

  $('div.lineFilter').after(massPricingPanel);
}

async function loadNextDayTurnover() {
  const financePanelResp = await fetch('/financePanel/');
  if (financePanelResp.status !== 200) {
    return 0;
  } else {
    const financePanelJson = await financePanelResp.json();
    return financePanelJson.tomorrow[0] as number;
  }
}

async function extractToken(line: string) {
  const priceResp = await fetch(`/marketing/pricing/${line}`);
  if (priceResp.status !== 200) {
    return undefined;
  }
  const pricePageHtml = await priceResp.text();
  const pricePage = $($.parseHTML(pricePageHtml));
  const token = pricePage.find('#line__token');
  if (token.length === 0) {
    return undefined;
  } else {
    assert(token.length === 1);
    assert(token.attr('value'));
    return token.attr('value');
  }
}

async function startMassPricing() {
  const currentTurnover = await loadNextDayTurnover();

  const linesToScan: string[] = [];
  $('table.internalAuditTable tr[id]').each(function() {
    linesToScan.push($(this).attr('id')!);
  });

  let total = 0;

  for (const line of linesToScan) {
    const token = await extractToken(line);
    if (!token) {
      updateStatus(line, false);
      continue;
    }

    const auditResp = await fetch(`/marketing/internalaudit/line/${line}`);
    if (auditResp.status !== 200) {
      updateStatus(line, false);
      continue;
    }

    const { priceEco, priceBus, priceFirst, priceCargo } = await auditResp.json();

    await sleep(5000);

    const priceUpdateFormData = new FormData();
    priceUpdateFormData.append('line[priceEco]', priceEco);
    priceUpdateFormData.append('line[priceBus]', priceBus);
    priceUpdateFormData.append('line[priceFirst]', priceFirst);
    priceUpdateFormData.append('line[priceCargo]', priceCargo);
    priceUpdateFormData.append('line[_token]', token);

    const priceUpdateResp = await fetch(`/marketing/pricing/${line}`, {
      method: 'POST',
      body: priceUpdateFormData,
    });
    if (priceUpdateResp.status !== 200) {
      updateStatus(line, false);
      continue;
    }

    updateStatus(line, true);
  }

  const newTurnover = await loadNextDayTurnover();
  $('#mpStatusText').html(
    `Old turnover: <b>${currentTurnover.toLocaleString()} $</b>, new turnover: <b>${newTurnover.toLocaleString()} $</b>`,
  );

  function updateStatus(line: string, successful: boolean) {
    ++total;
    $('#mpStatusText').html(`Scanning: <b>${total}/${linesToScan.length}</b>`);
    $(`#mpStatus${line}`).attr(
      'src',
      successful ? '//i.imgur.com/5A3tGvf.png' : '//i.imgur.com/9jIoF80.jpg',
    );
  }
}

export const massPricing: Plugin = {
  name: 'MASS PRICING',
  urlPatterns: ['marketing/internalaudit/linelist[^/]*'],
  action: async function() {
    await adjustUI();

    $('#mpStartButton').click(function() {
      resetStatusIcons();
      startMassPricing();
      return false;
    });
  },
};
