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
import {mapGetters} from 'vuex';

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
  created() {
    // console.log('Results created-хук');
    // console.log('Посмотрим в vuex store, this.$store.state', this.$store.state);
  },
  updated() {
    // console.log('Results updated-хук');
    // console.log('Посмотрим в vuex store, this.$store.state', this.$store.state);
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