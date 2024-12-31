<template>
  <div>
      <v-data-table :headers="headers"
                    :loading="loading"
                    :items="items"
                    class="elevation-1">
          <template v-slot:item.action="item">
              <v-btn x-small @click="preview(item.item)">预览</v-btn>
              <v-btn x-small @click="deleteFile(item.item)">删除</v-btn>
          </template>
      </v-data-table>

      <v-dialog v-model="viewOthersDialog">
          <file-preview :files-item="filesItem"></file-preview>
      </v-dialog>

      <!--提示框-->
      <v-snackbar v-model="message.show" centered>
          {{ message.content }}
          <template v-slot:action="{attrs}">
              <v-btn
                      color="red"
                      text
                      x-small
                      v-bind="attrs"
                      @click="message.show = false"
              >
                  关闭
              </v-btn>
          </template>
      </v-snackbar>
  </div>
</template>
<script>
  import {getMessageByFrameId} from '@/api/approve'
  import {getFiles} from "@/api/files";
  import {getConfig} from "@/api/systemConfig";
  import {update as placeUseUpdate} from "@/api/placeUseContract";
  import {update as advertPlaceUpdate} from "@/api/advertPlaceContract";
  import {updateZujin} from "@/api/zujin";
  import filePreview from "@/components/filePreview.vue";
  export default {
      name:'contractFile',
      components: {filePreview},
      props:{
          data:{
              type:Object,
              default:null
          },
          type:Number,
      },
      data:() => ({
          instaceMsg:null,
          frameId:null,

          serverHost: '',
          ftpFolder: null,

          items:[],
          loading:false,
          headers:[
              {text: '文件名称', value: 'name',width:'300px'},
              {text: '上传人', value: 'uploadUser.name',width:'100px'},
              {text: '上传时间', value: 'uploadDate',width:'200px'},
              {text: '操作', value: 'action',width: '200px'},
          ],

          viewOthersDialog:false,
          filesItem:[],

          message: {
              show: false,
              content: ""
          },
      }),
      watch:{
        data:{
            handler(){
                if (this.data != null){
                    if (this.type == 1){
                        this.frameId = this.data.id + "-zujin"
                    }else {
                        this.frameId = this.data.id
                    }
                    this.loadStepsByFrameId()
                }
            },
            deep:true
        }
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
                  this.ftpFolder = result.value
              }
          })

          if (this.data != null){
              if (this.type == 1){
                  this.frameId = this.data.id + "-zujin"
              }else {
                  this.frameId = this.data.id
              }
              this.loadStepsByFrameId()
          }
      },
      methods:{
          loadStepsByFrameId() {
              return getMessageByFrameId(this.frameId).then(msg => {
                  if (msg != null) {
                      if (msg.code == 200 && msg.data == null) {
                          this.message.content = "审批消息不存在";
                          this.message.show = true;
                      } else {
                          this.instaceMsg = msg;
                          this.loadFiles();
                      }

                  } else {
                      this.message.content = "审批消息不存在";
                      this.message.show = true;
                  }
                  return msg
              })
          },
          loadFiles(){
              let mobile = (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm)
              getFiles(this.instaceMsg.id, this.instaceMsg.frameId, this.instaceMsg.frameCoding, mobile).then(res => {
                    this.items = res
                  this.items.forEach(item => {
                      item.viewUrl = '/preview' + item.name + item.id + item.pk00811
                      item.showPath = item.name + item.id + item.pk00811
                  })
                  this.fileSuffix(this.items)
              });
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
                                  path = path.replaceAll("\\","/")
                                  path = encodeURIComponent(path)
                                  path = path.replace("%2F","/")
                                  paths.push(this.ftpFolder + "/" + path)
                              })
                              f.pdfImgPath = paths
                          }
                      } else {
                          f.showPath = this.ftpFolder + "/" + f.downloadPath
                      }

                  } else {
                      //直接从配置的文件服务器预览
                      f.showPath = this.serverHost + f.downloadPath
                  }
              });
          },
          preview(item){
              this.filesItem = []
              this.filesItem.push(item)
              this.$nextTick(() => {
                  this.viewOthersDialog = true
              })
          },
          deleteFile(item){
              let deleteFile = item.id + ";"
              this.data.files = this.data.files.replace(deleteFile,'')
              if (this.type == 1){
                  updateZujin(this.data).then(() => {
                      this.loadFiles()
                  })
              }else if (this.type == 2){
                  placeUseUpdate(this.data).then(() => {
                      this.loadFiles()
                  })
              }else if (this.type == 3){
                  advertPlaceUpdate(this.data).then(() => {
                      this.loadFiles()
                  })
              }
          }
      }
  }
</script>