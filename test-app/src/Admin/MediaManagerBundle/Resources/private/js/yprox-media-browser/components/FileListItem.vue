<template>
  <div
    :class="{active: selected}"
    class="gallery-item"
    data-width="1"
    data-height="1"
    @click="select($event)"
  >
    <img :src="thumbnailLink" :alt="file.originalFilename" class="gallery-item-image">
    <div class="overlayer bottom-left full-width">
      <div class="overlayer-wrapper item-info ">
        <div class="gradient-grey p-l-20 p-r-20 p-t-0 p-b-20">
          <p class="pull-left bold text-white fs-14 p-t-0">
            {{ file.originalFilenameSlugged }}
          </p>
          <div class="clearfix"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileListItem',
  props: {
    file: {
      type: Object,
      required: true,
    },
    selected: {
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
  },
  computed: {
    thumbnailLink() {
      if (/^image\//.test(this.file.mimeType)) {
        return `${this.thumbnailsDirectory}/${this.file.filename}`;
      }

      if (typeof this.extensionIcons[this.file.extension] !== 'undefined') {
        return this.extensionIcons[this.file.extension];
      }

      return this.defaultExtensionIcon;
    },
  },
  methods: {
    select(e) {
      const isMultiselect = e.ctrlKey || e.metaKey;

      if (this.selected && isMultiselect) {
        this.$emit('unselect-file', this.file);
      } else {
        this.$emit('select-file', this.file, isMultiselect);
      }
    },
  },
};
</script>
