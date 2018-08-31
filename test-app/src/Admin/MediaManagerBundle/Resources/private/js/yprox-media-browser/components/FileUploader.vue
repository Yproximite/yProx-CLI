<template>
  <div>
    <input
      ref="input"
      :accept="acceptTypes"
      :style="{ display: 'none' }"
      multiple
      type="file"
      @change="upload($event)"
    >
    <header :class="{'uploading-error': !!uploadProcess.failedFileNames.length}" class="text-center padding-20">
      <button
        :class="[!!uploadProcess.failedFileNames.length ? 'btn-warning' : 'btn-success']"
        :disabled="uploadProcess.totalCount > 0"
        class="btn text-uppercase"
        @click="selectFile"
      >
        <span v-if="!!uploadProcess.totalCount">
          <strong>{{ trans('loading', {}, 'mediajs') }} {{ uploadProcess.uploadedCount }} / {{ uploadProcess.totalCount }}</strong>
          <i class="fa fa-refresh fa-spin"/>
        </span>
        <span v-else>
          <strong>{{ trans('file.upload', {}, 'mediajs') }}</strong>
          <i class="fa fa-plus-circle" aria-hidden="true"/>
        </span>
        <span v-if="!!uploadProcess.failedFileNames.length">
          <strong>{{ uploadProcess.failedFileNames.length }}</strong>
          <i class="fa fa-warning"/>
        </span>
      </button>
    </header>
    <div v-if="!!uploadProcess.failedFileNames.length" class="padding-20 p-b-0">
      <p>
        <strong>{{ trans('file.uploading_error', {}, 'mediajs') }}</strong>
      </p>
      <ul class="list-inline text-left">
        <li v-for="fileName in uploadProcess.failedFileNames" :key="fileName">
          <strong>{{ fileName }}</strong>
        </li>
      </ul>
      <hr>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import _ from 'underscore';
import { Translatable } from 'app';
import UploadMediaQuery from '../graphql/mutations/uploadMedias.graphql';

export default {
  name: 'FileUploader',
  mixins: [Translatable],
  props: {
    siteId: {
      type: Number,
      required: true,
    },
    category: {
      type: Object,
      default: null,
    },
    siblingCategories: {
      type: Array,
      required: true,
    },
    acceptTypes: {
      type: String,
      required: true,
    },
    uploadProcess: {
      type: Object,
      required: true,
    },
  },
  methods: {
    resetFile() {
      $(this.$refs.input)
        .wrap('<form>')
        .closest('form')
        .get(0)
        .reset();
      $(this.$refs.input).unwrap();
    },
    selectFile() {
      this.resetFile();
      $(this.$refs.input).trigger('click');
    },
    // Récupère le bon siteId en se basant sur la catégorie sélectionnée et sur les catégories soeurs
    getSiteIdAccordingCategory() {
      if (this.category) {
        return this.category.site.id; // retourne l'id d'un site ou d'une plateforme
      }

      // "Pas de catégorie", on tente de récupérer l'id d'un site/plateforme de la première catégorie
      if (this.siblingCategories.length > 0) {
        return this.siblingCategories[0].site.id;
      }

      return this.siteId;
    },
    upload(e) {
      const files = e.target.files ? e.target.files : e.dataTransfer.files;

      if (!files || !!this.uploadProcess.totalCount) {
        return;
      }

      this.uploadProcess.totalCount = files.length;
      this.uploadProcess.uploadedCount = 0;
      this.uploadProcess.failedFileNames = [];

      const stack = _.map(files, (file) => {
        const variables = {
          siteId: this.getSiteIdAccordingCategory(),
        };

        if (this.category) {
          variables.categoriesIds = [this.category.id];
        }

        return this.$graphql(UploadMediaQuery, variables, (formData) => {
          formData.append('medias[]', file, file.name);
        }).then(() => {
          this.uploadProcess.uploadedCount += 1;

          return Promise.resolve();
        }).catch(() => {
          this.uploadProcess.failedFileNames.push(file.name);

          return Promise.resolve();
        });
      });

      Promise.all(stack).then(() => {
        this.$emit('upload');

        setTimeout(() => {
          this.uploadProcess.totalCount = 0;
          this.uploadProcess.uploadedCount = 0;
        }, 3000);
      });
    },
  },
};
</script>
