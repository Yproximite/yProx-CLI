export default {
  props: {
    page: {
      type: Number,
      required: true,
    },
    pagesCount: {
      type: Number,
      required: true,
    },
    maxButtons: {
      type: Number,
      default: 3,
    },
    boundaryLinks: {
      type: Boolean,
      default: true,
    },
    ellipsis: {
      type: Boolean,
      default: true,
    },
    first: Boolean,
    last: Boolean,
    prev: Boolean,
    next: Boolean,
  },
  computed: {
    visiblePages() {
      let startPage;
      let endPage;
      let hasHiddenPagesAfter;

      if (this.maxButtons) {
        const hiddenPagesBefore = this.page - parseInt(this.maxButtons / 2, 10);

        startPage = hiddenPagesBefore > 1 ? hiddenPagesBefore : 1;
        hasHiddenPagesAfter = startPage + this.maxButtons <= this.pagesCount;

        if (!hasHiddenPagesAfter) {
          endPage = this.pagesCount;
          startPage = (this.pagesCount - this.maxButtons) + 1;

          if (startPage < 1) {
            startPage = 1;
          }
        } else {
          endPage = (startPage + this.maxButtons) - 1;
        }
      } else {
        startPage = 1;
        endPage = this.pagesCount;
      }

      const visiblePages = [];

      for (let pagenumber = startPage; pagenumber <= endPage; pagenumber += 1) {
        visiblePages.push(pagenumber);
      }

      if (this.boundaryLinks && this.ellipsis && startPage !== 1) {
        visiblePages.unshift(1, -1);
      }

      if (this.maxButtons && hasHiddenPagesAfter && this.ellipsis) {
        visiblePages.push(-1);

        if (this.boundaryLinks && endPage !== this.pagesCount) {
          visiblePages.push(this.pagesCount);
        }
      }

      return visiblePages;
    },
  },
  methods: {
    select(page) {
      this.$emit('select-page', page);
    },
  },
};
