import Vue from 'vue';
import Vuex from 'vuex';
import TRModule from './modules/TRModule';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    url: '',            // Буфферное значение URL. Используется при пагинации Таблицы результатов.
    searchStr: '',      // Буфферное значение. Запрос в форме поиска.
    reposCatalog: {},   // Каталог по Репозиториям. Кэшированные данные всех результатов поисков.
    forksCount: 0,      // Кол-во форков. Для каждого репозитория специфичное значение.
    forksPerPage: 1,    // Зависит от внешнего API. Для Github = 30.
    currentPageRT: 1,   // Буфферное значение. Номер страницы в Таблице результатов. Равно номер пагинации.
    isLoading: false    // Флаг загрузки. Вкл./выкл. анимацию.
  },
  mutations: {
    // configForks(state, page) {
    //   state.forks = new Array(page);
    // },
    // updateForks(state, {forks, page}) {
    //   state.forks[page - 1] = forks;
    // },
    configReposCatalog(state, confObj) {
      let {searchStr, length} = confObj;
      let arr = searchStr.split('/');
      let [repoOwner, repoName] = arr;
      let newRepo = {
        [searchStr]: {
          repoName,
          repoOwner,
          forksCount: state.forksCount,
          forks: new Array(length)
        }
      };
      state.reposCatalog = Object.assign(state.reposCatalog, newRepo);
    },
    updateReposCatalog(state, repoInfo) {
      let {
        page,
        forks,
        searchStr,
      } = repoInfo;

      state.reposCatalog[searchStr].forks[page - 1] = forks;
    },
    setForksCount(state, count) {
      state.forksCount = count;
    },
    setForksPerPage(state, count) {
      state.forksPerPage = count;
    },
    setURL(state, url) {
      state.url = url;
    },
    setSearchStr(state, str) {
      state.searchStr = str;
    },
    startLoading(state) {
      state.isLoading = true;
    },
    endLoading(state) {
      state.isLoading = false;
    },
    setCurrentPageRT(state, page) {
      state.currentPageRT = page;
    },
    switchStore(state, params) {
      let {url, searchStr} = params;

      state.url = url;
      state.searchStr = searchStr;
      state.forksCount = state.reposCatalog[searchStr].forksCount;
      state.currentPageRT = 1;
    }
  },
  actions: {
    // Получаем количество форков для репозитория.
    async fetchForksCount({ commit }, url) {
      commit('startLoading');
      const response = await fetch(url);

      if (response.ok) {
        const repo_info = await response.json();
        let {
          items: [
            {
              forks
            }
          ]          
        } = repo_info;

        commit('setForksCount', forks);
        commit('endLoading');
      } else {
        console.log('Ошибка HTTP: ' + response.status);
        commit('endLoading');
      }
    },

    async fetchForks({ commit, state }, params) {      
      commit('startLoading');   // Отображаем компонент с анимацией загрузки.
      let {url, page, searchStr} = params;
      console.log('Внутри fetchForks.');
      console.log('url: ', url);
      console.log('page: ', page);
      console.log('searchStr: ', searchStr);

      if (page == 1) {
        commit('setURL', url);
      }

      let specifiedURL = (page > 1) ? url + `?page=${page}` : url;
      
      const response = await fetch(specifiedURL);  // Получаем заголовки ответа.
      if (response.ok) {

        if (page == 1) {
          // Разбор заголовка link, вытащить значение кол-во страниц/порций данных.
          let headerLinkStr = response.headers.get('link');
          let linksArr = headerLinkStr.split(',');
          let linkLastStr = linksArr.find( link => link.includes('rel=\"last\"'));
          let lastPage = linkLastStr
            .match(/\?page=\d*/)[0]
            .split('=')[1];

          let confObj = {
            searchStr,
            length: parseInt(lastPage)
          };

          // commit('configForks', page);
          commit('configReposCatalog', confObj);
        }

        const verboseForks = await response.json();  // Получаем тело ответа.

        const forks = verboseForks.map( (fork, index) => {
          let {
            full_name,
            owner: {
              login
            },
            stargazers_count,
            html_url
          } = fork;

          let simpleFork = Object.assign({}, 
            {id: state.forksPerPage * (page - 1) + index + 1}, 
            {full_name}, 
            {login}, 
            {stargazers_count}, 
            {html_url}
          );

          return simpleFork;
        });

        let repoInfo = {
          searchStr,
          forks,
          page
        };
        
        // commit('updateForks', {forks, page});   // Сохраняем список форков в глобальный state.
        commit('updateReposCatalog', repoInfo);
        if (page == 1) {
          commit('setSearchStr', searchStr);
          commit('setForksPerPage', forks.length);
        }
      } else {  // (!response.ok)
        console.warn('Ошибка HTTP: ' + response.status);        
        if (page == 1) {
          console.warn('Проверьте значение в поле ввода на соответствие шаблону :owner/:repositoryName');
        } else {
          console.warn('Повторите попытку попозже.');
        }
      }

      commit('endLoading');
    },

    storeCurrentPageRT({ commit }, page) {
      commit('setCurrentPageRT', page);
    },
    readCachedRepo({ commit }, params) {
      commit('switchStore', params);
    }
  },
  getters: {
    allForks(state, getters) {
      let rC = state.reposCatalog;
      let searhStr = getters.currentSearchStr;
      return rC.hasOwnProperty(searhStr) ? rC[searhStr].forks : [];
    },
    isLoading(state) {
      return state.isLoading;
    },
    forksCount(state) {
      return state.forksCount;
    },
    forksPerReqPage(state) {
      return state.forksPerPage;
    },
    reqURL(state) {
      return state.url;
    },
    currentPageRT(state) {
      return state.currentPageRT;
    },
    currentSearchStr(state) {
      return state.searchStr;
    },
    isCaсhed(state) {
      return (searchStr) => {
        if (state.reposCatalog.hasOwnProperty(searchStr)) return true;
      }
    }    
  }
})

store.registerModule('TRModule', TRModule, { preserveState: true });

export default store;