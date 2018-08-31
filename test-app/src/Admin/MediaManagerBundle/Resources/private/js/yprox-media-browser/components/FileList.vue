<template>
  <div class="scrollable full-height padding-0">
    <div class="col-xs-12 padding-20">
      <span v-if="loading">
        <i class="fa fa-refresh fa-spin"/>
      </span>
      <div v-else-if="files.length === 0" class="alert alert-info">
        <template v-if="searchTerms !== ''">{{ trans('no_files_to_display.search', { searchTerms }, 'mediajs') }}</template>
        <template v-else>{{ trans('no_files_to_display.category', {}, 'mediajs') }}</template>
      </div>
      <div v-else>
        <div class="row">
          <div class="col-md-12 col-lg-6">
            <div class="form-inline">
              <label for="yprox-media-browser-pagination">{{ trans('pagination.items_per_page', {}, 'mediajs') }}</label>
              <select id="yprox-media-browser-pagination" class="form-control" @change="selectLimit($event)">
                <option
                  v-for="value in limits"
                  :key="value"
                  :value="value"
                  :selected="value === limit"
                >
                  {{ value }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-12  col-lg-6 pull-right">
            <nav class="pull-right">
              <pagination
                :page="page"
                :pages-count="pagesCount"
                class-name="pagination m-t-0"
                @select-page="selectPage"
              />
            </nav>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <file-list-item
              v-for="file in files"
              :key="file.id"
              :file="file"
              :selected="isFileSelected(file)"
              :extension-icons="extensionIcons"
              :default-extension-icon="defaultExtensionIcon"
              :thumbnails-directory="thumbnailsDirectory"
              @select-file="selectFile"
              @unselect-file="unselectFile"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Translatable } from 'app';
import FileListItem from './FileListItem.vue';

export default {
  name: 'FileList',
  components: {
    FileListItem,
  },
  mixins: [Translatable],
  props: {
    files: {
      type: Array,
      required: true,
    },
    selectedFileIds: {
      type: Array,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    limits: {
      type: Array,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    extensionIcons: {
      type: Object,
      required: true,
    },
    defaultExtensionIcon: {
      type: String,
      required: true,
    },
    thumbnailsDirectory: {
      type: String,
      required: true,
    },
    searchTerms: {
      type: String,
      default: '',
    },
  },
  computed: {
    pagesCount() {
      return Math.ceil(this.total / this.limit);
    },
  },
  methods: {
    selectLimit(e) {
      const limit = parseInt(e.target.value, 10);

      this.$emit('select-limit', limit);
    },
    selectPage(page) {
      this.$emit('select-page', page);
    },
    isFileSelected(file) {
      return this.selectedFileIds.indexOf(file.id) !== -1;
    },
    selectFile(file, isMultiselect = false) {
      this.$emit('select-file', file, isMultiselect);
    },
    unselectFile(file) {
      this.$emit('unselect-file', file);
    },
  },
};
</script>
