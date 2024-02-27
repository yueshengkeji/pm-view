<template>
  <div>
    <procurement-list :type="2"></procurement-list>
  </div>
</template>

<script>
import procurementList from "@/views/finance/procurementList.vue";

export default {
  components: {
    procurementList
  },
  name: "procurementList-colie",
  mounted() {

  }
}
</script>

<style scoped>

</style>