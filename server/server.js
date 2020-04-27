const express = require('express');
const fetch = require("node-fetch");
const app = express();

// Примитивная замена БД.
let REPOS_CATALOG = {};
let _forksCount = 0;

// Подключили плагин для работы с json.
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/forkscount', (req, res) => {
  let { repoOwner, repoName } = req.query;
  let url = `https://api.github.com/search/repositories?q=user:${repoOwner} repo:${repoName} ${repoName}`;

  new Promise( (resolve) => resolve(fetchForksCount(url)) )
    .then( forks => res.send(JSON.stringify(forks)) )
    .catch( err => console.error(err) );
});

async function fetchForksCount(url) {
  try {
    const response = await fetch(url);
    const repoInfo = await response.json();

    let {
      items: [
        {
          forks
        }
      ]          
    } = repoInfo;

    _forksCount = forks;
    return forks;
  } catch (error) {
    throw error;
  }
}

app.get('/forks', (req, res) => {
  let { repoOwner, repoName, page = 1 } = req.query;
  let url = `https://api.github.com/repos/${repoOwner}/${repoName}/forks`;
  let specifiedURL = (page > 1) ? url + `?page=${page}` : url;
  let params = {
    url: specifiedURL,
    repoOwner,
    repoName,
    page
  };

  new Promise( (resolve) => resolve(fetchForks(params)) )
    .then( data => res.send(JSON.stringify(data)) )
    .catch( err => console.error(err) );
});

async function fetchForks(params) {
  let { url, repoOwner, repoName, page } = params;
  let data = {};
  let confObj = {
    repoOwner,
    repoName
  };

  try {
    const response = await fetch(url);

    if (page == 1) {
      // Разбор заголовка link, вытащить значение кол-во страниц/порций данных.
      let headerLinkStr = response.headers.get('link');
      let linksArr = headerLinkStr.split(',');
      let linkLastStr = linksArr.find( link => link.includes('rel=\"last\"'));
      let lastPage = linkLastStr
        .match(/\?page=\d*/)[0]
        .split('=')[1];

      data.size = parseInt(lastPage);
      confObj.size = parseInt(lastPage);
      configReposCatalog(confObj);
    }

    const verboseForks = await response.json();  // Получаем тело ответа.
    let forksPerPage = verboseForks.length;

    let forks = verboseForks.map( (fork, index) => {
      let {
        full_name,
        owner: {
          login
        },
        stargazers_count,
        html_url
      } = fork;

      let simpleFork = Object.assign({}, 
        {id: forksPerPage * (page - 1) + index + 1}, 
        {full_name}, 
        {login}, 
        {stargazers_count}, 
        {html_url}
      );

      return simpleFork;
    });

    let repoInfo = {
      page,
      forks,
      searchStr: `${repoOwner}/${repoName}`
    }; 
    updateReposCatalog(repoInfo);

    data.forks = forks;
    return data;
  } catch (error) {
    throw error;
  }
}

app.get('/search', (req, res) => {
  let { repository } = req.query;
  let data = {
    size: 0,
    forks: [],
    searchStr: ''
  };

  for (let key in REPOS_CATALOG) {
    if (key.includes(repository)) {
      data.searchStr = key;      
      data.forks = REPOS_CATALOG[key].forks;
      data.forksCount = REPOS_CATALOG[key].forksCount;
      data.size = REPOS_CATALOG[key].forks.length;
    }
  }

  res.send(JSON.stringify(data));
});

function configReposCatalog(confObj) {
  let {repoOwner, repoName, size} = confObj;
  let key = repoOwner + '/' + repoName;
  let newRepo = {
    [key]: {
      repoName,
      repoOwner,
      forksCount: _forksCount,
      forks: new Array(size)
    }
  };

  REPOS_CATALOG = Object.assign(REPOS_CATALOG, newRepo);
}

function updateReposCatalog(repoInfo) {
  let {
    page,
    forks,
    searchStr,
  } = repoInfo;

  REPOS_CATALOG[searchStr].forks[page - 1] = forks;
}

app.listen(8080, () => console.log('Server has been started on port 8080...'));