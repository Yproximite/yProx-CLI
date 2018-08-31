<template>
  <button
    :disabled="!files.length"
    type="button"
    class="btn btn-block btn-success text-uppercase"
    @click="select"
  >
    <strong>{{ trans('file.select', {}, 'mediajs') }}</strong>
  </button>
</template>

<script>
import { Translatable } from 'app';

export default {
  name: 'FileSelector',
  mixins: [Translatable],
  props: {
    files: {
      type: Array,
      required: true,
    },
  },
  methods: {
    select() {
      this.$emit('select-files');
    },
  },
};
</script>
