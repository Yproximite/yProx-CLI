import $ from 'jquery';

const SHOWN_EVENT = 'shown.bs.modal';
const HIDE_EVENT = 'hide.bs.modal';
const HIDDEN_EVENT = 'hidden.bs.modal';

export default {
  props: {
    isShown: Boolean,
    allowHide: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    elementId() {
      return `yprox-modal-${this._uid}`; // eslint-disable-line no-underscore-dangle
    },
  },
  methods: {
    show() {
      this.doIsShownChange(true);
    },
    hide() {
      if (this.allowHide) {
        this.doIsShownChange(false);
      }
    },
    doIsShownChange(isShown) {
      this.$emit('is-shown-change', isShown);
    },
  },
  mounted() {
    this.$nextTick(() => {
      $(`#${this.elementId}`).on(`${SHOWN_EVENT} ${HIDDEN_EVENT}`, (e) => {
        if (e.target.id === this.elementId) {
          this.doIsShownChange(`${e.type}.${e.namespace}` === SHOWN_EVENT);
        }
      });
      $(`#${this.elementId}`).on(`${HIDE_EVENT}`, (e) => {
        if (!this.allowHide) {
          e.preventDefault();
        }
      });

      this.$watch('isShown', (val) => {
        if (val !== $(`#${this.elementId}`).hasClass('in')) {
          $(`#${this.elementId}`).modal(val ? 'show' : 'hide');
        }
      }, { immediate: true });
    });
  },
  beforeDestroy() {
    $(`#${this.elementId}`).off();
  },
};
