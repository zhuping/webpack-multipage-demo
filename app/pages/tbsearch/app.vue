<template>
  <div>
    Hello World! I am taobao.
    <p>
      <a v-on:click="clickMe" class="btn btn-common">点我</a>
    </p>
  </div>
</template>

<script>
  export default {
    methods: {
      clickMe: function(event) {
        alert(1)
      }
    }
  }
</script>
