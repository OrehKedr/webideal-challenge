import Vue from 'vue';
import Vuex from 'vuex';
import TRModule from './modules/TRModule';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: [TRModule]
});

export default store;