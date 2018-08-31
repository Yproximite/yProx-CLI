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
    <div v-if="fileArticles.length > 0" class="alert alert-warning">
      Ce fichier est utilisé sur les articles suivants :
      <ul>
        <li v-for="article in fileArticles" :key="article.id">
          <a :href="generateArticleEditRoute(article)" target="_blank">{{ article.translations[0].title }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Routing from 'routing';
import { Translatable } from 'app';
import DeleteMediaMutation from '../graphql/mutations/deleteMedia.graphql';

export default {
  name: 'FileDeletor',
  mixins: [Translatable],
  props: {
    siteId: {
      type: Number,
      required: true,
    },
    file: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      error: -1,
    };
  },
  computed: {
    fileArticles() {
      return (this.file.articles || []).filter(article => article !== null);
    },
  },
  methods: {
    deleteFile() {
      if (!global.confirm(this.trans('are_you_sure', {}, 'mediajs'))) {
        return;
      }

      this.loading = true;

      this.$graphql(DeleteMediaMutation, {
        siteId: this.siteId,
        mediaId: this.file.id,
      }).then(() => {
        this.$emit('delete-file');
      }).catch((errors) => {
        this.error = errors[0].message;
        this.loading = false;
      });
    },
    generateArticleEditRoute(article) {
      return Routing.generate('article_edit', {
        site_id: article.site.id,
        id: article.id,
      });
    },
  },
};
</script>
