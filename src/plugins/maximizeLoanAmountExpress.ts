import { Plugin } from '../plugin';
import { getIntFromElement } from '../utils';

export const maximizeLoanAmountExpress: Plugin = {
  name: 'MAXIMIZE LOAN AMOUNT (EXPRESS)',
  urlPatterns: ['finances/bank/loan/[0-9]+/express'],
  action: function() {
    $('#form_amount').val(getIntFromElement($('#loanExplanation div:nth-child(1) span')));
  },
};
