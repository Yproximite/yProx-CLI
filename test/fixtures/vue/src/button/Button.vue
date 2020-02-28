<template>
  <button @click="$emit('click')"
  >
    {{ text }}
  </button>
</template>

<script>
export default {
  name: "Button",
  data() {
    return {
      'i-should': 'be after "props" definition'
    }
  },
  props: {
    text: {
      type: String,
      required: true,
    }
  },

  created() {
    console.log('Hello from Button.vue!')
    console.log({ ...this.$props })

    if (this.text.includes('foobar')) {
      console.log('"text" contains "foobar"');
    }
  }
};
</script>
