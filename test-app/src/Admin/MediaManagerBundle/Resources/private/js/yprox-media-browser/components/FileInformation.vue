<template>
  <div>
    <h5 class="text-uppercase">
      <strong>{{ trans('file.information', {}, 'mediajs') }}</strong>
    </h5>
    <ul class="list-inline text-left">
      <li><strong>{{ trans('file.information.size', {}, 'mediajs') }}</strong> : {{ size }}</li>
      <li><strong>{{ trans('file.information.mime', {}, 'mediajs') }}</strong> : {{ file.mimeType }}</li>
    </ul>
    <div class="form-group">
      <label for="yprox-media-browser-file-link">
        <a :href="file.fullpathFilename" target="_blank">
          {{ trans('file.information.link', {}, 'mediajs') }} <i class="fa fa-link" aria-hidden="true"/>
        </a>
      </label>
      <input
        id="yprox-media-browser-file-link"
        :value="file.fullpathFilename"
        type="text"
        class="form-control input-lg"
        readonly
      >
    </div>
    <hr>
  </div>
</template>

<script>
import { Translatable } from 'app';

export default {
  name: 'FileInformation',
  mixins: [Translatable],
  props: {
    file: {
      type: Object,
      required: true,
    },
  },
  computed: {
    size() {
      const precision = 2;
      const megabyte = Math.pow(1024, 2); // eslint-disable-line no-restricted-properties
      const size = (this.file.size / megabyte).toFixed(precision);

      return `${size} MB`;
    },
  },
};
</script>
