<template>
  <div>
    <v-row dense>
      <v-col lg="2">
        <v-btn color="primary" @click="insertHeader">发布公告</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col lg="2">
        <v-text-field label="搜索" v-model="options.searchText"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :items="infoList"
                  :headers="headers"
                  :options.sync="options"
                  sort-by="sendTime"
                  sort-desc
                  :server-items-length="total"
                  :loading="loading">

      <template v-slot:item.action="{item}">

        <v-btn class="mr-1" x-small color="primary" @click="updateHeader(item)">修改</v-btn>
        <v-btn class="mr-1" x-small @click="open($router.options.base+'infoDetail/'+item.id)">预览</v-btn>
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
                            label="通知标题"></v-text-field>
            </v-col>
            <v-col cols="6">
              <span v-if="info.id">修改通知消息，不会再次通知指定的部门人员</span>
              <v-select v-else label="通知部门"
                        v-model="info.sectionList"
                        multiple
                        :items="sectionList"
                        single-line
                        return-object
                        item-value="id"
                        item-text="name">

                <template v-slot:prepend-item>
                  <v-list-item
                      ripple
                      @mousedown.prevent
                      @click="toggle"
                  >
                    <v-list-item-action>
                      <v-icon :color="sectionList.length > 0 ? 'indigo darken-4' : ''">
                        {{ icon }}
                      </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        所有部门
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>

              </v-select>
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
          <v-file-input @change="uploadPdfHandler" v-model="pdfFile" label="上传解析pdf"></v-file-input>
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
import {deleteInfo, insertInfo, list, updateInfo, getById} from '@/api/info'
import VueUeditorWrap from "vue-ueditor-wrap"
import {list as sectionList} from '@/api/section'
import {uploadPdf} from "@/api/files";
import {getConfig} from "@/api/systemConfig";

export default {
  name: "index",
  components: {
    VueUeditorWrap
  },
  computed: {
    likesAllFruit() {
      return this.info.sectionList.length === this.sectionList.length
    },
    likesSomeFruit() {
      return this.info.sectionList.length > 0 && !this.likesAllFruit
    },
    icon() {
      if (this.likesAllFruit) return 'mdi-close-box'
      if (this.likesSomeFruit) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
  },
  data: () => ({
    sectionList: [],
    infoList: [],
    headers: [
      {text: '标题', value: 'title'},
      {text: '发布人', value: 'staff.name'},
      {text: '发布日期', value: 'sendDate'},
      {text: '阅读量', value: 'count'},
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
  }),

  watch: {
    options: {
      handler() {
        this.list()
      }
    }
  },
  created() {
    sectionList().then(result => this.sectionList = result)
    getConfig("FTP_SERVER_PATH").then(result => {
      if (result.id != null) {
        this.serverHost = result.value
      } else {
        this.error = '服务器未配置文件上传路径'
        this.disabled = true
      }
    })
    this.reset()
  },
  methods: {
    uploadPdfHandler() {
      if (this.pdfFile) {
        let form = new FormData();
        form.append("file", this.pdfFile);
        uploadPdf(form).then(result => {
          result.forEach(path => {
            let img = '<img src="/api/files/printPdf?filePath=' + encodeURIComponent(path) + '" style="width:100%;max-width:100%;"/>'
            this.editor.execCommand('inserthtml', img);
          })
          // let f = result.files[0]
          // dispose(f.id).then(file => {
          //   f = file
          //   let name = f.showPath;
          //   let suffix = '';
          //   let index = name.lastIndexOf(".");
          //   index = index == -1 ? f.length : index + 1;
          //   suffix = f.showPath.substring(index, f.length);
          //   f.suffix = suffix.toLowerCase();
          //   f.downloadPath = decodeURIComponent(f.showPath);
          //   f.showPath = this.serverHost + f.downloadPath
          //   let iframe = '<iframe src="' + f.showPath + '" style="width:100%;max-width:100%;min-height: 1000px;overflow: scroll;"/>'
          //   this.editor.execCommand('inserthtml', iframe);
          // })

        })
      }
    },
    toggle() {
      this.$nextTick(() => {
        if (this.likesAllFruit) {
          this.info.sectionList = []
        } else {
          this.info.sectionList = this.sectionList.slice()
        }
      })
    },
    open(url) {
      window.open(url)
    },
    readyEdit(editInstance) {
      this.editor = editInstance
      let than = this
      editInstance.document.onpaste = function (e) {
        let items;
        if (e.originalEvent) {
          items = e.originalEvent.clipboardData.items
        } else {
          items = e.clipboardData.items;
        }

        for (let i = 0; i < items.length; ++i) {
          let item = items[i];
          if (items.length < 2 && item.kind == 'file' &&
              (item.type == 'image/png' || item.type == 'image/jpeg' || item.type == 'image/jpg')) {
            let imgFile = item.getAsFile();
            if (!imgFile) {
              return true;
            }
            // 大小不能超过1m
            if (imgFile.size > 1 * 1024 * 1024) {
              console.log("图片大小超过1M，压缩")
              return false;
            }
            let reader = new FileReader();
            reader.onload = function () {
              // 显示文件
              let img = '<img src="' + this.result + '" alt="" style="max-width:100%"/>'
              console.log(img)
              than.editor.execCommand('inserthtml', img);
            }
            reader.readAsDataURL(imgFile);
            return false;
          }
        }
      }
    },
    deleteInfo() {
      deleteInfo(this.deleteItem.id).then(() => {
        this.list()
      }).finally(() => this.deleteHeaderDialog = false)
    },
    deleteHeader(item) {
      this.deleteItem = item
      this.deleteHeaderDialog = true
    },
    submitInfo() {
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
        content: null,
        count: 0,
        sectionList: []
      }
      this.toggle()
    },
    updateHeader(item) {
      item.sectionList = item.sectionList || []
      getById(item.id).then(result => {
        this.info = result
        this.updateHeaderDialog = true
      })
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
  }
}
</script>

<style scoped>

</style>