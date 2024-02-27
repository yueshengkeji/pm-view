<template>
  <div>
    <v-container>
      <v-form ref="companyForm">
        <v-row>
          <v-col md="3">
            <v-text-field v-model="company.name"
                          :error="nameError"
                          :error-messages="nameErrorMsg"
                          @change="checkCompany"
                          label="公司名称(必填)"
                          :rules="rules.nameRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-radio-group v-model="company.isSupply"
                           row mandatory dense
                           label="是否供应商">
              <v-radio label="否" value="0"></v-radio>
              <v-radio label="是" value="1"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col md="3">
            <v-radio-group v-model="company.isClient" row mandatory dense
                           label="是否客户">
              <v-radio label="否" value="0"></v-radio>
              <v-radio label="是" value="1"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.bankNumber"
                          label="银行账户"
                          :rules="rules.bankNumberRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.openAccount"
                          label="开户行"
                          :rules="rules.openAccountRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.lineNum"
                          label="银行行号"
                          :rules="rules.lineNumRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.relationP"
                          label="联系人"
                          :rules="rules.relationPRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.telephoneP"
                          label="联系方式"
                          :rules="rules.phoneRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.address"
                          label="单位地址"
                          :rules="rules.addressRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.jurisdiction"
                          label="管辖区"
                          :rules="rules.jurisdictionRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.street"
                          label="街道"
                          :rules="rules.streetRule"
            ></v-text-field>
          </v-col>

          <v-col md="3">
            <v-text-field v-model="company.bankNumber2"
                          label="银行账户2"
                          :rules="rules.bankNumberRule"
            ></v-text-field>
          </v-col>
          <v-col md="3">
            <v-text-field v-model="company.openAccount2"
                          label="开户行2"
                          :rules="rules.openAccountRule"
            ></v-text-field>
          </v-col>

        </v-row>
      </v-form>
    </v-container>
    <!--加载框-->
    <v-dialog v-model="loadDialog"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          正在处理。。。
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import {addCompany, getCompanyByName,update} from "../api/company";

export default {
  name: "add-company",
  data: () => ({
    loadDialog: false,
    company: null,

    rules: {
      nameRule: [
        v => !!v || '必填字段！', v => (!!v && v.length < 100) || "不能超过100个字符"
      ],
      unitNumberRule: [
        v => (v == null || v == '' || (!!v && v.length) < 40) || "不超过40个字符"
      ],
      bankNumberRule: [
        v => (v == null || v == '' || (!!v && v.length) < 40) || "不超过40个字符"
      ],
      openAccountRule: [
        v => (v == null || v == '' || (!!v && v.length) < 40) || "不超过40个字符"
      ],
      relationPRule: [
        v => (v == null || v == '' || (!!v && v.length) < 21) || "不超过20个字符"
      ],
      lineNumRule: [
        v => (v == null || v == '' || (!!v && v.length) <= 18) || "不超过18个字符"
      ],
      phoneRule: [
        v => {
          const pattern = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
          return (pattern.test(v) || v == '' || v == null) || '请输入正确的手机号'
        }
      ],
      addressRule: [
        v => (v == null || v == '' || (!!v && v.length) < 80) || "不超过80个字符"
      ],
      jurisdictionRule: [
        v => (v == null || v == '' || (!!v && v.length) < 50) || "不超过50个字符"
      ],
      streetRule: [
        v => (v == null || v == '' || (!!v && v.length) < 50) || "不超过50个字符"
      ],
    },
    nameErrorMsg: null,
    nameError: false,
  }),
  props: {
    item: Object
  },
  watch: {
    item: {
      handler() {
        if (this.item) {
          this.company = Object.assign({}, this.item)
        }
      }
    }
  },
  created() {
    if(this.item){
      this.company = Object.assign({}, this.item)
    }else{
      this.reset()
    }
  },
  model:{
    prop:'item',
    event:'change'
  },
  methods: {
    checkCompany() {
      getCompanyByName(this.company.name).then(result => {
        if (result) {
          this.nameError = true
          this.nameErrorMsg = '单位已存在，请重新输入单位名称'
        } else {
          this.nameError = false
          this.nameErrorMsg = ''
        }
      }).catch(() => {
        this.nameError = false
        this.nameErrorMsg = ''
      })
    },
    validateForm() {
      let flag = null
      if (this.$refs['companyForm'].validate()) {
        flag = true
      } else {
        flag = false
      }
      return flag
    },

    saveCompany() {
      if (this.validateForm() && !this.nameError) {
        this.loadDialog = true
        let a
        if (this.company.id) {
          a = update(this.company)
        } else {
          a = addCompany(this.company)
        }
        return a.then(res => {
          if (res != null) {
            this.reset()
          }
          this.loadDialog = false
          return res;
        })
      } else {
        return new Promise((resolve, reject) => {
          reject("validate error")
        })
      }
    },

    reset() {
      this.company = {
        name: null,
        isSupply: null,
        isClient: null,
        bankNumber: null,
        openAccount: null,
        relationP: null,
        telephoneP: null,
        address: null,
        jurisdiction: null,
        street: null,
        bankNumber2: null,
        openAccount2: null,
        lineNum:null,
      }
    }
  }
}
</script>