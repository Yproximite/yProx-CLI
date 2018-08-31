<template>
  <div style="position: relative; overflow: visible">
    <tooltip :placement="tooltipPlacement">
      <span slot="content">{{ title }}</span>
      <i :class="classes" class="fa fa-circle"/>
    </tooltip>
  </div>
</template>

<script>
import Translator from 'translator';

export default {
  name: 'SiteIndexationBadge',
  props: {
    indexed: {
      type: Boolean,
      default: null,
    },
    indexations: {
      type: Array,
      required: true,
    },
    tooltipPlacement: {
      type: String,
      default: 'top',
    },
  },
  computed: {
    classes() {
      return {
        'text-success': this.indexed === true,
        'text-danger': this.indexed === false,
      };
    },
    title() {
      if (this.indexations.length === 0) {
        return Translator.trans('site_indexation_badge.no_check_was_made', {}, 'sitejs');
      }

      const lastIndexation = this.indexations[this.indexations.length - 1];
      const createdAtDate = new Date(lastIndexation.createdAt);

      return Translator.trans('site_indexation_badge.last_check_at', { date: createdAtDate.toLocaleString() }, 'sitejs');
    },
  },
};
</script>
