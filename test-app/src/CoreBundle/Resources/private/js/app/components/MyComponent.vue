<template>
  <div>
    <p>Hello world!</p>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  mounted() {
    global.alert('Hello world! from MyComponent.vue');
  },
};
</script>

<style lang="scss">
.foo {
  color: darken(red, 10%);
}
</style>

<style scoped>
p {
  color: blue;
}
</style>
