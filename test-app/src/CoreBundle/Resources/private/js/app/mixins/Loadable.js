import Promise from 'core-js-pure/features/promise';

export default {
  data() {
    return {
      loading: false,
      error: -1,
    };
  },
  methods: {
    load() {
      this.error = -1;
      this.loading = true;

      return this.getLoader().then((response) => {
        this.error = 0;
        this.loading = false;

        setTimeout(() => {
          this.error = -1;
        }, 3000);

        return Promise.resolve(response);
      }).catch((response) => {
        this.error = response.status;
        this.loading = false;

        return Promise.reject(response);
      });
    },
  },
};
