import Translator from 'translator';

export default {
  methods: {
    trans(...args) {
      return Translator.trans(...args);
    },
    transChoice(...args) {
      return Translator.transChoice(...args);
    },
  },
};
