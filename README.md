# table-vuex
Vue + vuex + route.

## Описание
Приложение, которое в табличном виде отображает forks введенного в поисковую строку репозитория (для ввода используется имя репозитория вида :owner/:repositoryName).  

Ещё одна фича: по ссылке можно перейти к определенной странице результатов поиска для определенного репозитория.  
Например: http://localhost:3000/seacrh?page=1&repository=someRepository 
Где: http://localhost:3000 домен на котором работает клиент.

### Инструкция по применению
1.  Стартуем прокси-сервер. Команда: npm run proxi
2.  Стартуем клиент. Команда: npm run serve
3.  Пользуемся ;)

### Компиляция в режиме отладки
```
npm run serve
```

### Запуск прокси-сервера
```
npm run proxi
```

### Настройка конфигурации
Для настройки vue-cli добавил vue.config.js в корень проекта.
See [Configuration Reference](https://cli.vuejs.org/config/).  
