<template>
  <div class="home">
    <h1>Welcome to github search engine!</h1>
    <SearchForm />
    <img src="@/assets/gitcat.png" alt="Github cat"/>
  </div>
</template>

<script>
// @ is an alias to /src
import SearchForm from '@/components/SearchForm.vue'

export default {
  name: 'Home',
  components: {
    SearchForm
  }
}
</script>

<style scoped>
h1 {
  margin-bottom: 2rem;
}
img {
  margin-top: 2.5rem;
}
</style>