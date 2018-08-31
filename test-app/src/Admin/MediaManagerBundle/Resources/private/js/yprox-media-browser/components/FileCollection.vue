<template>
  <div>
    <h5 class="text-uppercase">
      <strong>{{ trans('multiple_items', {}, 'mediajs') }}</strong>
    </h5>
    <ul>
      <li v-for="file in files" :key="file.id" v-html="file.originalFilenameSlugged"/>
    </ul>
    <div class="form-group">
      <label for="yprox-media-browser-files-category">{{ trans('file.props.category', {}, 'mediajs') }}</label>
      <select id="yprox-media-browser-files-category" v-model="categoryId" class="form-control">
        <option :value="0">..</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.title }}</option>
      </select>
    </div>
    <div>
      <button
        :disabled="!categoryId || loading"
        type="button"
        class="btn btn-block btn-complete text-uppercase"
        @click="move"
      >
        <strong>{{ trans(loading ? 'loading' : 'move', {}, 'mediajs') }}</strong>
      </button>
      <div v-show="error === 0" class="text-center text-muted">{{ trans('saved', {}, 'mediajs') }}</div>
      <div v-show="error > 0" class="text-center text-danger">{{ trans('loading_error', {}, 'mediajs') }}</div>
    </div>
    <hr>
  </div>
</template>

<script>
import { Loadable, Translatable } from 'app';
import BulkUpdateMediasMutation from '../graphql/mutations/updateMultipleMedias.graphql';

export default {
  name: 'FileCollection',
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
    categories: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      categoryId: 0,
    };
  },
  methods: {
    getLoader() {
      return this.$graphql(BulkUpdateMediasMutation, {
        siteId: this.siteId,
        input: {
          medias: this.files.map(file => file.id),
          category: this.categoryId,
        },
      });
    },
    move() {
      this.load().then(() => {
        this.categoryId = 0;
        this.$emit('reload-files');
      });
    },
  },
};
</script>
