<template>
  <v-container>
    <v-form ref="proSubContractForm">
      <v-row>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="subcontract.name" label="合同名称" :rules="rules.nameRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="subcontract.money" label="合同金额" :rules="rules.moneyRule"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-combobox
              :disabled="offProject"
              v-model="subcontract.project"
              label="项目"
              :rules="rules.projectRule"
              :search-input.sync="searchProject"
              :items="projectItems"
              item-text="name"
              return-object
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-combobox
              v-model="tempPartyA"
              label="甲方"
              :rules="rules.partyARule"
              :search-input.sync="searchPartyA"
              :items="partyAItems"
              item-text="name"
              return-object
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-combobox
              v-model="tempPartyB"
              label="乙方"
              :rules="rules.partyBRule"
              :search-input.sync="searchPartyB"
              :items="partyBItems"
              item-text="name"
              return-object
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="subcontract.signDate"
                  label="签订日期"
                  :rules="rules.signDateRule"
                  required
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
                v-model="subcontract.signDate"
                @input="$refs.menu.save(subcontract.signDate),menu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="6">
          <easy-flow coding="1320282" ref="subcontractFlow" :default-flow-name="flowName"></easy-flow>
        </v-col>

        <v-col cols="3">
          <v-menu
              ref="menu2"
              v-model="menu2"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="subcontract.startDate"
                  label="合同开始日期"
                  required
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
                v-model="subcontract.startDate"
                @input="$refs.menu2.save()"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="3">
          <v-menu
              ref="menu3"
              v-model="menu3"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="subcontract.endDate"
                  label="合同截止日期"
                  required
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
                v-model="subcontract.endDate"
                @input="$refs.menu2.save()"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="subcontract.remark" label="备注"></v-text-field>
        </v-col>

        <v-col cols="12">
          <file-upload :clear="clear" @change="fileUpload"></file-upload>
        </v-col>
      </v-row>

    </v-form>
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
import proSubcontract from "../../../api/proSubcontract";
import fileUpload from "../../../components/fileUpload";
import {search} from "../../../api/project";
import {list} from '@/api/company';
import easyFlow from "../../../components/easyflow/easyFlow";


