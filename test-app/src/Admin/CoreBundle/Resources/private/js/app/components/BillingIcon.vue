<template>
  <div style="position: relative; overflow: visible">
    <tooltip>
      <span slot="content">{{ title }}</span>
      <i :class="className"/>
    </tooltip>
  </div>
</template>

<script>
import Translator from 'translator';

const statuses = [
  'test',
  'trial',
  'free',
  'partner',
  'direct',
  'in-development',
  'waiting-subscription',
  'error',
  'canceled',
  'paying',
  'form-without-payment',
];

const defaultStatus = 'paying';

const classNames = {
  test: 'fa-binoculars',
  trial: 'fa-calendar',
  free: 'fa-heart',
  partner: 'fa-street-view',
  direct: 'fa-eur',
  'in-development': 'fa-cogs',
  'waiting-subscription': 'fa-pause',
  error: 'fa-exclamation',
  canceled: 'fa-ban',
  paying: 'fa-eur',
  'form-without-payment': 'fa-gift',
};

export default {
  name: 'BillingIcon',
  props: {
    site: {
      type: Object,
      required: true,
    },
    size: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    billingStatus() {
      return statuses.includes(this.site.billingStatus)
        ? this.site.billingStatus
        : defaultStatus;
    },
    className() {
      const type = classNames[this.billingStatus];
      const size = this.size ? `fa-${this.size}x` : '';
      return `fa ${type} ${size}`;
    },
    title() {
      return Translator.trans(`billing_status_${this.billingStatus}`, {}, 'site');
    },
  },
};
</script>
