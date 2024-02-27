<template>
  <div>
    <v-subheader>合同登记</v-subheader>
    <v-form ref="contractForm" class="pa-2">
      <v-row>
        <v-col lg="4" md="4" cols="12">
          <v-text-field label="合同名称" v-model="data.name"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-text-field label="甲方" v-model="data.partyA.name"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-text-field label="乙方" v-model="data.partyB.name"></v-text-field>
        </v-col>
        <v-col lg="4" md="4">
          <v-text-field label="合同金额" v-model="data.price"></v-text-field>
        </v-col>
        <v-col lg="4" md="4">
          <v-text-field label="开票类型" v-model="data.taxType.name"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-text-field label="项目名称" v-model="data.projects[0].name"></v-text-field>
        </v-col>
        <v-col lg="4" md="4" cols="12">
          <v-text-field label="备注" v-model="data.remark"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-data-table :items="procurementList"
                        :headers="procurementHeader"
                        hide-default-footer>
            <template v-slot:item.pmNumber="{item}">
              <a target="_blank"
                 :href="$router.options.base + 'approve/by-frame-id/' + item.id" >{{item.pmNumber}}</a>
            </template>
            <template v-slot:item.state="{item}">
              <v-chip v-if="item.state === 1" small target="_blank" :to="'/approve/by-frame-id/'+item.id">已审核</v-chip>
              <v-chip v-else
                      color="error"
                      small
                      target="_blank"
                      :to="'/approve/by-frame-id/'+item.id">
                未审核
              </v-chip>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import {loadById} from '@/api/contract'
import {getProByContract} from "@/api/procurement";

export default {
  name: "frame-10564",
  data: () => ({
    data: null,
    procurementHeader: [
      {text: '订单号', value: 'pmNumber'},
      {text: '采购日期', value: 'voucherDate'},
      {text: '状态', value: 'state'},
    ],
    procurementList: []
  }),
  watch: {
    frameId: {
      handler() {
        this.reset()
        this.loadData()
      }
    }
  },
  props: {
    frameId: String,
    frameCoding: String
  },
  created() {
    this.reset();
    this.loadData();
  },
  methods: {
    loadData() {
      loadById(this.frameId).then(contract => {
        if(contract.partyA == null){
          contract.partyA = {id:'-',name:'无'};
        }
        this.data = contract
      })
      getProByContract({contractId: this.frameId}).then(result => {
        this.procurementList = result
      })
    },
    reset() {
      this.data = {
        name: null,
        partyA: {name: null},
        partyB: {name: null},
        price: 0,
        taxType: {name: null},
        projects: [{}],
        remark: null,
      }
    }
  }
}
</script>

<style scoped>

</style>