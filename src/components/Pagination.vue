<template>
  <nav aria-label="Page navigation example">
    <ul class="pagination justify-content-center">
      <li class="page-item" v-bind:class="{disabled: !hasPrev}">
        <a class="page-link" href="#" tabindex="-1" aria-label="Previous" @click.prevent="$emit('page-changed', prevPage)">&laquo;</a>
      </li>
      <li class="page-item" v-if="hasFirst()">
        <a class="page-link" href="#" @click.prevent="$emit('page-changed', 1)">1</a>
      </li>
      <li class="page-item" v-if="hasEllipsisLeft()">
        <a class="page-link">&hellip;</a>
      </li>
      <li v-for="page of pages" :key="page" class="page-item" v-bind:class="{active: page == current}">
        <a class="page-link" href="#" @click.prevent="$emit('page-changed', page)">{{page}}</a>
      </li>
      <li class="page-item" v-if="hasEllipsisRight()">
        <a class="page-link">&hellip;</a>
      </li>
      <li class="page-item" v-if="hasLast()">
        <a class="page-link" href="#" @click.prevent="$emit('page-changed', totalPages)">{{totalPages}}</a>
      </li> 
      <li class="page-item" v-bind:class="{disabled: !hasNext}">
        <a class="page-link" href="#" aria-label="Next" @click.prevent="$emit('page-changed', nextPage)">&raquo;</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    current: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 0
    },
    pageRange: {
      type: Number,
      default: 2
    }
  },
  computed: {
    pages() {
      let pages = [];
      
      for (let i = this.rangeStart; i <= this.rangeEnd; i++) {
        pages.push(i);
      }
      return pages;
    },
    rangeStart() {
      let start = this.current - this.pageRange;

      return (start > 0) ? start : 1;
    },
    rangeEnd() {
      let end = this.current + this.pageRange;

      return (end < this.totalPages) ? end : this.totalPages;
    },
    nextPage() {
      return this.current + 1;
    },
    prevPage() {
      return this.current - 1;
    },
    hasNext() {
      return this.current < this.totalPages;
    },
    hasPrev() {
      return this.current > 1;
    }
  },
  methods: {
    hasFirst() {
      return this.rangeStart !== 1;
    },
    hasLast() {
      return this.rangeEnd < this.totalPages;
    },
    hasEllipsisLeft() {
      return this.rangeStart > 2;
    },
    hasEllipsisRight() {
      return this.rangeEnd < this.totalPages - 1;
    }
  }
}
</script>