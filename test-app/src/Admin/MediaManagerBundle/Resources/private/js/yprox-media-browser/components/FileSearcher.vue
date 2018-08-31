<template>
  <div class="bg-success-dark padding-10">
    <div class="input-group">
      <input
        id="yprox-media-browser-search"
        :placeholder="trans('search', {}, 'mediajs')"
        :disabled="disabled"
        v-model="searchTerms"
        type="text"
        class="form-control"
        @keyup.enter="search"
      >
      <span class="input-group-btn">
        <button
          :disabled="disabled"
          class="btn btn-default"
          type="button"
          @click="search"
        >
          <span
            class="glyphicon glyphicon-search"
            aria-hidden="true"
          />
        </button>
      </span>
    </div>
  </div>
</template>

<script>
import { Translatable } from 'app';

export default {
  name: 'FileSearcher',
  mixins: [Translatable],
  props: {
    disabled: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      searchTerms: '',
    };
  },
  methods: {
    search() {
      this.$emit('search', this.searchTerms);
    },
  },
};
</script>
