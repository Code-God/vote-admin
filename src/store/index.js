import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import errorLog from './modules/errorLog'
import permission from './modules/permission'
import tagsView from './modules/tagsView'
import user from './modules/user'
import active from './modules/active'
import getters from './getters'
import createLogger from 'vuex/dist/logger';

const debug = process.env.NODE_ENV === 'production' ? 0 : 1;
Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    errorLog,
    permission,
    tagsView,
    user,
    active
  },
  getters,
  plugins: debug ? [createLogger()] : []
});

export default store
