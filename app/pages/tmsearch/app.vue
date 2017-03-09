<template>
  <div>
    Hello World! I am tmall.
    <p>
      <a v-on:click="clickMe" class="btn btn-gray">点我</a>
    </p>
  </div>
</template>

<script>
  export default {
    methods: {
      clickMe: function(event) {
        alert(2)
      }
    }
  }
</script>
