<template>
  <a :href="link" target="_blank" class="btn btn-block btn-primary text-uppercase">
    <strong>{{ trans('download', {}, 'mediajs') }}</strong>
  </a>
</template>

<script>
import Routing from 'routing';
import { Translatable } from 'app';

export default {
  name: 'FileDownloader',
  mixins: [Translatable],
  props: {
    file: {
      type: Object,
      required: true,
    },
    siteId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    link() {
      return Routing.apiGenerate('api_get_site_media_download', {
        site_id: this.siteId,
        media_id: this.file.id,
      });
    },
  },
};
</script>
