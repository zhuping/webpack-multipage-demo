<template>
  <div>
    Hello World! I am tmall.
    <p>
      <a @click="showModal = true" class="btn btn-gray">点我</a>
    </p>
    <v-dialog v-if="showModal" @close="showModal = false">
      <h3 slot="header">Tamll</h3>
    </v-dialog>
  </div>
</template>

<script>
  import dialog from '../../components/dialog'
  
  export default {
    data() {
      return {
        showModal: false
      }
    },
    components: {
      'v-dialog': dialog
    }
  }
</script>
