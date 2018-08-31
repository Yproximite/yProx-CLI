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

const classNames = {
  root: 'fa-anchor',
  site: 'fa-sitemap',
  platform: 'fa-laptop',
};

export default {
  name: 'SiteIcon',
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
    className() {
      const type = classNames[this.site.inferredSiteType];
      const size = this.size ? `fa-${this.size}x` : '';

      return `fa ${type} ${size}`;
    },
    title() {
      return Translator.trans(this.site.inferredSiteType, {}, 'site');
    },
  },
};
</script>
