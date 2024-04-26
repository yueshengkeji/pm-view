<template>
  <div>
    <v-row>
      <v-col sm="4">
        <v-text-field label="项目名称" v-model="project.name"></v-text-field>
      </v-col>
      <v-col sm="4">
        <v-text-field label="合同名称" v-model="contractReceipt.contract.name"></v-text-field>
      </v-col>
      <v-col sm="4">
        <v-text-field label="开票单位" v-model="contractReceipt.company.name"></v-text-field>
      </v-col>
      <v-col sm="3">
        <v-text-field label="金额" type="number" v-model="contractReceipt.money"></v-text-field>
      </v-col>
      <v-col sm="3">
        <v-radio-group label="类型" v-model="contractReceipt.type" row>
          <v-radio :value="0" label="专票"></v-radio>
          <v-radio :value="1" label="普票"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col sm="3">
        <v-radio-group v-model="contractReceipt.advanceFlag" label="预收票" mandatory row>
          <v-radio :value="0" label="否"></v-radio>
          <v-radio :value="1" label="是"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col sm="3">
        <v-radio-group v-model="contractReceipt.state" label="已收票" mandatory row>
          <v-radio :value="0" label="否"></v-radio>
          <v-radio :value="1" label="是"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col sm="3">
        <v-text-field v-model="contractReceipt.advanceTime"
                      v-if="contractReceipt.advanceFlag == 1"
                      label="预收票日期" hide-details
                      readonly></v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {selectById} from "@/api/contractReceipt";

export default {
  name:'1320292Frame',
  props:{
    frameId:String
  },
  data() {
    return {
      contractReceipt: {
        contract: {},
        company: {},
        money: null,
        advanceFlag: 0,
        advanceTime: null,
        files: '',
        state: 1,
        type: 0
      },
      project:{}
    }

  },
  watch:{
    frameId(){
      this.loadData()
    }
  },
  created(){
    this.loadData()
  },
  methods:{
    loadData(){
      if(this.frameId){
        selectById({id:this.frameId}).then(res=>{
          this.contractReceipt = res
          if(res.contract && res.contract.projects){
            this.project = res.contract.projects[0]
          }
        })
      }
    }
  }
}
</script>
<style scoped>

</style>