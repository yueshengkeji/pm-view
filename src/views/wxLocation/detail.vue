<template>
  <div>
    <detail :frame-id="id"></detail>
  </div>
</template>

<script>
export default {
  name: "expenseDetail",
  components:{
    detail:()=>import("@/components/1320285.vue")
  },
  data:()=>({
    id:null,
  }),
  created() {
    this.id = this.$route.params.id
  }
}
</script>

<style scoped>

</style>