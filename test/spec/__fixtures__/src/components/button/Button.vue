<template>
  <button @click="$emit('click')"
  >
    {{ text }}
  </button>
</template>

<script>
export default {
  name: "Button",
  props: {
    text: String,
  },

  created() {        console.log('Hello world!')

  }
};
</script>
