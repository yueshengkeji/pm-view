<template>
  <div id="upload-file" @dragover="dragoverHandler($event)" @drop="dropHandler($event)">
    <v-file-input :loading="fileLoading"
                  title="提示：文件名称不能有特殊字符：(!@#$%^&*()~/\)等"
                  @change="fileChange"
                  :dense="dense"
                  @click:clear="removeFile"
                  :disabled="disabled"
                  v-model="files"
                  :error-messages="error"
                  chips
                  :multiple="multiple"
                  :label="label"
                  :append-icon="'mdi-file-cloud'"
                  @click:append="showRecentFile"
                  :hide-input="ifHide"
                  :accept="acceptType"
                  show-size>
      <template v-slot:selection="{file}">
        <v-chip @click.stop="reviewFile(file)" :id="file.id">
          {{ file.name }}{{ file.size > 0 ? ((file.size / 1024 / 1024).toFixed(2)) + 'M' : '' }}
          <v-btn icon x-small color="primary" @click.stop="downloadFile(file)" rounded>
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn icon x-small color="error" @click.stop="deleteFile(file)" rounded>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-chip>
      </template>
    </v-file-input>
    <v-dialog v-model="reviewDialog" width="70%">
      <v-card class="overflow-x-hidden">
        <v-card-title>预览文件:{{ thanFile.name }}</v-card-title>
        <v-row class="overflow-y-auto" style="height: 500px">
          <v-col cols="12">
            <iframe style="border: 0px;width:100%;min-height:520px;"
                    v-if="thanFile.suffix == 'pdf'" :src="thanFile.showPath"></iframe>
            <v-card class="pl-5" :ripple="false"
                    v-else-if="thanFile.suffix == 'html'" v-html="thanFile.content"></v-card>
            <v-img v-else-if="isImg(thanFile)" :alt="thanFile.fileName"
                   max-width="1200" max-height="1200" :src="thanFile.showPath"
                   class="grey lighten-2 pointer">
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0"
                       align="center"
                       justify="center">
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <template v-else-if="thanFile.suffix == 'txt'">
              <div>{{ thanFile.content }}</div>
            </template>
            <template v-else>
              <a target="_blank" :key="thanFile.showPath" :href="thanFile.showPath"
                 :download="thanFile.fileName">{{ thanFile.fileName }}</a>
            </template>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteFile(thanFile)" color="error">删除</v-btn>
          <v-btn @click="downloadFile(thanFile)" color="primary">下载</v-btn>
          <v-btn @click="reviewDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--    预览图片压缩，隐藏元素-->
    <img :src="prevImgUrl" ref="prevImg"
         style="width:auto;z-index: -1;position: fixed;opacity: 0">

    <!-- -->
    <v-dialog v-model="showRecentFileDialog" width="60%">
      <v-data-table :headers="headers"
                    v-model="selected"
                    :items="items"
                    :single-select="false"
                    item-key="id"
                    show-select
                    class="elevation-1">
        <template v-slot:item.name="item">
          <span @click="preview(item.item)">{{ item.item.name }}</span>
        </template>
        <template v-slot:item.action="item">
          <div style="width: 200px;height: 120px;overflow:hidden" @click="preview(item.item)">
            <file-preview :files-item="item.item.itemArray"
                          style="transform: scale(0.8);transform-origin: top left"></file-preview>
          </div>
        </template>
      </v-data-table>
    </v-dialog>
    <v-dialog v-model="viewOthersDialog">
      <file-preview :files-item="filesItem"></file-preview>
    </v-dialog>
    <v-dialog v-model="loading"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          正在加载。。。
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
import {deleteFile, dispose, getFiles, list, upload} from '@/api/files'
import {getConfig} from '@/api/systemConfig'
import filePreview from "@/components/filePreview.vue";
// import heic2any from 'heic-convert'

