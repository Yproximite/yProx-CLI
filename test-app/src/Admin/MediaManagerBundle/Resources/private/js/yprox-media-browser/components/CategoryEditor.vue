<template>
  <div>
    <h5 class="text-uppercase">
      <strong>{{ trans('category.props', {}, 'mediajs') }}</strong>
    </h5>
    <div class="form-group">
      <label for="yprox-media-browser-category-title">{{ trans('category.props.title', {}, 'mediajs') }}</label>
      <input
        id="yprox-media-browser-category-title"
        v-model="dirtyCategory.title"
        :placeholder="trans('category.props.title', {}, 'mediajs')"
        type="text"
        class="form-control input-lg"
      >
    </div>
    <div v-if="allowHiding" class="form-group">
      <label>
        <input v-model="dirtyCategory.hidden" type="checkbox">
        {{ trans('category.props.hidden', {}, 'mediajs') }}
      </label>
    </div>
    <div>
      <div class="btn-block">
        <button
          :disabled="loading"
          type="button"
          class="btn btn-block btn-complete text-uppercase"
          @click="save"
        >
          <strong>{{ trans(loading ? 'loading' : 'save', {}, 'mediajs') }}</strong>
        </button>
        <div v-show="error === 0" class="text-center text-muted">{{ trans('saved', {}, 'mediajs') }}</div>
        <div v-show="error > 0" class="text-center text-danger">{{ trans('loading_error', {}, 'mediajs') }}</div>
      </div>
      <button
        :disabled="loading"
        type="button"
        class="btn btn-block btn-danger text-uppercase"
        @click="deleteCategory"
      >
        <strong>{{ trans(loading ? 'loading' : 'delete', {}, 'mediajs') }}</strong>
      </button>
    </div>
    <hr >
  </div>
</template>

<script>
import _ from 'underscore';
import { Translatable } from 'app';
import UpdateMediaCategoryMutation from '../graphql/mutations/updateMediaCategory.graphql';
import DeleteMediaCategoryMutation from '../graphql/mutations/deleteMediaCategory.graphql';

export default {
  name: 'CategoryEditor',
  mixins: [Translatable],
  props: {
    category: {
      type: Object,
      required: true,
    },
    allowHiding: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      dirtyCategory: _.clone(this.category),
      loading: false,
      error: -1,
    };
  },
  watch: {
    category(val) {
      this.dirtyCategory = _.clone(val);

      // after switching to an another category
      if (this.error > 0) {
        this.error = -1;
      }
    },
  },
  methods: {
    save() {
      this.error = -1;
      this.loading = true;

      this.$graphql(UpdateMediaCategoryMutation, {
        siteId: this.dirtyCategory.site.id,
        mediaCategoryId: this.dirtyCategory.id,
        input: {
          title: this.dirtyCategory.title,
          hidden: this.dirtyCategory.hidden,
          hierarchy: this.dirtyCategory.repository,
        },
      }).then((data) => {
        this.error = 0;
        this.loading = false;

        setTimeout(() => {
          this.error = -1;
        }, 3000);

        this.$emit('save', data.updateMediaCategory);
      }).catch((errors) => {
        this.error = 1;
        this.errorMessage = errors[0].message;
        this.loading = false;
      });
    },
    deleteCategory() {
      if (!global.confirm(this.trans('are_you_sure', {}, 'mediajs'))) {
        return;
      }

      this.loading = true;

      this.$graphql(DeleteMediaCategoryMutation, {
        siteId: this.dirtyCategory.site.id,
        mediaCategoryId: this.dirtyCategory.id,
      }).then(() => {
        this.$emit('delete-category', this.category);
      }).catch((errors) => {
        this.error = errors[0].message;
        this.loading = false;
      });
    },
  },
};
</script>
