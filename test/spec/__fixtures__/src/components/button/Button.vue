<template>
  <button @click="$emit('click')"
  >
    {{ text }}
  </button>
</template>

<script>
import FooQuery from './foo.graphql';

export default {
  name: "Button",
  props: {
    text: String,
  },

  created() {
    console.log('Hello from Button.vue!')
    console.log(FooQuery);
  }
};
</script>