export default {
  name: "fileUpload",
  components: {filePreview},
  data: () => ({
    files: [],
    fileLoading: false,
    id: null,
    uploadFiles: [],
    fileMap: [],
    update: true,

    reviewDialog: false,
    thanFile: {name: null},

    serverHost: '',

    disabled: false,
    error: null,
    prevImgUrl: null,
    ftpRootFolder: null,

    viewOthersDialog: false,
    filesItem: [],
    showRecentFileDialog: false,
    loading: false,
    selected: [],
    items: [],
    headers: [
      {text: '文件名称', value: 'name', width: '300px'},
      // {text: '文件类型', value: 'pk00811',width:'200px'},
      // {text: '上传人', value: 'uploadUser.name',width:'100px'},
      {text: '上传时间', value: 'uploadDate', width: '200px'},
      {text: '操作', value: 'action'},
    ],
    queryParams: {
      startTime: null,
      endTime: null,
      ifMine: true,
      search: null,
      pageNum: 1,
      pageSize: 10,
      order: 'pk00805',
      sort: 'desc'
    }
  }),
  props: {
    mainId: String,
    loadFile: {
      type: Boolean,
      default: false
    },
    mainCoding: String,
    clear: Boolean,
    updateFiles: Array,
    dense: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: '上传文件'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    updateData: Object,
    //是否压缩图片，默认压缩
    zip: {
      type: Boolean,
      default: true
    },
    ifHide: {
      type: Boolean,
      default: false
    },
    acceptType: {
      type: String,
      default: ''
    }
  },
  model: {
    prop: "updateData",
    event: "change"
  },
  created() {

    getConfig("FTP_SERVER_PATH").then(result => {
      if (result.id != null) {
        this.serverHost = result.value
      } else {
        this.error = '服务器未配置文件上传路径'
        this.disabled = true
      }
    })
    getConfig("FTP_ROOT_FOLDER").then(result => {
      if (result.id != null) {
        this.ftpRootFolder = result.value
      } else {
        this.error = '服务器未配置FTP根路径'
        this.disabled = true
      }
    })

    this.id = this.mainId;
    if (this.loadFile && this.mainId != null) {
      this.loadFiles();
      this.resetState();
    }
    if (this.updateFiles != null && this.updateFiles.length > 0) {
      this.files = this.updateFiles
    }
  },
  watch: {
    selected: {
      handler() {
        if (this.selected.length > 0) {
          this.dealSelect(this.selected)
        }
      },
      deep: true
    },
    clear: {
      handler() {
        if (this.clear == true) {
          this.reset();
        }
      },
      deep: true
    },
    mainId: {
      handler() {
        this.id = this.mainId;
      },
      deep: true
    },
    loadFile: {
      handler() {
        if (this.mainId != null) {
          this.loadFiles();
          this.resetState();
        } else {
          this.reset();
        }
      },
      deep: true,
    },
    updateFiles: {
      handler() {
        if (this.updateFiles.length >= 0) {
          this.files = this.updateFiles
        }
      },
      deep: true
    },
  },
  mounted() {
    this.$nextTick().then(() => {
      this.init();
    })
  },
  methods: {
    dropHandler(e) {
      e.preventDefault()
      let files = Array.from(e.dataTransfer.files)
      this.fileUpload(files)
    },
    dragoverHandler(e) {
      e.preventDefault()
    },
    isImg(file) {
      let regular = new RegExp(/(bmp|jpg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|WMF|webp|jpeg)$/)
      let isImg = regular.test(file.suffix);
      return isImg;
    },
    reset() {
      this.id = null
      this.files = []
      this.uploadFiles = []
      this.fileMap = []
      this.update = true
      this.resetState()
      this.selected = []
      this.$emit("change", {files: [], mainId: null, ftpRootFolder: this.ftpRootFolder})
    },
    resetState() {
      window.setTimeout(() => {
        this.$emit('resetFileState');
      }, 500)
    },
    downloadFile(file) {
      let a = document.createElement('a');
      a.download = file.fileName;
      a.target = "_blank"
      a.href = `${this.serverHost}${file.name}${file.id}` + file.fileName.substring(file.fileName.lastIndexOf("."))
      a.click();
    },
    deleteFile(file) {
      this.update = false;
      deleteFile(file.id).then(() => {
        this.files.forEach((f, idx) => {
          if (f.id == file.id) {
            this.files.splice(idx, 1);
            this.$emit("delete", f)
          }
        })
        this.$emit("change", {files: this.files, mainId: this.id, ftpRootFolder: this.ftpRootFolder})
      }).finally(() => {
        this.update = true;
      });
      this.reviewDialog = false;
      return false;
    },
    removeFile() {
      this.uploadFiles.forEach(item => {
        deleteFile(item.id);
      });
      this.uploadFiles = [];
      this.$emit("change", {files: [], mainId: this.id, ftpRootFolder: this.ftpRootFolder})
    },
    fileChange() {
      if (this.update) {
        this.fileUpload(this.files)
      } else {
        this.update = true;
      }
    },
    isImage(file) {
      return /^image\//.test(file.type)
    },
    isHeicImage(file) {
      return file.type.indexOf("heic") !== -1
    },
    async heicToBase64() {
      // const blob = await file.arrayBuffer();
      // const result = await heic2any({buffer: blob, format: 'JPEG'});
      // const base64String = btoa(String.fromCharCode(...new Uint8Array(result)));
      // return `data:image/JPEG;base64,${base64String}`;
      return '';
    },
    startZip(resolve, reject, base64) {
      let img = document.createElement("img")
      if (img == null) {
        reject("img element is null")
      }
      img.src = base64
      let b = 3;
      if (img.width > 700) {
        b = 1
      }
      this.dealImageByTag(img, {width: img.width * b, height: img.height * b}, (dealRes) => {
        img.onload = null
        this.prevImgUrl = dealRes
        resolve(dealRes)
      })
    },
    zipImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        if (this.isHeicImage(file)) {
          this.heicToBase64(file).then((result) => {
            this.startZip(resolve, reject, result)
          })
        } else {
          reader.onload = () => {
            this.prevImgUrl = reader.result
            this.startZip(resolve, reject, reader.result)
          }
          reader.readAsDataURL(file)
        }
      })
    },
    base64ToFile(base64String, fileName) {
      let binaryData = Uint8Array.from(atob(base64String.split(',')[1]), c => c.charCodeAt(0));
      let blob = new Blob([binaryData], {type: 'application/octet-stream'});
      return new File([blob], fileName, {type: blob.type, lastModified: Date.now()});
    },
    async uploadZipImg(f) {
      await this.zipImage(f).then(result => {
        let file = this.base64ToFile(result, f.name)
        this.fileMap[file.name] = file.size
        let imgForm = new FormData()
        imgForm.append("files", file)
        if (this.id != null) {
          imgForm.append("mainCoding", this.id);
        }
        this.upload(imgForm)
      })
    },
    fileUpload(files) {
      this.update = false;
      this.fileLoading = true;
      let form = new FormData();
      let isUpload = false
      files.forEach(f => {
        if (this.isImage(f) && !this.isHeicImage(f) && this.zip) {
          //压缩图片 单独上传
          this.uploadZipImg(f)
        } else {
          isUpload = true
          this.fileMap[f.name] = f.size;
          form.append("files", f);
        }
      })
      if (this.id != null) {
        form.append("mainCoding", this.id);
      }
      if (isUpload) {
        this.upload(form)
      } else {
        this.fileLoading = false
      }
    },
    upload(form) {
      upload(form).then((res) => {
        this.id = res.mainId
        res.files.forEach(uf => {
          let size = this.fileMap[this.getFileName(uf.fileName)];
          if (size != null) {
            uf.size = size;
          }
          uf.ftpPath = uf.name + uf.id + uf.fileName.substring(uf.fileName.lastIndexOf("."))
          this.uploadFiles.push(uf);
        })
        this.$emit("change", {files: this.uploadFiles, mainId: this.id, ftpRootFolder: this.ftpRootFolder})
        this.update = false;
        this.files = this.uploadFiles;
      }).catch(e => {
        console.log("上传失败", e);
      }).finally(() => {
        this.fileLoading = false;
      });
    },
    getFileName(fileName) {
      let idx = fileName.lastIndexOf("/")
      if (idx === -1) {
        idx = fileName.lastIndexOf("\\")
      }
      idx = idx === -1 ? 0 : (idx + 1);
      return fileName.substring(idx)
    },
    loadFiles(id) {
      getFiles(null, id || this.id, this.mainCoding).then(files => {
        this.files = files;
        this.uploadFiles = this.files;
        this.$emit("change", {files: this.files, mainId: id, ftpRootFolder: this.ftpRootFolder})
      });
    },
    init() {
      let fileElement = document.getElementById("upload-file");
      // fileElement.addEventListener("dragenter", function (e) {
      //   e.preventDefault();
      //   e.stopPropagation();
      // }, false);
      //
      // fileElement.addEventListener("dragover", function (e) {
      //   e.preventDefault();
      //   e.stopPropagation();
      // }, false);
      //
      // fileElement.addEventListener("dragleave", function (e) {
      //   e.preventDefault();
      //   e.stopPropagation();
      // }, false);
      //
      // fileElement.addEventListener("drop", (e) => {
      //   console.log("拖拽事件", e.dataTransfer.files, e.dataTransfer.files.length)
      //   e.preventDefault();
      //   e.stopPropagation();
      //   // this.files = e.dataTransfer.files;
      //   this.fileUpload(e.dataTransfer.files);
      // })
      // fileElement.ondrop = (e)=>{
      //
      // }
      return fileElement;
    },
    dropFile(e) {
      console.log("拖拽事件", e)
    },
    reviewFile(f) {
      this.fileLoading = true;
      dispose(f.id).then(result => {
        let index = result.showPath.lastIndexOf(".");
        index = index == -1 ? result.length : index + 1;
        let suffix = result.showPath.substring(index, result.length);
        result.suffix = suffix.toLowerCase();
        result.showPath = `${this.serverHost}` + result.showPath
        this.thanFile = result;
        this.reviewDialog = true;
      }).finally(() => this.fileLoading = false)

    },

    showRecentFile() {
      this.loading = true
      list(this.queryParams).then(res => {
        this.items = res.list
        this.items.forEach(item => {
          item.viewUrl = '/preview' + item.name + item.id + item.pk00811
          item.showPath = item.name + item.id + item.pk00811
        })
        this.fileSuffix(this.items)
        this.items.forEach(item => {
          let itemArray = []
          itemArray.push(item)
          item.itemArray = itemArray
        })
        this.loading = false
        this.showRecentFileDialog = true
      }).catch(e => {
        console.log(e)
      })
    },
    preview(item) {
      this.filesItem = []
      this.filesItem.push(item)
      // this.fileSuffix(this.filesItem)
      this.$nextTick(() => {
        this.viewOthersDialog = true
      })
    },
    fileSuffix(files) {
      files.forEach(f => {
        let name = f.showPath;
        let suffix = '';
        let index = name.lastIndexOf(".");
        index = index == -1 ? f.length : index + 1;
        suffix = f.showPath.substring(index, f.length);
        f.suffix = suffix.toLowerCase();
        f.downloadPath = decodeURIComponent(f.showPath);
        if ((this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm)
            && window.location.protocol == 'https:') {

          if (f.suffix == 'pdf') {
            if (f.pdfImgPath != null && f.pdfImgPath.length > 0) {
              f.pdfImg = true
              let paths = [];
              f.pdfImgPath.forEach(path => {
                paths.push(this.ftpRootFolder + "/" + encodeURIComponent(path))
              })
              f.pdfImgPath = paths
            }
          } else {
            f.showPath = this.ftpRootFolder + "/" + f.downloadPath
          }

        } else {
          //直接从配置的文件服务器预览
          f.showPath = this.serverHost + f.downloadPath
        }
      });
    },
    dealSelect(selected) {
      console.log(selected)
      selected.forEach(item => {
        item.ftpPath = item.name + item.id + item.fileName.substring(item.fileName.lastIndexOf("."))
      })
      this.$emit("change", {files: selected, mainId: null, ftpRootFolder: this.ftpRootFolder})
      this.files = selected
    }
  }
}
</script>

<style scoped>

</style>
