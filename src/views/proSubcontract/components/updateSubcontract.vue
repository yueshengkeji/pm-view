<template>
  <v-container>
    <v-form ref="proSubContractForm">
      <v-row>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="subcontract.name" label="合同名称" :rules="rules.nameRule"
                        :readonly="ifReadonly"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-text-field v-model="subcontract.money" label="合同金额" :rules="rules.moneyRule"
                        :readonly="ifReadonly"></v-text-field>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-combobox
              v-model="subcontract.project"
              label="项目"
              :rules="rules.projectRule"
              :search-input.sync="searchProject"
              :items="projectItems"
              item-text="name"
              return-object
              :readonly="ifReadonly"
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-combobox
              v-model="subcontract.partyA"
              label="甲方"
              :rules="rules.partyARule"
              :search-input.sync="searchPartyA"
              :items="partyAItems"
              item-text="name"
              return-object
              :readonly="ifReadonly"
          ></v-combobox>
        </v-col>
        <v-col cols="12" md="3" sm="2" xs="2">
          <v-combobox
              v-model="subcontract.partyB"
              label="乙方"
              :rules="rules.partyBRule"
              :search-input.sync="searchPartyB"
              :items="partyBItems"
              item-text="name"
              return-object
              :readonly="ifReadonly"
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
                :readonly="ifReadonly"
                @input="$refs.menu.save(subcontract.signDate),menu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="6">
          <easy-flow coding="1320282" ref="subcontractFlow"></easy-flow>
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

        <v-col>
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
        <v-btn x-small @click="downloadFile(item)">下载</v-btn>
        <v-btn x-small color="error" @click="deleteFile(item)">删除</v-btn>
      </template>
    </v-data-table>

  </v-container>
</template>
<script>
import proSubcontract from "../../../api/proSubcontract";
import fileUpload from "../../../components/fileUpload";
import {search} from "../../../api/project";
import {list} from '@/api/company';

export default {
  name: 'updateSubcontract',
  props: {
    frameId: String,
  },
  components: {fileUpload},
  data: () => ({
    loadDialog: false,

    menu2: false,
    menu3: false,
    clear: false,
    menu: false,

    searchProject: null,
    projectItems: [],

    searchPartyA: null,
    partyAItems: [],

    searchPartyB: null,
    partyBItems: [],

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
        v => !!v.id || "请选择甲方"
      ],
      partyBRule: [
        v => !!v.id || "请选择乙方"
      ],
      remarkRule: [
        v => !!v || '必填字段', v => (!!v && v.length < 500) || '不超过500个字符'
      ],
      signDateRule: [
        v => !!v || '必填字段'
      ],
    },

    headers: [
      {text: '文件名称', value: 'name', sortable: false},
      {text: '操作', value: 'actions', sortable: false},
    ],
    desserts: [],

    tempFile: {},
    files: [],

    ifReadonly: false,
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

    frameId: {
      handler() {
        this.reset()
        this.resetFormRules()
        if (this.frameId != null) {
          this.load()
          this.getAttach()
        }
      },
      deep: true
    }
  },

  created() {
    this.reset()
    if (this.frameId != null) {
      this.load()
      this.getAttach()
    }
  },

  methods: {
    load() {
      proSubcontract.getSubcontractById({id: this.frameId}).then(res => {
        if (res.state == 1) {
          this.ifReadonly = true
        }
        this.subcontract = res
      })
    },

    getProjectBySeek(str) {
      search(str).then(res => {
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
        }
      })
    },
    getPartyB(str) {
      list(str).then(res => {
        if (res.length > 0) {
          this.partyBItems = res
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
    getAttach() {
      proSubcontract.getFiles({id: this.frameId}).then(res => {
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
      proSubcontract.delete(item).then(res => {
        if (res == 1) {
          this.getAttach()
        }
      })
    },

    saveFile(res) {
      if (res.id != null) {
        for (let i = 0; i < this.files.length; i++) {
          this.files[i].contractId = res.id
        }
        proSubcontract.bindFile(this.files).then(res => {
          if (res != null) {
            this.files = []
            this.getAttach()
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

    submitUpdate() {
      this.loadDialog = true
      return proSubcontract.updateSubcontract(this.subcontract).then(res => {
        if (res != null) {
          this.saveFile(res)
          this.$refs['subcontractFlow'].startFlow({
            title: "关于对《" + res.project.name + "》的合同登记",
            content: res.remark == null ? "" : res.remark,
            frameId: res.id,
            frameCoding: 1320282,
            frameColumn: 'id'
          }).then()
        }
        this.clear = false
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

    clearInit() {
      this.clear = true
    },

    reset() {
      this.clear = false
      this.ifReadonly = false

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
      }

    }
  }
}

</script>
