<template>
  <v-container>
    <v-form ref="form">
      <v-row>
        <v-col sm="6" v-if="contractItem == null">
          <v-autocomplete label="合同名称"
                          v-model="contractReceipt.contract"
                          :items="contractList"
                          :search-input.sync="searchContract"
                          item-text="name"
                          return-object></v-autocomplete>
        </v-col>
        <v-col sm="6" v-if="contractItem == null">
          <v-autocomplete label="开票单位"
                          v-model="contractReceipt.company"
                          :items="companyList"
                          :search-input.sync="searchCompany"
                          :rules="[v => !!v || '请填写单位']"
                          item-text="name"
                          return-object></v-autocomplete>
        </v-col>
        <v-col sm="6" v-if="contractItem != null">
          <v-text-field label="合同名称" readonly
                        v-model="contractReceipt.contract.name"></v-text-field>
        </v-col>
        <v-col sm="6" v-if="contractItem != null">
          <v-text-field label="开票单位" readonly
                        v-model="contractReceipt.company.name"></v-text-field>
        </v-col>
        <v-col sm="3">
          <v-text-field label="金额" type="number" :rules="[v => !!v || '请填写金额']"
                        v-model="contractReceipt.money"></v-text-field>
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
          <v-menu v-model="menu1" transition="scale-transition" offset-y :close-on-content-click="false"
                  min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="contractReceipt.advanceTime"
                            v-show="contractReceipt.advanceFlag == true"
                            label="预收票日期" hide-details
                            readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="contractReceipt.advanceTime" no-title scrollable
                           @change="menu1 = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="3">
          <v-radio-group v-model="contractReceipt.state" label="已收票" mandatory row>
            <v-radio :value="0" label="否"></v-radio>
            <v-radio :value="1" label="是"></v-radio>
          </v-radio-group>
        </v-col>

        <v-col sm="6">
          <file-upload :dense="true" @change="fileChangeHandler" :key="keyData"></file-upload>
        </v-col>
        <v-col sm="3">
          <easy-flow coding="1320292" dense ref="flow"></easy-flow>
        </v-col>
        <v-col cols="12">
          <v-spacer></v-spacer>
          <v-btn class="float-right" @click="submitAdd" small color="primary" @load="btnLoading">提交</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
<script>
import FileUpload from "@/components/fileUpload.vue";
import {insert} from "../../../../api/contractReceipt";
import {getContract} from "../../../../api/contract";
import {list as searchCompany} from '@/api/company'
import EasyFlow from "@/components/easyflow/easyFlow.vue";

export default {
  name: 'addContractReceipt',
  props: {
    contractItem: null
  },
  components: {EasyFlow, FileUpload},
  data() {
    return {
      contract: {
        name: null,
        partB: null,
      },
      contractList: [],
      searchContract: null,
      contractReceipt: {
        contract: null,
        company: null,
        money: null,
        advanceFlag: 0,
        advanceTime: null,
        files: '',
        state: 1,
        type: 0
      },
      menu1: false,
      keyData: null,

      companyList: [],
      searchCompany: null,

      btnLoading: false

    }
  },
  created() {
    if (this.contractItem != null) {
      this.contractReceipt.company = this.contractItem.partyB
      this.contractReceipt.contract = this.contractItem
    }
  },
  watch: {
    contractItem: {
      handler() {
        this.reset()
        if (this.contractItem != null) {
          this.contractReceipt.company = this.contractItem.partyB
          this.contractReceipt.contract = this.contractItem
        }
      },
      deep: true
    },

    searchContract(val) {
      getContract({searchText: val}).then(result => this.contractList = result.rows)
    },
    searchCompany(val) {
      searchCompany(val).then(result => this.companyList = result)
    },
  },

  methods: {
    startFlow(r){
      if (r && r.id && r.state == 1) {
        this.$refs.flow.startFlow({
          title: r.company.name + '-收票登记:' + r.money,
          content: '',
          frameId: r.id,
          frameCoding: 1320292,
          frameColumn: 'id'
        })
      }
    },
    submitAdd() {
      if (this.$refs['form'].validate()) {
        this.btnLoading = true
        insert(this.contractReceipt).then((r) => {

          this.startFlow(r)

          this.contractReceipt.files = ''
          this.keyData = new Date().getTime()
          this.reset()
          this.$emit('getList')
          this.btnLoading = false
        })
      }
    },
    reset() {
      if (this.contractItem != null) {
        this.contractReceipt.company = this.contractItem.partyB
        this.contractReceipt.contract = this.contractItem
        this.contractReceipt.files = ''
        this.contractReceipt.money = '0'
      } else {
        this.$refs.form.reset()
      }
    },

    fileChangeHandler({files}) {
      this.contractReceipt.files = ""
      files.forEach(item => {
        this.contractReceipt.files += item.id + ";"
      })
    },
  }
}
</script>