export default {
  name: 'insertPay',
  components: {fileUpload, easyFlow},
  data: () => ({
    loadDialog: false,
    menu2:false,
    menu3:false,
    clear: false,
    menu: false,

    searchProject: null,
    projectItems: [],

    searchPartyA: null,
    partyAItems: [],
    tempPartyA: null,
    tempPartyA2: null,

    searchPartyB: null,
    partyBItems: [],
    tempPartyB: null,
    tempPartyB2: null,

    subcontract: null,
    rules: {
      nameRule: [
        v => !!v || '必填字段', v => (!!v && v.length < 50) || '不超过50个字符'
      ],
      moneyRule: [
        v => !!v || '必填字段！', v => v >= 0 || '请输入正确的数值'
      ],
      projectRule: [
        v => !!v || '必填字段！', v => !!v.id || "请选择项目"
      ],
      partyARule: [
        v => !!v || "请填写甲方"
      ],
      partyBRule: [
        v => !!v || "请填写乙方"
      ],
      remarkRule: [
        v => !!v || '必填字段', v => (!!v && v.length < 500) || '不超过500个字符'
      ],
      signDateRule: [
        v => !!v || '必填字段'
      ],
    },

    tempFile: {},
    files: [],
  }),

  watch: {
    searchProject: {
      handler() {
        if (this.searchProject != null) {
          this.getProjectBySeek(this.searchProject)
        }
      },
      deep: true,
    },

    searchPartyA: {
      handler() {
        if (this.searchPartyA != null) {
          this.getPartyA(this.searchPartyA)
        }
      },
      deep: true,
    },

    searchPartyB: {
      handler() {
        if (this.searchPartyB != null) {
          this.getPartyB(this.searchPartyB)
        }
      },
      deep: true,
    },

    tempPartyB: {
      handler() {
        if (this.tempPartyB != null) {
          if (this.tempPartyB.id == null) {
            this.subcontract.partyB.id = null
            this.subcontract.partyB.name = this.searchPartyB
          } else {
            this.subcontract.partyB.id = this.tempPartyB.id
            this.subcontract.partyB.name = this.tempPartyB.name
          }
        }
      },
      deep: true,
    },

    tempPartyA: {
      handler() {
        if (this.tempPartyA != null) {
          if (this.tempPartyA.id == null) {
            this.subcontract.partyA.id = null
            this.subcontract.partyA.name = this.searchPartyA
          } else {
            this.subcontract.partyA.id = this.tempPartyA.id
            this.subcontract.partyA.name = this.tempPartyA.name
          }
        }
      },
      deep: true,
    }


  },

  created() {
    this.reset()
    this.getProjectBySeek().finally(()=>{
      this.setDefaultProject()
    })
  },
  props: {
    type: null,
    flowName:null,
    project:null,
    offProject:{
      type:Boolean,
      default:false
    }
  },
  methods: {
    getProjectBySeek(str) {
      return search(str).then(res => {
        if (res.length > 0) {
          this.projectItems = res
        } else {
          this.tempProject.name = str
          this.tempProject.id = null
        }

      })
    },
    getPartyA(str) {
      list(str).then(res => {
        if (res.length > 0) {
          this.partyAItems = res
        } else {
          this.tempPartyA2.id = null
          this.tempPartyA2.name = str

          this.tempPartyA = this.tempPartyA2
        }

        if (window.localStorage.getItem("subcontractPartyA") != null) {
          this.partyAItems.push(JSON.parse(window.localStorage.getItem("subcontractPartyA")))
        }
      })
    },
    getPartyB(str) {
      list(str).then(res => {
        if (res.length > 0) {
          this.partyBItems = res
        } else {
          this.tempPartyB2.id = null
          this.tempPartyB2.name = str

          this.tempPartyB = this.tempPartyB2
        }
      })
    },

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
      }
    },

    saveFile(res) {
      if (res.id != null) {
        for (let i = 0; i < this.files.length; i++) {
          this.files[i].contractId = res.id
        }
        proSubcontract.bindFile(this.files).then(res => {
          if (res != null) {
            this.files = []
          }
        })
      }
    },

    validateForm() {
      let flag = null
      if (this.$refs['proSubContractForm'].validate()) {
        flag = true
      } else {
        flag = false
      }
      return flag
    },

    submitContract() {
      this.loadDialog = true
      window.localStorage.setItem("subcontractPartyA", JSON.stringify(this.subcontract.partyA))
      this.subcontract.type = this.type
      return proSubcontract.insertSubcontract(this.subcontract).then(res => {
        if (res != null) {
          this.saveFile(res)
          this.reset()

          this.$refs['subcontractFlow'].startFlow({
            title: "关于对《" + res.project.name + "》的合同登记",
            content: res.remark == null ? "" : res.remark,
            frameId: res.id,
            frameCoding: 1320282,
            frameColumn: 'id'
          }).then()

        }
        this.loadDialog = false
        return res
      }).catch(e => {
        console.log(e)
      })

    },

    resetFormRules() {
      this.clear = true
      this.$refs['proSubContractForm'].resetValidation()
    },

    reset() {
      this.clear = false

      this.tempPartyB = null
      this.tempPartyB2 = {
        id: null,
        name: null
      }

      this.tempPartyA = null
      this.tempPartyA2 = {
        id: null,
        name: null
      }

      this.subcontract = {
        name: null,
        money: null,
        project: {
          name: null,
          id: null
        },
        partyA: {
          name: null,
          id: null,
        },
        partyB: {
          name: null,
          id: null,
        },
        signDate: null,
        remark: null,
        startDate:null,
        endDate:null,
      }

      this.partyAItems = []
      if (window.localStorage.getItem("subcontractPartyA") != null) {
        this.partyAItems.push(JSON.parse(window.localStorage.getItem("subcontractPartyA")))
        if (this.partyAItems.length == 1) {
          this.tempPartyA = this.partyAItems[0]
        }
      }

      this.setDefaultProject()
    },
    setDefaultProject(){
      this.projectItems.forEach(item=>{
        if(item.name === this.project){
          this.subcontract.project= item
          return;
        }
      })
    }
  }
}
</script>
