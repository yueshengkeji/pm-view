<template>
  <div>
    <v-row dense class="ma-0 pa-3">
      <v-col :lg="data.id == null ? 6 : 12" :offset-lg="data.id == null ? 3 : 0" cols="12">
        <v-form ref="formWeixiu">
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                  :loading="materialLoading"
                  :disabled="data.id != null"
                  auto-select-first
                  autofocus
                  ref="project"
                  v-model="data.project"
                  :search-input.sync="searchProject"
                  :items="projects"
                  item-text="name"
                  :rules="rules.project"
                  return-object
                  label="项目名称"
                  @input="handleSelect"
                  placeholder="请输入项目名称"></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-text-field ref="content"
                            :disabled="data.id != null"
                            :rules="rules.title"
                            v-model="data.title"
                            :error-messages="errorMsg"
                            placeholder="报修内容"></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field ref="returnContent"
                            v-show="data.id != null"
                            v-model="data.returnContent"
                            placeholder="反馈结果"></v-text-field>
            </v-col>
            <v-btn :loading="loading" color="primary" @click="insert" block>提交</v-btn>
          </v-row>
        </v-form>
        <h3 v-if="tooltip" class="text-center mt-10">
          项目报修登记二维码，将此二维码打印贴在项目地点，客户可快速扫码登记报修
          <v-btn plain v-if="this.data.project.name != null" small @click="downloadCode">下载二维码</v-btn>
        </h3>
        <canvas ref="code"
                id="code"
                :style="'width: '+width+'px;height:'+height+'px;margin-left:'+ml"></canvas>

      </v-col>
    </v-row>
    <v-snackbar v-model="showMsg">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import projectApi from '@/api/project'
import {insertWeixiu, updateWeixiu} from '@/api/weixiu'
import QRCode from "qrcode"

export default {
  name: "insert-weixiu",
  data: () => ({
    tooltip: false,
    loading: false,
    materialLoading: false,
    data: null,
    searchProject: null,
    projects: [],
    rules: {
      project: [
        v => !!v || "请选择项目"
      ],
      title: [
        v => !!v || "请输入报修内容"
      ],
    },
    showMsg: false,
    msg: null,
    errorMsg: null,
    extUrl: '',
    width: 300,
    height: 300,
    ml: '-20px',
    qrcode: null,
  }),
  watch: {
    searchProject(str) {
      projectApi.getProject({str: encodeURIComponent(str)}).then(result => {
        if (result instanceof Array) {
          this.projects = result;
          this.projects.push({id: -1, name: str})
        }
      }).catch((e, s) => {
        console.log(e, s);
      })
    },
    updateData: {
      handler() {
        if (this.updateData != null) {
          let p = {id: this.updateData.projectId, name: this.updateData.projectName}
          this.projects.push(p)
          this.updateData.project = p
          this.data = this.updateData
          console.log(this.projects)
        }
      },
      deep: true
    },
    "data.project": {
      handler() {
        if (this.data.project != null && this.data.project.id != null) {
          this.createCode(this.$store.state.api.apiUrl + this.$router.options.base + `projectAfterExt/${this.data.project.id}/${this.data.project.name}`)
          this.tooltip = true
        }
      }
    }
  },
  props: {
    updateData: null,
  },
  created() {
    if (this.$vuetify.breakpoint.xs) {
      this.ml = '-20px'
    } else {
      this.ml = '0px'
    }
    if (this.updateData != null) {
      let p = {id: this.updateData.projectId, name: this.updateData.projectName}
      this.projects.push(p)
      this.updateData.project = p
      this.data = this.updateData
    } else {
      this.reset();
    }
  },
  methods: {
    downloadCode() {
      let a = document.createElement("a")
      a.href = this.$refs.code.children[0].toDataURL("image/jpg")
      a.download = this.data.project.name + "报修码.jpg"
      a.click()
    },
    createCode(val) {
      let width = this.width,
          height = this.height;
      if (this.qrcode) {
        this.qrCode.clear()
        this.qrCode.makeCode(val)
      } else {
        this.qrcode = QRCode.toCanvas(
            document.getElementById('code'),
            val,
            {width, height, toSJISFunc: QRCode.toSJIS},
            error => {
              console.log(error)
            }
        );
      }

    },
    insert() {
      let valid = this.$refs['formWeixiu'].validate();
      if (valid) {
        this.loading = true
        let ajax;
        if (this.data.id != null) {
          ajax = updateWeixiu(this.data)
        } else {
          ajax = insertWeixiu(this.data)
        }
        ajax.then(res => {
          console.log(res);
          this.msg = "登记成功"
          this.reset();
        }).catch(e => {
          this.msg = "登记失败：" + e;
        }).finally(() => {
          this.errorMsg = null
          this.showMsg = true
          this.loading = false
          this.$emit('success');
        });
      }
    },
    reset() {
      this.data = {
        project: {id: null, name: ''},
        title: '',
        returnContent: '',
        isService: 0,
      }
      if (this.$refs['formWeixiu']) {
        this.$refs['formWeixiu'].reset();
        this.$refs['project'].focus();
      }
    },
    handleSelect() {
      this.$refs['content'].focus();
    },
  }
}
</script>

<style scoped>

</style>