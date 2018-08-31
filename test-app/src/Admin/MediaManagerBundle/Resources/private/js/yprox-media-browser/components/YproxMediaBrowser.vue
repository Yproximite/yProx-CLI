<template>
  <div class="yprox-media-browser">
    <drop-uploader :site-id="siteId" :upload-process="uploadProcess" @uploaded="selectEditableRepository">
      <div class="row">
        <div class="col-sm-4 col-md-3 col-lg-2 col_med_folders padding-0">
          <category-list
            :site-id="siteId"
            :repositories="repositories"
            :repository-name="repositoryName"
            :editable-repository="editableRepositories[0]"
            :categories="categories"
            :category-id="categoryId"
            :parent-loading="loadingCategories"
            :platform-icons="platformIcons"
            @select-category="selectCategory"
            @reload="loadCategories"
          />
        </div>
        <div class="col-sm-4 col-md-6 col-lg-8 col_med_images padding-0">
          <file-list
            :files="files"
            :selected-file-ids="selectedFileIds"
            :page="page"
            :total="total"
            :limits="limits"
            :limit="limit"
            :loading="loadingFiles > 0"
            :extension-icons="extensionIcons"
            :default-extension-icon="defaultExtensionIcon"
            :thumbnails-directory="thumbnailsDirectory"
            :search-terms="searchTerms"
            @select-page="selectPage"
            @select-limit="selectLimit"
            @select-file="selectFile"
            @unselect-file="unselectFile"
          />
        </div>
        <div class="col-sm-4 col-md-3 col-lg-2 col_med_infos padding-0">
          <div class="scrollable full-height padding-0">
            <file-searcher
              :disabled="loadingCategories"
              @search="searchFiles"
            />
            <file-uploader
              v-if="canUploadFiles()"
              :site-id="siteId"
              :category="selectedCategory"
              :sibling-categories="siblingCategories"
              :accept-types="acceptTypes"
              :upload-process="uploadProcess"
              @upload="selectPage(1)"
            />
            <div class="row padding-20">
              <div class="col-xs-12">
                <category-editor
                  v-if="isEditableRepository && selectedCategory && selectedFiles.length === 0"
                  :category="selectedCategory"
                  :allow-hiding="access.canHideCategory"
                  @save="updateCategory"
                  @delete-category="deleteCategory"
                />
                <file-editor
                  v-if="isEditableRepository && selectedFile"
                  :file="selectedFile"
                  :categories="siblingCategories"
                  :site-id="siteId"
                  :category-id="categoryId"
                  @reload-files="loadFiles"
                />
                <file-collection
                  v-if="selectedFiles.length > 1"
                  :site-id="siteId"
                  :categories="siblingCategories"
                  :files="selectedFiles"
                  @reload-files="loadFiles"
                />
                <file-information
                  v-if="selectedFile"
                  :file="selectedFile"
                />
                <div class="m-t-20">
                  <file-selector
                    v-if="isFileSelectionAllowed"
                    :files="selectedFiles"
                    @select-files="applySelection"
                  />
                  <file-downloader
                    v-if="selectedFile"
                    :site-id="siteId"
                    :file="selectedFile"
                  />
                  <file-deletor
                    v-if="isEditableRepository && selectedFile"
                    :site-id="siteId"
                    :file="selectedFile"
                    @delete-file="loadFiles"
                  />
                  <file-collection-deletor
                    v-if="isEditableRepository && selectedFiles.length > 1"
                    :site-id="siteId"
                    :files="selectedFiles"
                    @delete-file="loadFiles"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </drop-uploader>
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'underscore';
import CategoryList from './CategoryList.vue';
import CategoryEditor from './CategoryEditor.vue';
import DropUploader from './DropUploader.vue';
import FileList from './FileList.vue';
import FileCollection from './FileCollection.vue';
import FileCollectionDeletor from './FileCollectionDeletor.vue';
import FileInformation from './FileInformation.vue';
import FileDownloader from './FileDownloader.vue';
import FileUploader from './FileUploader.vue';
import FileEditor from './FileEditor.vue';
import FileDeletor from './FileDeletor.vue';
import FileSelector from './FileSelector.vue';
import FileSearcher from './FileSearcher.vue';

import LoadMediaCategoriesQuery from '../graphql/queries/loadMediaCategories.graphql';
import PaginateMediasQuery from '../graphql/queries/paginateMedias.graphql';

