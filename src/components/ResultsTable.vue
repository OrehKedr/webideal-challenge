<template>
<div>
  <div class="table-responsive">
    <table class="table table-hover table-striped table-sizes">
      <caption>Список форков</caption>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Полное название репозитория</th>
          <th scope="col">Владелец</th>
          <th scope="col">Количество звезд</th>
          <th scope="col">Ссылка на репозиторий форка</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fork of displayedForks" :key="fork.id">
          <th scope="row">{{fork.id}}</th>
          <td>{{fork.full_name}}</td>
          <td>{{fork.login}}</td>
          <td>{{fork.stargazers_count}}</td>
          <td>{{fork.html_url}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <keep-alive>
    <Pagination v-bind:current="currentPage" v-bind:totalPages="pageCount" @page-changed="changePage" />
  </keep-alive>
</div>

</template>

<script>
import {mapGetters, mapActions} from 'vuex';
import Pagination from '@/components/Pagination';

export default {
  name: 'ResultsTable',
  components: {
    Pagination
  },
  data() {
    return {
      perPage: 10,  // Количество форков на страницу таблицы "результат поиска".
      currentPage: 1,  // Указатель на страницу в пагинации.
    }
  },
  computed: {
    ...mapGetters(['allForks', 'forksCount','forksPerReqPage', 'reqURL', 'currentPageRT', 'currentSearchStr']),
    displayedForks() {
      let correctedCurPage = this.currentPage - this.reqPage(this.currentPage) * this.pageRatio() + this.pageRatio();
      let from = (correctedCurPage - 1) * this.perPage;
      let to = from + this.perPage;
      let forks = this.allForks[this.reqPage(this.currentPage) - 1];

      return forks ? forks.slice(from, to) : [];
    },    
    pageCount() {
      return Math.ceil(this.forksCount / this.perPage);
    },
  },
  methods: {
    ...mapActions(['fetchForks', 'storeCurrentPageRT']),

    async changePage(page) {
      this.storeCurrentPageRT(page);
      // Проверяем данные в кэше.
      // Если undefined, то сделать сетевой запрос.
      if (!this.allForks[this.reqPage(page) - 1]) {
        let params = {
          url:  this.reqURL,
          page: this.reqPage(page),
          searchStr: this.currentSearchStr
        };
        // this.storeCurrentPageRT(page);
        await this.fetchForks(params);
      } else {
        this.currentPage = page;
      }
    },
    reqPage(page) {
      return Math.ceil(page * this.perPage / this.forksPerReqPage);
    },

    // Расчитываем соотношение: 
    // какое количество страниц в таблице "результат поиска", 
    // приходиться на одну страницу http-запроса.
    pageRatio() {
      return Math.ceil(this.forksPerReqPage / this.perPage);
    }
  },
  created() {
    console.log('ResultTable created-хук');
    this.currentPage = this.currentPageRT;

    if (this.$route.name == 'seacrh&page') {
      let repoName = this.$route.query;
      let page = this.$router.params.pathMatch;
      console.log('this.$route.name: ', this.$route.name);
      console.log('repoName: ', repoName);
      console.log('page: ', page);
    }
  },
  mounted() {
    console.log('ResultTable mounted-хук');
  },
  updated() {
    console.log('ResultTable updated-хук');
  }
}
</script>

<style scoped>
.table-sizes {
  width: 1110px;
  min-width: 875px;
}
</style>