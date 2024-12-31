<template>
  <v-card class="pa-3">
    <v-card-title>
      编辑会员权益
    </v-card-title>
    <v-form>
      <v-row dense>
        <v-col cols="6">
          <v-text-field v-model="info.title"
                        :rules="[v => !!v || '不能为空']"
                        label="会员权益"></v-text-field>
        </v-col>
        <v-col cols="3">
          <file-upload label="banner图片"
                       ref="bannerImg"
                       :dense="false"
                       v-model="file"
                       @change="fileChangeHandler"></file-upload>
        </v-col>
        <v-col cols="3">
          <v-img :src="info.headImg" width="300px" height="100px"></v-img>
        </v-col>
        <v-col cols="12">
          <file-upload ref="insertImg" label="插入图片" @change="insertContentImg"></file-upload>
        </v-col>
        <v-col cols="12">
          <vue-ueditor-wrap forceInit
                            @ready="readyEdit"
                            v-model="info.content"
                            :config="editorOption"></vue-ueditor-wrap>
        </v-col>
      </v-row>
    </v-form>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn :loading="loading" color="primary" @click="submitInfo">提交</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

import VueUeditorWrap from "vue-ueditor-wrap"
import FileUpload from "@/components/fileUpload.vue"
import {getConfig} from "@/api/systemConfig";
import {queryById, updateInfo} from "@/api/notice";

export default {
  name: 'notice-update',
  components: {
    FileUpload,
    VueUeditorWrap
  },
  data: () => ({
    editorOption: {
      UEDITOR_HOME_URL: process.env.BASE_URL + "UEditor/",
      serverUrl: "",
      height: '1200',
      initialFrameHeight: '1200'
    },
    loading: false,
    info: {
      title: null,
      content: '',
      count: 0,
      headImg: null,
      hrefType: 0,
      des: null,
      cardId: null,
    },
    file: null,
    serverHost: null,
    ftpFolder: null,
    editor: null
  }),
  created() {
    getConfig("NOTIFY_IP").then(result => {
      if (result.id != null) {
        this.serverHost = result.value
      } else {
        this.error = '服务器未配置文件上传路径'
        this.disabled = true
      }
    })
    getConfig("FTP_ROOT_FOLDER").then(result => {
      if (result.id != null) {
        this.ftpFolder = result.value
      } else {
        this.error = '服务器未FTP根目录路径'
        this.disabled = true
      }
    })
    queryById("aaff508d-47c8-46de-be86-1fbfac6f35d6").then((res) => {
      this.info = res
    })

  },
  methods: {
    insertContentImg(f) {
      if (f.files[0]) {
        f.files.forEach(val => {
          let img = '<img class="prev-img" src="' + this.serverHost + this.ftpFolder + "/" + this.parseUrl(val.ftpPath) + '" ' +
              'alt="" style="max-width:100%"/>'
          this.editor.execCommand('inserthtml', img);
        })
        this.$refs.insertImg.reset()
      }
    },
    fileChangeHandler() {
      if (this.file.files[0]) {
        this.info.headImg = this.serverHost + this.ftpFolder + "/" + this.parseUrl(this.file.files[0].ftpPath)
      } else {
        this.info.headImg = ""
      }
    },
    parseUrl(url) {
      let t = url
      t = t.replaceAll("\\", "/")
      return t
    },
    readyEdit(editInstance) {
      this.editor = editInstance
    },
    submitInfo() {
      this.loading = true
      let ajax = updateInfo(this.info)
      ajax.then(() => {
        this.message("操作成功")
      }).finally(() => this.loading = false)
    },
  }
}

</script>

<style scoped>

</style>