export default {
  name: 'YproxMediaBrowser',
  components: {
    FileSearcher,
    CategoryList,
    CategoryEditor,
    DropUploader,
    FileList,
    FileCollection,
    FileCollectionDeletor,
    FileInformation,
    FileDownloader,
    FileUploader,
    FileEditor,
    FileDeletor,
    FileSelector,
  },
  props: {
    siteId: {
      type: Number,
      required: true,
    },
    selectionLimit: {
      type: Number,
      required: true,
      validator(value) {
        return value >= -1;
      },
    },
    allowUpload: {
      type: Boolean,
      required: true,
    },
    repositories: {
      type: Array,
      required: true,
      validator(value) {
        return value.length > 0;
      },
    },
    access: {
      type: Object,
      required: true,
    },
    limits: {
      type: Array,
      default() {
        return [20, 50, 100];
      },
      validator(value) {
        return value.length > 0;
      },
    },
    fileFilter: {
      type: String,
      default: '',
    },
    acceptTypes: {
      type: String,
      default: '',
    },
    extensionIcons: {
      type: Object,
      default() {
        return {};
      },
    },
    defaultExtensionIcon: {
      type: String,
      required: true,
    },
    thumbnailsDirectory: {
      type: String,
      required: true,
    },
    platformIcons: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      repositoryName: '',
      categories: [],
      categoryId: 0,
      files: [],
      selectedFileIds: [],
      page: 0,
      total: 0,
      limit: this.limits[0],
      loadingCategories: false,
      loadingFiles: 0,
      uploadProcess: {
        totalCount: 0,
        uploadedCount: 0,
        failedFileNames: [],
      },
      searchTerms: '',
    };
  },
  computed: {
    selectedRepository() {
      return _.findWhere(this.repositories, { name: this.repositoryName });
    },
    editableRepositories() {
      return _.where(this.repositories, { allowModifications: true });
    },
    isEditableRepository() {
      return this.selectedRepository.allowModifications;
    },
    siblingCategories() {
      return _.where(this.categories, { repository: this.repositoryName });
    },
    selectedCategory() {
      return _.findWhere(this.categories, { id: this.categoryId });
    },
    isFileSelectionAllowed() {
      return this.selectionLimit !== 0;
    },
    selectedFiles() {
      return this.files.filter(file => this.selectedFileIds.indexOf(file.id) !== -1);
    },
    selectedFile() {
      return this.selectedFiles.length === 1 ? this.selectedFiles[0] : null;
    },
  },
  created() {
    this.loadCategories();
    this.selectEditableRepository();
  },
  methods: {
    loadCategories() {
      this.loadingCategories = true;

      this.$graphql(LoadMediaCategoriesQuery, { siteId: this.siteId }).then((data) => {
        this.categories = data.site.mediaCategories;
        this.loadingCategories = false;
      });
    },
    selectCategory(repositoryName, categoryId) {
      this.repositoryName = repositoryName;
      this.categoryId = categoryId;
      this.page = 1;

      this.resetSearchTerms();
      this.loadFiles();
    },
    selectEditableRepository() {
      this.selectCategory(this.editableRepositories[0].name, 0);
    },
    updateCategory(category) {
      const categoryIndex = _.findIndex(this.categories, { id: category.id });

      Vue.set(this.categories, categoryIndex, category);
    },
    deleteCategory(category) {
      this.categories = this.categories.filter(
        currentCategory => currentCategory.id !== category.id,
      );

      this.selectCategory(this.repositoryName, 0);
    },
    selectLimit(limit) {
      this.limit = limit;
      this.page = 1;

      this.loadFiles();
    },
    selectPage(page) {
      this.page = page;

      this.loadFiles();
    },
    loadFiles() {
      this.loadingFiles += 1;
      this.selectedFileIds = [];

      this.$graphql(PaginateMediasQuery, {
        siteId: this.siteId,
        repository: this.repositoryName.toUpperCase(),
        categoryId: this.categoryId,
        page: this.page,
        perPage: this.limit,
        filenameFilter: this.searchTerms.trim() || null,
      }).then((data) => {
        const { total, currentPage, items } = data.site.paginatedMedias;

        this.page = currentPage;
        this.total = total;
        this.files = items;
        this.loadingFiles -= 1;
      }).catch(() => {
        this.loadingFiles -= 1;
      });
    },
    canSelectFile(filesCount) {
      return this.selectionLimit === -1
        || this.selectionLimit === 0
        || filesCount < this.selectionLimit;
    },
    canUploadFiles() {
      const selectedRepositoryName = this.selectedRepository.name;

      if (!this.allowUpload) {
        return false;
      }

      if (['site', 'root'].indexOf(selectedRepositoryName) !== -1) {
        return true;
      }

      if (selectedRepositoryName === 'platform' && this.access.canUploadInPlatformRepository) {
        return true;
      }

      return false;
    },
    selectFile(file, isMultiselect) {
      const selectedFileIds = isMultiselect ? this.selectedFileIds : [];

      if (this.canSelectFile(selectedFileIds.length)) {
        selectedFileIds.push(file.id);

        this.selectedFileIds = selectedFileIds;
      }
    },
    unselectFile(file) {
      this.selectedFileIds = this.selectedFileIds.filter(id => id !== file.id);
    },
    applySelection() {
      this.$emit('select-files', _.map(this.selectedFiles, _.clone));

      this.selectedFileIds = [];
    },
    searchFiles(searchTerms) {
      this.searchTerms = searchTerms;
      this.loadFiles();
    },
    resetSearchTerms() {
      this.searchTerms = '';
    },
  },
};
</script>
