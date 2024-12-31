<template>
  <div>
    <v-row dense>
      <v-col lg="2">
        <v-btn color="primary" @click="insertHeader">添加通知</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col lg="2">
        <v-text-field label="搜索" v-model="options.searchText"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :items="infoList"
                  :headers="headers"
                  :options.sync="options"
                  sort-by="datetime"
                  sort-desc
                  :server-items-length="total"
                  :loading="loading">
      <template v-slot:item.headImg="{item}">
        <v-img :src="item.headImg" style="width:150px"></v-img>
      </template>
      <template v-slot:item.action="{item}">
        <v-btn class="mr-1" x-small color="primary" @click="updateHeader(item)">修改</v-btn>
        <v-btn x-small color="error" @click="deleteHeader(item)">删除</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="updateHeaderDialog" width="80%">
      <v-card class="pa-3">
        <v-card-title>
          编辑通知消息
        </v-card-title>
        <v-form>
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="info.title"
                            :rules="rules.title"
                            label="标题"></v-text-field>
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
            <v-col cols="6">
              <v-radio-group label="点击跳转链接" v-model="info.hrefType">
                <v-radio label="跳转到优惠券" :value="0"></v-radio>
                <v-radio label="跳转到通知内容" :value="1"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="6">
              <v-autocomplete v-if="info.hrefType == 0"
                              @focus="loadCardHandler"
                              :items="cardItems"
                              item-text="name"
                              item-value="id"
                              :rules="[v => !!v || '请选择优惠券']"
                              v-model="info.cardId"></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="info.desc" label="描述"></v-text-field>
            </v-col>
            <v-col cols="12">
              <file-upload ref="insertImg" label="插入详情图片" @change="insertContentImg"></file-upload>
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
          <v-btn @click="updateHeaderDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteHeaderDialog" width="30%">
      <v-card class="pa-3">
        <v-card-title>{{ '确定删除：' + deleteItem.title + '?' }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteInfo" color="error">确定</v-btn>
          <v-btn @click="deleteHeaderDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VueUeditorWrap from "vue-ueditor-wrap"
import {getConfig} from "@/api/systemConfig"
import {deleteNotice, insertInfo, list, updateInfo} from "@/api/notice"
import FileUpload from "@/components/fileUpload.vue"
import {listExperienceCoupon} from '@/api/jxhExperienceCoupon'

export default {
  name: "index",
  components: {
    FileUpload,
    VueUeditorWrap
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
    loadCardHandler() {
      listExperienceCoupon().then(res => {
        this.cardItems = res.rows
      })
    },
    readyEdit(editInstance) {
      this.editor = editInstance
    },
    deleteInfo() {
      deleteNotice(this.deleteItem.id).then(() => {
        this.list()
      }).finally(() => this.deleteHeaderDialog = false)
    },
    deleteHeader(item) {
      this.deleteItem = item
      this.deleteHeaderDialog = true
    },
    submitInfo() {

      if (this.info.headImg == "" || this.info.headImg == null) {
        this.message("请上传banner图片")
        return
      }

      this.loading = true
      let ajax;
      if (this.info.id != null) {
        ajax = updateInfo(this.info)
      } else {
        ajax = insertInfo(this.info)
      }
      ajax.then(() => {
        this.list()
      }).finally(() => this.loading = false, this.updateHeaderDialog = false)
    },
    insertHeader() {
      this.reset()
      this.updateHeaderDialog = true
    },
    reset() {
      this.info = {
        title: null,
        content: '',
        count: 0,
        headImg: null,
        hrefType: 0,
        des: null,
        cardId: null,
        userId: this.$store.state.user.id
      }
      this.loadCardHandler()
      if (this.$refs.insertImg) {
        this.$refs.insertImg.reset()
      }
      if (this.$refs.bannerImg) {
        this.$refs.bannerImg.reset()
      }
    },
    updateHeader(item) {
      this.updateHeaderDialog = true
      this.loadCardHandler()
      if (this.$refs.insertImg) {
        this.$refs.insertImg.reset()
      }
      if (this.$refs.bannerImg) {
        this.$refs.bannerImg.reset()
      }
      this.info = item
    },
    parseUrl(url) {
      let t = url
      t = t.replaceAll("\\", "/")
      return t
    },
    fileChangeHandler() {
      if (this.file.files[0]) {
        this.info.headImg = this.serverHost + this.ftpFolder + "/" + this.parseUrl(this.file.files[0].ftpPath)
      } else {
        this.info.headImg = ""
      }
    },
    list() {
      let query = {}
      Object.assign(query, this.options)
      query.sortBy = query.sortBy.join(",")
      query.sortDesc = query.sortDesc.join(",")
      this.loading = true
      list(query).then(result => {
        this.infoList = result.rows
        this.total = result.total
      }).finally(() => this.loading = false)
    }
  },
  computed: {
    icon() {
      if (this.likesAllFruit) return 'mdi-close-box'
      if (this.likesSomeFruit) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
  },

  data: () => ({
    cardItems: [],
    file: null,
    infoList: [],
    headers: [
      {text: '标题', value: 'title'},
      {text: 'banner', value: 'headImg'},
      {text: '描述', value: 'des'},
      {text: '发布日期', value: 'datetime'},
      {text: '操作', value: 'action'},
    ],
    options: {searchText: null},
    total: 0,
    loading: true,

    info: null,
    updateHeaderDialog: false,
    rules: {
      title: [
        v => !!v || '请输入标题',
      ]
    },
    editorOption: {
      UEDITOR_HOME_URL: process.env.BASE_URL + "UEditor/",
      serverUrl: "",
      height: '500',
      initialFrameHeight: '500'
    },

    deleteHeaderDialog: false,
    deleteItem: {},
    editor: null,
    pdfFile: [],
    serverHost: null,
    ftpFolder: null
  }),
  watch: {
    options: {
      handler() {
        this.list()
      }
    }
  },
  created() {
    // FTP_ROOT_FOLDER
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
    this.reset()
  }
}
</script>

<style scoped>
</style>