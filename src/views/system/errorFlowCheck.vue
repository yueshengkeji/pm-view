<template>
  <div>
    <v-btn @click="updateStateHandler" :block="$vuetify.breakpoint.xs" :loading="loading">修复流程</v-btn>
    <v-btn :block="$vuetify.breakpoint.xs" :to="'/approve/by-approve-id/'+$route.params.approveId">查看详情</v-btn>
  </div>
</template>

<script>
import {updateState} from '@/api/usedFlowApi'
export default {
  name: "errorFlowCheck",
  data:()=>({
    loading:false,
  }),
  created() {
    // let id = this.$route.params.id
  },methods:{
    updateStateHandler(){
      this.loading = true
      updateState({id:this.$route.params.id,state:1}).then(()=>{
        this.message("操作成功")
      }).finally(()=>{
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>