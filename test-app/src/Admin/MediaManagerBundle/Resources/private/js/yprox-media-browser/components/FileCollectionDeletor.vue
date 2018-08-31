<template>
  <div class="btn-block">
    <button
      :disabled="loading"
      type="button"
      class="btn btn-block btn-danger text-uppercase m-b-10"
      @click="deleteFile"
    >
      <strong>{{ trans(loading ? 'loading' : 'delete', {}, 'mediajs') }}</strong>
    </button>
    <div v-show="error > 0" class="text-center text-danger">{{ trans('loading_error', {}, 'mediajs') }}</div>
  </div>
</template>

<script>
import { Loadable, Translatable } from 'app';

import DeleteMultipleMediasMutation from '../graphql/mutations/deleteMultipleMedias.graphql';

export default {
  name: 'FileCollectionDeletor',
  mixins: [
    Translatable,
    Loadable,
  ],
  props: {
    siteId: {
      type: Number,
      required: true,
    },
    files: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getLoader() {
      return this.$graphql(DeleteMultipleMediasMutation, {
        input: {
          medias: this.files.map(file => file.id),
        },
      });
    },
    deleteFile() {
      if (!global.confirm(this.trans('are_you_sure', {}, 'mediajs'))) {
        return;
      }

      this.load().then(() => {
        this.$emit('delete-file');
      });
    },
  },
};
</script>
