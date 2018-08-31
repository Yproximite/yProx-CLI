<template>
  <ul :class="className">
    <li v-show="first" :class="{disabled: page === 1}">
      <a href="#" @click.prevent="select(1)">
        <slot name="first">&laquo;</slot>
      </a>
    </li>
    <li v-show="prev" :class="{disabled: page === 1}">
      <a href="#" @click.prevent="select(page - 1)">
        <slot name="prev">&lsaquo;</slot>
      </a>
    </li>
    <li v-for="i in visiblePages" :key="i" :class="{disabled: i === -1 || page === i}">
      <a v-if="i !== -1" href="#" @click.prevent="select(i)">
        {{ i }}
      </a>
      <span v-else>
        <slot name="ellipsis">&hellip;</slot>
      </span>
    </li>
    <li v-show="next" :class="{disabled: page >= pagesCount}">
      <a href="#" @click.prevent="select(page + 1)">
        <slot name="next">&rsaquo;</slot>
      </a>
    </li>
    <li v-show="last" :class="{disabled: page >= pagesCount}">
      <a href="#" @click.prevent="select(pagesCount)">
        <slot name="last">&raquo;</slot>
      </a>
    </li>
  </ul>
</template>

<script>
import Paginable from '../mixins/Paginable';

export default {
  name: 'Pagination',
  mixins: [Paginable],
  props: {
    className: {
      type: [String, Array, Object],
      default: 'pagination',
    },
  },
};
</script>
