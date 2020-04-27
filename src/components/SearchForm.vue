<template>
  <div class="hello">
    <form @submit.prevent="onSubmit">
      <div class="form-row el-h-40">
        <div class="col-mr">
          <label class="col-form-label" for="searchStr">Введите имя репозитория:</label>
        </div>
        <div class="col-mr">
          <input class="form-control el-w" type="text" id="searchStr" placeholder=":owner/:repositoryName" v-model="form.searchStr">
        </div>
        <div>
          <button class="btn btn-primary" type="submit" :disabled="!isValid">Поиск</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
export default {
  name: 'SearchForm',
  data() {
    return {
      form: {
        searchStr: ''
      }
    }
  },
  methods: {
    ...mapActions(['fetchForks', 'fetchForksCount', 'readCachedRepo', 'storeSearchStr']),
    async onSubmit() {
      let params = {
          page: 1,
          searchStr: this.form.searchStr
      };
      // Если ранее делали запрос по такой строке,
      // то данные кэшированы.      
      if (this.isCaсhed(this.form.searchStr)) {
        this.readCachedRepo(params);
        this.storeSearchStr(this.form.searchStr);
      } else {
        await this.fetchForksCount(this.form.searchStr);
        if (this.forksCount !== 0) {
          await this.fetchForks(params);
        } else {
          console.log('Количество форков = 0.');
        }
      }
      // Проверить роут, и при необходимости переключить экран.
      if (this.$route.name == 'Home') {
        this.$router.push({name: 'Results'});
      }
    }
  },
  computed: {
    ...mapGetters(['forksCount', 'isCaсhed', 'currentSearchStr']),
    isValid() {
      // Можно продумать сложный алгоритм проверки 
      // введёного значения пути на валидность.
      return this.form.searchStr.trim();
    }
  },
  watch: {
    // Для экземпляров SearchForm синхронизируем 
    // значения поисковой строки при переходе по роутам.
    currentSearchStr(newValue) {
      this.form.searchStr = newValue;
    }
  },
  created() {
    this.form.searchStr = this.currentSearchStr;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.hello {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.col-mr {
  margin-right: 0.5em;
}
.el-w{
   width: 395px;
}
.el-h-40{
  height: 40px;
}

</style>
