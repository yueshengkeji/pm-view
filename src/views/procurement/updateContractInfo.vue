<template>
  <!--    更新采购订单供货单位、修改采购合同、取消采购合同绑定、税率修改-->
  <div>
    <v-form ref="updateContractForm">
      <v-autocomplete v-model="data.company"
                      :search-input.sync="searchCompany"
                      :items.sync="companyList"
                      :rules="[v => !!v || '请指定供应单位']"
                      :loading="loading"
                      return-objectd
                      item-text="name"
                      item-value="id"
                      label="供应单位"></v-autocomplete>
      <v-autocomplete v-model="data.contract"
                      :items.sync="contractList"
                      :search-input.sync="searchContract"
                      @change="contractChange"
                      return-object
                      item-text="name"
                      open-on-clear
                      :loading="loading"
                      item-value="id"
                      label="采购合同"
                      clearable></v-autocomplete>
      <v-text-field v-model="data.tax" type="number" label="税率"></v-text-field>

      <v-checkbox :key="c.id" v-for="c in companyTypeList" :value="c.value" :label="c.name"
                  v-model="data.pm01326"></v-checkbox>
      <!--<v-radio-group label="采购单位" row v-model="data.pm01326">
          <v-radio :key="c.id" v-for="c in companyTypeList" :value="c.value" :label="c.name"></v-radio>
      </v-radio-group>-->
    </v-form>
  </div>
</template>

<script>
import {list} from '@/api/company'
import {getByCompanyId, getContractV2} from '@/api/contract'
import {updateContract} from '@/api/procurement'
import {getConfig, list as scList} from '@/api/systemConfig'

export default {
  name: "updateContractInfo",
  props: {
    procurement: Object,
  },
  model: {
    prop: 'procurement',
    event: 'change'
  },
  data: () => ({
    data: null,
    companyList: [],
    searchCompany: null,
    contractList: [],
    searchContract: null,
    loading: false,

    companyTypeList: []
  }),
  watch: {
    searchCompany(val) {
      this.loadCompany(val)
    },
    searchContract(val) {
      if (this.procurement.contract && val == this.procurement.contract.name) {
        return
      }
      this.loadContract(val)
    },
    procurement: {
      handler() {
        this.init()
      },
      deep: true
    }
  },
  created() {
    if (this.procurement) {
      this.init()
    } else {
      this.reset()
    }

    this.loadConfig()
  },
  methods: {
    init() {
      this.contractList = []
      this.companyList.push(this.procurement.company)
      if (this.procurement.contract) {
        this.contractList.push(this.procurement.contract)
      }
      this.data = this.procurement
      this.loadContractById()
    },
    loadContractById() {
      console.log("searchContract", this.searchContract)
      if (this.searchContract == null || this.searchContract == "") {
        getByCompanyId(this.data.company.id).then(result => {
          this.contractList = result
        })
      }
    },
    contractChange() {
      if (this.data.contract) {
        this.companyList.push(this.data.contract.partyB)
        this.data.company = this.data.contract.partyB
      }
    },
    reset() {
      this.data = {
        pm01326: '',
        company: null,
        contract: null,
        tax: 0,
      }
    },
    loadCompany(val) {
      list(val).then(result => this.companyList = result)
    },
    loadContract(companyName) {
      getContractV2({searchText: companyName}).then(result => {
        this.contractList = result.rows
      })
    },
    clearContract() {
      this.data.contract = {id: ''}
      return this.saveUpdate()
    },
    saveUpdate() {
      let valid = this.$refs.updateContractForm.validate()
      if (valid) {
        if (this.data.contract == null) {
          this.data.contract = {id: ''}
        }
        if (this.data.pm01326 == null) {
          this.data.pm01326 = ''
        }
        let data = {
          procurement: this.data,
        }
        return updateContract(data).then(result => {
          this.$emit("success", result)
        })
      } else {
        return new Promise((resolve, reject) => {
          reject()
        })
      }
    },
    loadConfig() {
      getConfig('PRO_COMPANY_TYPE').then(c => {
        scList({parent: c.id, itemsPerPage: 100, page: 1}).then(result => {
          if (result.rows.length > 0) {
            result.rows.forEach(item => {
              item.value = item.value || ''
            })
            console.log("result.rows", result.rows)
            this.companyTypeList = result.rows
          }
        })


      })
    }
  }
}
</script>

<style scoped>

</style>