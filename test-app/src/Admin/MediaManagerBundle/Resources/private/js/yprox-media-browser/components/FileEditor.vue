<template>
  <div>
    <h5 class="text-uppercase">
      <strong>{{ trans('file.props', {}, 'mediajs') }}</strong>
    </h5>
    <div class="form-group">
      <label for="yprox-media-browser-file-title">{{ trans('file.props.title', {}, 'mediajs') }}</label>
      <input
        id="yprox-media-browser-file-title"
        :placeholder="trans('file.props.title', {}, 'mediajs')"
        v-model="dirtyFile.title"
        type="text"
        class="form-control input-lg"
      >
    </div>
    <div class="form-group">
      <label for="yprox-media-browser-file-description">{{ trans('file.props.description', {}, 'mediajs') }}</label>
      <textarea
        id="yprox-media-browser-file-description"
        v-model="dirtyFile.description"
        :placeholder="trans('file.props.description', {}, 'mediajs')"
        class="form-control"
      />
    </div>
    <div class="form-group">
      <label for="yprox-media-browser-file-categories">{{ trans('file.props.categories', {}, 'mediajs') }}</label>
      <select
        id="yprox-media-browser-file-categories"
        v-model="categoriesIds"
        multiple
        class="form-control"
      >
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.title }}</option>
      </select>
    </div>
    <div>
      <button
        :disabled="loading"
        type="button"
        class="btn btn-block btn-complete text-uppercase"
        @click="save"
      >
        <strong>{{ trans(loading ? 'loading' : 'save', {}, 'mediajs') }}</strong>
      </button>
      <span v-show="error === 0" class="text-muted">{{ trans('saved', {}, 'mediajs') }}</span>
      <span v-show="error > 0" class="text-danger">{{ trans('loading_error', {}, 'mediajs') }}</span>
    </div>
    <hr >
  </div>
</template>

<script>
import _ from 'underscore';
import { Translatable, Loadable } from 'app';

import UpdateMediaMutation from '../graphql/mutations/updateMedia.graphql';

export default {
  name: 'FileEditor',
  mixins: [
    Translatable,
    Loadable,
  ],
  props: {
    file: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    siteId: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      dirtyFile: _.clone(this.file),
    };
  },
  computed: {
    categoriesIds: {
      get() {
        return this.dirtyFile.categories.map(({ id }) => id);
      },
      set(categoriesIds) {
        this.dirtyFile.categories = categoriesIds
          .map(categoryId => this.categories.find(({ id }) => id === categoryId) || null)
          .filter(category => category !== null);
      },
    },
  },
  watch: {
    file(val) {
      this.dirtyFile = _.clone(val);

      // after switching to an another file
      if (this.error > 0) {
        this.error = -1;
      }
    },
  },
  methods: {
    getLoader() {
      return this.$graphql(UpdateMediaMutation, {
        siteId: this.siteId,
        mediaId: this.dirtyFile.id,
        input: {
          title: this.dirtyFile.title,
          description: this.dirtyFile.description,
          categories: this.dirtyFile.categories.map(({ id }) => id),
        },
      });
    },
    save() {
      this.load().then(() => {
        this.$emit('reload-files');
      });
    },
  },
};
</script>
