import { Plugin } from '../plugin';

export const maximizeLoanAmountFM: Plugin = {
  name: 'MAXIMIZE LOAN AMOUNT (FM)',
  urlPatterns: ['finances/bank/[0-9]+/stockmarket/request'],
  action: function() {
    $('#request_amount').val($('#request_amount').attr('data-amount')!);
  },
};
