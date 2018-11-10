<template>
  <div>
    <p>Hello world!</p>
    <my-lazy-imported-component/>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  components: {
    MyLazyImportedComponent: () => import(/* webpackChunkName: "lazy-imported-component" */'./MyLazyImportedComponent.vue'),
  },
  mounted() {
    console.log('Hello world! from MyComponent.vue');
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
