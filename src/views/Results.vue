<template>
  <div class="results">
    <SearchForm />
    <div class="el-mb-2"></div>
    <div v-if="isLoading">
      <Loader />
    </div>
    <div v-else-if="forksCount">
      <ResultsTable />
    </div>
    <div v-else class="el-font-st">
      <p>Форки отсутствуют</p>
      <img src="@/assets/dyno.png" alt="Форки отсутствуют">
    </div>
  </div>
</template>

<script>
import ResultsTable from '@/components/ResultsTable';
import SearchForm from '@/components/SearchForm';
import Loader from '@/components/Loader';
import {mapGetters, mapActions} from 'vuex';

export default {
  name: 'Results',
  components: {
    ResultsTable,
    SearchForm,
    Loader
  },
  computed: {
    ...mapGetters(['isLoading', 'forksCount'])
  },
  methods: mapActions(['fetchSearchPage']),
  beforeRouteEnter(to, from, next) {
    if (to.name == 'Search') {
      let params = {
        page: parseInt(to.query.page),
        repository: to.query.repository
      };
      next( vm => vm.fetchSearchPage(params) );
    } else next();
  }
}
</script>

<style scoped>
.el-mb-2 {
  margin-bottom: 2rem;
}
.el-font-st {
  font-size: 1rem;
  color: #cbe3f9;
  font-weight: bold;
}
</style>