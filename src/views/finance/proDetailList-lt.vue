<template>
  <div>
    <procurement-list :type="3"></procurement-list>
  </div>
</template>

<script>
import procurementList from "@/views/finance/procurementList.vue";

export default {
  components: {
    procurementList
  },
  name: "procurementList-lt",
  mounted() {

  }
}
</script>

<style scoped>

</style>