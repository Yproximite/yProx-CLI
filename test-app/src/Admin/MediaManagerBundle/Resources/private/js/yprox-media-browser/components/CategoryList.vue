<template>
  <div class="scrollable full-height padding-0">
    <div class="col-xs-12">
      <div v-for="parent in repositories" :key="parent.name" class="p-l-10">
        <h5 class="semi-bold text-uppercase">
          <i :class="'fa fa-' + platformIcons[parent.name]"/>
          {{ parent.title }}
          <button
            v-if="parent.allowModifications"
            :title="trans('category.create', {}, 'mediajs')"
            class="pull-right btn btn-cat"
            @click="toggleCreationForm"
          >
            <i :class="[isCreationFormShown ? 'fa-minus-circle' : 'fa-plus-circle']" class="fa" aria-hidden="true"/>
          </button>
        </h5>
        <ul class="panel-group p-l-0">
          <div v-if="parent.allowModifications && isCreationFormShown">
            <div :class="{'has-error': error > 0}" class="input-group" style="margin-bottom: 10px">
              <input
                v-model="newCategory.title"
                :placeholder="trans('category.props.title', {}, 'mediajs')"
                type="text"
                class="form-control"
              >
              <div class="input-group-btn">
                <button
                  :title="trans('category.create', {}, 'mediajs')"
                  :disabled="loading"
                  type="button"
                  class="btn btn-success"
                  @click="create"
                >
                  <i v-show="loading" class="fa fa-refresh fa-spin text-white"/>
                  <i v-show="!loading" class="fa fa-plus text-white"/>
                </button>
              </div>
            </div>
          </div>
          <span v-if="parentLoading">
            <i class="fa fa-refresh fa-spin"/>
          </span>
          <div v-else>
            <div role="tab" class="folder-link p-l-20 m-b-5 text-uppercase">
              <a
                :class="{'text-white': isSelected(parent.name, 0)}"
                role="button"
                data-toggle="collapse"
                aria-expanded="true"
                @click.prevent="select(parent.name, 0)"
              >
                <i class="fa fa-folder-o" aria-hidden="true"/>
                {{ trans('uncategorized', {}, 'mediajs') }}
              </a>
            </div>
            <div
              v-for="category in getCategories(parent.name)"
              :key="category.id"
              role="tab"
              class="folder-link p-l-20 m-b-5 text-uppercase"
            >
              <a
                :class="{'text-white': isSelected(parent.name, category.id)}"
                role="button"
                data-toggle="collapse"
                aria-expanded="true"
                @click.prevent="select(parent.name, category.id)"
              >
                <i class="fa fa-folder" aria-hidden="true"/>
                {{ category.title }}
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { Loadable, Translatable } from 'app';
import CreateMediaCategoryMutation from '../graphql/mutations/createMediaCategory.graphql';

const newCategoryDefaults = {
  title: '',
};

export default {
  name: 'CategoryList',
  mixins: [
    Translatable,
    Loadable,
  ],
  props: {
    siteId: {
      type: Number,
      required: true,
    },
    repositories: {
      type: Array,
      required: true,
    },
    repositoryName: {
      type: String,
      required: true,
    },
    editableRepository: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    categoryId: {
      type: Number,
      required: true,
    },
    parentLoading: {
      type: Boolean,
      required: true,
    },
    platformIcons: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      newCategory: { ...newCategoryDefaults },
      isCreationFormShown: false,
    };
  },
  methods: {
    isSelected(repositoryName, categoryId) {
      return this.repositoryName === repositoryName && this.categoryId === categoryId;
    },
    select(repositoryName, categoryId) {
      this.$emit('select-category', repositoryName, categoryId);
    },
    toggleCreationForm() {
      this.isCreationFormShown = !this.isCreationFormShown;
    },
    getLoader() {
      return this.$graphql(CreateMediaCategoryMutation, {
        siteId: this.siteId,
        input: {
          title: this.newCategory.title,
          hidden: false,
          hierarchy: this.editableRepository.name,
        },
      });
    },
    getCategories(repositoryName) {
      return this.categories.filter(category => category.repository === repositoryName);
    },
    create() {
      this.load().then(() => {
        this.isCreationFormShown = false;
        this.newCategory = { ...newCategoryDefaults };

        this.$emit('reload');
      });
    },
  },
};
</script>
