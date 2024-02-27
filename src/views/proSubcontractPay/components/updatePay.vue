<template>
  <v-container>
    <v-form ref="proSubContractPayUpdateForm">
      <v-row>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.contractName" label="合同名称" :readonly="ifReadonly"
                        :rules="rules.contractNameRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.contractMoney" label="合同总价" :readonly="ifReadonly"
                        :rules="rules.contractMoneyRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.project.name" label="项目" readonly></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.companyName" label="付款单位" :readonly="ifReadonly"
                        :rules="rules.companyNameRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.companyBlank" label="付款单位银行" :readonly="ifReadonly"
                        :rules="rules.companyBlankRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.companyNumber" label="银行账号" :readonly="ifReadonly"
                        :rules="rules.companyNumberRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.payMoney" label="付款金额" :readonly="ifReadonly"
                        :rules="rules.payMoneyRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.earlyMoney" label="初审价" :rules="rules.earlyMoneyRule"
                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.accountMoney" label="财务结算价" :rules="rules.accountMoneyRule"
                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="proSubcontractPay.sumPayMoney" label="累计付款金额" :readonly="ifReadonly"
                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" v-if="ifReadonly == false">
          <easy-flow coding="1320281" ref="subcontractPayUpdateFlow"></easy-flow>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="proSubcontractPay.payInfo" label="付款事由" :readonly="ifReadonly" :rows="2"
                        :rules="rules.payInfoRule"></v-textarea>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="proSubcontractPay.remark" label="备注" :readonly="ifReadonly"
                        :rules="rules.remarkRule"></v-text-field>
        </v-col>
        <v-col cols="12">
          <file-upload :clear="clear" @change="fileUpload"></file-upload>
        </v-col>
      </v-row>
    </v-form>


    <v-data-table
        :headers="headers"
        :items="desserts"
        class="elevation-1"
        hide-default-footer
    >
      <template v-slot:item.actions="{item}">
        <v-btn class="mr-1" x-small @click="downloadFile(item)">下载</v-btn>
        <v-btn x-small color="error" @click="deleteFile(item)">删除</v-btn>
      </template>
    </v-data-table>

    <!--加载框-->
    <v-dialog v-model="loadDialog"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          正在提交。。。
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>
<script>
import proSubcontractPay from "../../../api/proSubcontractPay";
import fileUpload from "../../../components/fileUpload";
import easyFlow from "../../../components/easyflow/easyFlow";

