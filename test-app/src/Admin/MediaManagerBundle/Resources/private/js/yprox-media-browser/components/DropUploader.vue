<template>
  <div class="yprox-media-browser-uploader" @dragover="onDragOver">
    <slot/>
    <div ref="uploader" class="yprox-media-browser-drop padding-15">
      <div class="yprox-media-browser-drop-inner"/>
    </div>
  </div>
</template>

<script>
import Dropzone from 'dropzone';
import UploadMedias from '../graphql/mutations/uploadMedias.graphql';
import { getGraphQlEndpoint } from '../../../../../../CoreBundle/Resources/private/js/app/utils/apiInterface';

const DRAG_TIMEOUT = 300;

export default {
  name: 'DropUploader',
  props: {
    siteId: {
      type: Number,
      required: true,
    },
    uploadProcess: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      lastDragTime: null,
      uploaderShown: false,
    };
  },
  watch: {
    uploaderShown(val) {
      if (val) {
        this.showUploader();
      } else {
        this.hideUploader();
      }
    },
  },
  created() {
    this.initUploaderChecker();
  },
  mounted() {
    this.$nextTick(this.onReady.bind(this));
  },
  beforeDestroy() {
    this.destroyDropzone();
  },
  methods: {
    showUploader() {
      this.$refs.uploader.style.display = 'block';
    },
    hideUploader() {
      this.$refs.uploader.style.display = 'none';
    },
    initUploaderChecker() {
      setInterval(() => {
        if (this.uploadProcess.totalCount) {
          this.uploaderShown = false;
        } else {
          this.uploaderShown = Date.now() - this.lastDragTime <= DRAG_TIMEOUT;
        }
      }, DRAG_TIMEOUT);
    },
    initDropzone() {
      const options = {
        url: getGraphQlEndpoint(),
        params: {
          query: UploadMedias,
          variables: JSON.stringify({ siteId: this.siteId }),
        },
        paramName: 'medias[]',
        previewsContainer: false,
      };

      this.dropzone = new Dropzone(this.$refs.uploader, options);
      this.dropzone.on('dragover', this.onDragOver.bind(this));
      this.dropzone.on('drop', this.onDrop.bind(this));
      this.dropzone.on('sending', this.onSending.bind(this));
      this.dropzone.on('success', this.onSuccess.bind(this));
      this.dropzone.on('error', this.onError.bind(this));
      this.dropzone.on('canceled', this.onCanceled.bind(this));
    },
    modifyRequest(xhr) {
      // @todo: separate api service from Vue.$api and call its method to retreive it
      const apiToken = localStorage.getItem('api_token');

      xhr.setRequestHeader('Authorization', `Bearer ${apiToken}`);
    },
    destroyDropzone() {
      this.dropzone.off();
      this.dropzone.destroy();
    },
    finishUploading() {
      const finishedCount = (
        this.uploadProcess.uploadedCount
          + this.uploadProcess.failedFileNames.length
      );

      if (this.uploadProcess.totalCount === finishedCount) {
        this.uploadProcess.totalCount = 0;
        this.uploadProcess.uploadedCount = 0;

        this.$emit('uploaded');
      }
    },
    onReady() {
      this.initDropzone();
    },
    onDragOver() {
      this.lastDragTime = Date.now();
    },
    onDrop() {
      this.uploadProcess.totalCount = 0;
      this.uploadProcess.uploadedCount = 0;
      this.uploadProcess.failedFileNames = [];
    },
    onSending(file, xhr) {
      this.modifyRequest(xhr);

      this.uploadProcess.totalCount += 1;
    },
    onSuccess() {
      this.uploadProcess.uploadedCount += 1;

      this.finishUploading();
    },
    onCanceled() {
      this.uploadProcess.totalCount -= 1;
    },
    onError(file) {
      this.uploadProcess.failedFileNames.push(file.name);

      this.finishUploading();
    },
  },
};
</script>
