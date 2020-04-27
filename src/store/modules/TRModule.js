export default {
  state: {
    url: '',            // Буфферное значение URL. Используется при пагинации Таблицы результатов.
    proxiURL: 'http://localhost:8080',
    error: null,
    perPage: 10,        // Количество форков на страницу таблицы "результат поиска".
    searchStr: '',      // Буфферное значение. Запрос в форме поиска.
    reposCatalog: {},   // Каталог по Репозиториям. Кэшированные данные всех результатов поисков.
    forksCount: 0,      // Кол-во форков. Для каждого репозитория специфичное значение.
    forksPerPage: 1,    // Зависит от внешнего API. Для Github = 30.
    currentPageRT: 1,   // Буфферное значение. Номер страницы в Таблице результатов. Равно номер пагинации.
    isLoading: false    // Флаг загрузки. Вкл./выкл. анимацию.
  },
  mutations: {
    setError(state, error) {
      state.error = error;
    },
    clearError(state) {
      state.error = null;
    },
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
    async fetchForksCount({ commit, state }, searchStr) {
      commit('startLoading');

      let [ repoOwner, repoName ] = searchStr.trim().split('/');
      let url = `${state.proxiURL}/forkscount?repoOwner=${repoOwner}&repoName=${repoName}`;

      // Запрос на proxi-сервер.
      const response = await fetch(url);
      if (response.ok) {
        const forks = await response.json();
        commit('setForksCount', forks);

      } else {
        console.warn('Ошибка HTTP: ' + response.status);
        commit('setError', response);
      }

      commit('endLoading');
    },

    async fetchForks({ commit, state }, params) {      
      commit('startLoading');   // Отображаем компонент с анимацией загрузки.
      let { page, searchStr } = params;
      let [ repoOwner, repoName ] = searchStr.trim().split('/');
      let  url = `${state.proxiURL}/forks/?repoOwner=${repoOwner}&repoName=${repoName}`;

      if (page == 1) {
        commit('setURL', url);
      }

      let specifiedURL = (page > 1) ? url + `&page=${page}` : url;
      
      const response = await fetch(specifiedURL);  // Получаем заголовки ответа.
      if (response.ok) {
        const res = await response.json();  // Получаем тело ответа.

        if (page == 1) {
          let confObj = {
            searchStr,
            length: res.size
          };
          commit('configReposCatalog', confObj);
          commit('setSearchStr', searchStr);              // Запоминаем строку в форме поиска.
          commit('setForksPerPage', res.forks.length);    // Запоминаем количество форков на страницу(порцию данных) ответа с API.
        }

        let repoInfo = {
          searchStr,
          forks: res.forks,
          page
        };        

        commit('updateReposCatalog', repoInfo);       // Сохраняем в Catalog массив форков репозитория.
      } else {  // (!response.ok)
        console.warn('Ошибка HTTP: ' + response.status);
        commit('setError', response);
        
        if (page == 1) {
          console.warn('Проверьте значение в поле ввода на соответствие шаблону :owner/:repositoryName');
        } else {
          console.warn('Повторите попытку попозже.');
        }   
      }

      commit('endLoading');
    },

    async fetchSearchPage({ commit, state }, params ) {
      commit('startLoading');   // Отображаем компонент с анимацией загрузки.
      // page - страница пагинации в таблице результатов.
      let { repository, page } = params;
      let  url = `${state.proxiURL}/search/?repository=${repository}`;
      const response = await fetch(url);

      if (response.ok) {
        const res = await response.json();
        commit('setForksPerPage', res.forks[0].length);    // Запоминаем количество форков на страницу(порцию данных) ответа с API.

        let searchStr = res.searchStr;
        let confObj = {
          searchStr,
          length: res.size
        };        
        let reqPage = Math.ceil(page * state.perPage / state.forksPerPage);   // reqPage - страница запроса/порция данных c API.
        let repoInfo = {
          searchStr,
          page: reqPage,
          forks: res.forks[reqPage - 1]
        };

        commit('setForksCount', res.forksCount);
        commit('configReposCatalog', confObj);
        commit('setSearchStr', searchStr);              // Запоминаем строку в форме поиска.        
        commit('updateReposCatalog', repoInfo);         // Сохраняем в Catalog массив форков репозитория.
        commit('setCurrentPageRT', page);
      } else {
        console.warn('Ошибка HTTP: ' + response.status);
        commit('setError', response);
      }

      commit('endLoading');
    },

    storeCurrentPageRT({ commit }, page) {
      commit('setCurrentPageRT', page);
    },
    readCachedRepo({ commit }, params) {
      commit('switchStore', params);
    },
    storeSearchStr({ commit }, str) {
      commit('setSearchStr', str);
    }
  },
  getters: {
    allForks(state, getters) {
      let rC = state.reposCatalog;
      let searhStr = getters.currentSearchStr;
      return rC.hasOwnProperty(searhStr) ? rC[searhStr].forks : [];
    },
    isLoading: state => state.isLoading,
    forksCount: state => state.forksCount,
    perPage: state => state.perPage,
    forksPerReqPage: state => state.forksPerPage,
    reqURL: state => state.url,
    currentPageRT: state => state.currentPageRT,
    currentSearchStr: state => state.searchStr,
    // Для передачи параметра в геттер возвращаю функцию.
    isCaсhed(state) {
      return (searchStr) => {
        if (state.reposCatalog.hasOwnProperty(searchStr)) return true;
      }
    },
    error: state => state.error
  }  
}