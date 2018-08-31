<template>
  <textarea ref="el" :value="value"/>
</template>

<script>
import CodeMirror from 'codemirror';

export default {
  name: 'CodeMirror',
  props: {
    value: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      cm: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initalizeCodeMirror();
    });
  },
  beforeDestroy() {
    this.destroyCodeMirror();
  },
  methods: {
    initalizeCodeMirror() {
      const cm = CodeMirror.fromTextArea(this.$refs.el, this.options || {});

      cm.on('change', () => {
        this.$emit('change', cm.getValue());
      });

      this.cm = cm;
    },
    destroyCodeMirror() {
      this.cm.toTextArea();
    },
  },
};
</script>