export default {
  name: 'updatePay',
  components: {fileUpload, easyFlow},
  props: {
    frameId: String,
  },
  data: () => ({
    loadDialog: false,
    ifReadonly: false,

    proSubcontractPay: {
      project: {},
      contractName: null,
      contractId: null,
      contractMoney: null,
      payMoney: null,
      payInfo: null,
      companyName: null,
      companyId: null,
      companyBlank: null,
      companyNumber: null,
      earlyMoney: null,
      accountMoney: null,
      sumPayMoney: null,
      remark: null,
      staff: null,
      filesUrl: null,
    },

    headers: [
      {text: '文件名称', value: 'name', sortable: false},
      {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],

    tempFile: {},
    files: [],

    rules: {
      contractNameRule: [
        v => !!v || '必填字段！', v => (!!v && v.length < 50) || '不超过50个字符'
      ],
      contractMoneyRule: [
        v => !!v || '必填字段！', v => v >= 0 || '请输入正确的数值'
      ],
      projectNameRule: [
        v => !!v || '请选择项目！',
      ],
      payMoneyRule: [
        v => !!v || '必填字段！', v => v >= 0 || '请输入正确的数值'
      ],
      payInfoRule: [
        v => !!v || '必填字段！', v => (!!v && v.length < 1000) || '不超过1000个字符'
      ],
      companyNameRule: [
        v => !!v || '必填字段！',
      ],
      companyBlankRule: [
        v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'
      ],
      companyNumberRule: [
        v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'
      ],
      earlyMoneyRule: [
        v => (v == '0' || v == null || (!!v && v >= 0)) || '请输入正确的数值'
      ],
      accountMoneyRule: [
        v => (v == '0' || v == null || (!!v && v >= 0)) || '请输入正确的数值'
      ],
      sumPayMoneyRule: [
        v => (v == '0' || v == null || (!!v && v >= 0)) || '请输入正确的数值'
      ],
      remarkRule: [
        v => (v == null || (!!v && v.length < 1000)) || '不超过1000个字符'
      ],
    },
    clear:false,
  }),

  watch: {
    frameId: {
      handler() {
        if (this.frameId != null) {
          this.reset()
          this.loadPay()
          this.getAttach()
        }
      },
      deep: true
    }

  },

  created() {
    if (this.frameId != null) {
      this.reset()
      this.loadPay()
      this.getAttach()
    }
  },

  methods: {
    fileUpload(data) {
      this.files = []
      for (let i = 0; i < data.files.length; i++) {
        this.tempFile.attachId = data.files[i].id
        this.tempFile.fileUrl = data.files[i].ftpPath
        this.tempFile.name = data.files[i].fileName
        this.files.push(this.tempFile)
        this.tempFile = {
          id: null,
          attachId: null,
          fileUrl: null,
          name: null
        }
        if (i == 0 && this.proSubcontractPay.filesUrl != null) {
          this.proSubcontractPay.filesUrl = this.proSubcontractPay.filesUrl + ',' + data.files[i].ftpPath
        } else if (i == data.files.length - 1) {
          this.proSubcontractPay.filesUrl = this.proSubcontractPay.filesUrl + data.files[i].ftpPath
        } else {
          this.proSubcontractPay.filesUrl = this.proSubcontractPay.filesUrl + data.files[i].ftpPath + ','
        }
      }
    },
    getAttach() {
      proSubcontractPay.getFiles({id: this.frameId}).then(res => {
        this.desserts = res
      })
    },
    downloadFile(item) {
      let a = document.createElement('a');
      a.href = `/api/files/downloadFile?filePath=` + item.fileUrl + `&downloadFile=` + item.name;
      a.target = "_blank";
      a.click();
    },

    deleteFile(item) {
      proSubcontractPay.delete(item).then(res => {
        if (res == 1) {
          this.getAttach()
        }
      })
    },

    loadPay() {
      this.ifReadonly = false
      proSubcontractPay.getById({id: this.frameId}).then(res => {
        if (res != null) {
          if (res.state == 1) {
            this.ifReadonly = true
          }
          this.proSubcontractPay = res
        }
      })
    },

    saveFile(res) {
      if (res.id != null) {
        for (let i = 0; i < this.files.length; i++) {
          this.files[i].contractPayId = res.id
        }
        proSubcontractPay.bindFile(this.files).then(res => {
          if (res != null) {
            this.files = []
          }
        })
      }
    },

    validateForm() {
      let flag = null
      if (this.$refs['proSubContractPayUpdateForm'].validate()) {
        flag = true
      } else {
        flag = false
      }
      return flag
    },

    submitUpdate() {
      this.loadDialog = true
      return proSubcontractPay.updateProSubcontractPay(this.proSubcontractPay).then(res => {
        if (res != null) {
          this.saveFile(res)
          this.loadPay()

          this.$refs['subcontractPayUpdateFlow'].startFlow({
            title: "关于对《" + res.project.name + "》的分包合同付款的修改",
            content: res.remark == null ? "" : res.remark,
            frameId: res.id,
            frameCoding: 1320281,
            frameColumn: 'id'
          }).then()
        }

        this.loadDialog = false
        return res
      })
    },

    clearInit() {
      this.clear = true
    },

    reset() {
      this.clear = false
      this.proSubcontractPay = {
        project: {},
        contractName: null,
        contractId: null,
        contractMoney: null,
        payMoney: null,
        payInfo: null,
        companyName: null,
        companyId: null,
        companyBlank: null,
        companyNumber: null,
        earlyMoney: null,
        accountMoney: null,
        sumPayMoney: null,
        remark: null,
        staff: null,
        filesUrl: null,
      }
    },
  }
}
</script>
