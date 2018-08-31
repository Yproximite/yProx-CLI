<template>
  <div
    v-show="isShown"
    :id="elementId"
    :class="className"
    :aria-labelledby="elementId + '-label'"
    class="modal fade"
    tabindex="-1"
    role="dialog"
  >
    <div :class="dialogClass" class="modal-dialog">
      <div :class="contentClass" class="modal-content">
        <div :class="headerClass" class="modal-header">
          <button
            type="button"
            class="close"
            aria-label="Close"
            data-dismiss="modal"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h4 :id="elementId + '-label'" class="modal-title">
            <slot name="header"/>
          </h4>
        </div>
        <div :class="bodyClass" class="modal-body">
          <slot name="body"/>
        </div>
        <div v-if="showFooter" :class="footerClass" class="media-footer">
          <slot name="footer"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modalable from '../mixins/Modalable';

const classPropType = {
  type: [String, Array, Object],
  default() {
    return [];
  },
};

export default {
  name: 'Modal',
  mixins: [Modalable],
  props: {
    showFooter: {
      type: Boolean,
      default: true,
    },
    // eslint-disable-next-line vue/require-default-prop
    className: classPropType,
    // eslint-disable-next-line vue/require-default-prop
    dialogClass: classPropType,
    // eslint-disable-next-line vue/require-default-prop
    contentClass: classPropType,
    // eslint-disable-next-line vue/require-default-prop
    headerClass: classPropType,
    // eslint-disable-next-line vue/require-default-prop
    bodyClass: classPropType,
    // eslint-disable-next-line vue/require-default-prop
    footerClass: classPropType,
  },
};
</script>
