<template>
    <v-container class="pa-4 text-center">
        <v-row>
            <v-col md="3">
                <file-upload :clear="clear"></file-upload>
            </v-col>
            <v-col md="1">
                <v-btn small @click="confirmUpload">确认</v-btn>
            </v-col>
            <v-col md="1.5">
                <v-menu ref="menu1" v-model="menu1" :close-on-content-click="false">
                    <template v-slot:activator="{attrs,on}">
                        <v-text-field hide-details
                                      dense
                                      v-bind="attrs"
                                      v-on="on"
                                      v-model="queryParams.startTime"
                                      label="请指定开始日期"></v-text-field>
                    </template>
                    <v-date-picker v-model="queryParams.startTime" @change="$refs.menu1.save()"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col md="1.5">
                <v-menu ref="menu2" v-model="menu2" :close-on-content-click="false">
                    <template v-slot:activator="{attrs,on}">
                        <v-text-field hide-details
                                      dense
                                      v-bind="attrs"
                                      v-on="on"
                                      v-model="queryParams.endTime"
                                      label="请指定截止日期"></v-text-field>
                    </template>
                    <v-date-picker v-model="queryParams.endTime" @change="$refs.menu2.save()"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col md="3">
                <v-text-field dense label="搜索" v-model="queryParams.search" @change="load"></v-text-field>
            </v-col>
            <v-col md="2">
                <v-btn-toggle v-model="model"
                              dense
                              mandatory>
                    <v-btn>
                        <v-icon>mdi-format-list-bulleted-square</v-icon>
                    </v-btn>
                    <v-btn>
                        <v-icon>mdi-view-comfy</v-icon>
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row  v-if="model == 1"
                class="fill-height"
                align="center"
                justify="center"
        >
            <div class="img-box-card">
                <div v-for="(item,i) in items"
                     :key="i" @click="preview(item)">

                    <v-img v-if="item.pk00811 == '.pdf'"
                           src="@/assets/pdf.png"
                           class="imgItem"
                    >
                    </v-img>
                    <v-img v-else-if="item.pk00811 == '.xlsx'"
                           src="@/assets/excel.jpeg"
                           class="imgItem"
                    >
                    </v-img>
                    <v-img v-else-if="item.pk00811 == '.docx'"
                           src="@/assets/word.png"
                           class="imgItem"
                    >
                    </v-img>
                    <v-img v-else-if="item.pk00811 == '.txt'"
                           src="@/assets/txt.jpg"
                           class="imgItem"
                    >
                    </v-img>
                    <v-img v-else
                           src="@/assets/img.jpeg"
                           class="imgItem"
                    >
                    </v-img>
                    <div>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">
                                    {{item.fileName}}
                                </div>
                            </template>
                            <span>{{item.fileName}}</span>
                        </v-tooltip>
                    </div>
                </div>
            </div>
<!--            <template v-for="(item, i) in items">-->
<!--                <v-col-->
<!--                        :key="i"-->
<!--                        cols="12"-->
<!--                        md="2"-->
<!--                >-->
<!--                    <v-hover v-slot="{ hover }">-->
<!--                        <v-card-->
<!--                                :elevation="hover ? 12 : 2"-->
<!--                                :class="{ 'on-hover': hover }"-->
<!--                        >-->
<!--                            <v-img v-if="item.pk00811 == '.pdf'"-->
<!--                                    src="@/assets/pdf.png"-->
<!--                                    height="120px"-->
<!--                            >-->
<!--                            </v-img>-->
<!--                            <v-img v-else-if="item.pk00811 == '.xlsx'"-->
<!--                                   src="@/assets/excel.jpeg"-->
<!--                                   height="120px"-->
<!--                            >-->
<!--                            </v-img>-->
<!--                            <v-img v-else-if="item.pk00811 == '.docx'"-->
<!--                                   src="@/assets/word.png"-->
<!--                                   height="120px"-->
<!--                            >-->
<!--                            </v-img>-->
<!--                            <v-img v-else-if="item.pk00811 == '.txt'"-->
<!--                                   src="@/assets/txt.jpg"-->
<!--                                   height="120px"-->
<!--                            >-->
<!--                            </v-img>-->
<!--                            <v-img v-else-->
<!--                                   src="@/assets/img.jpeg"-->
<!--                                   height="120px"-->
<!--                            >-->
<!--                            </v-img>-->
<!--                            <v-tooltip bottom>-->
<!--                                <template v-slot:activator="{ on, attrs }">-->
<!--                                    <div style="max-width: 100px" class="text-no-wrap text-truncate" v-bind="attrs" v-on="on">-->
<!--                                        {{item.fileName}}-->
<!--                                    </div>-->
<!--                                </template>-->
<!--                                <span>{{item.fileName}}</span>-->
<!--                            </v-tooltip>-->
<!--                        </v-card>-->
<!--                    </v-hover>-->
<!--                </v-col>-->
<!--            </template><br>-->
                <div class="text-center">
                    <v-pagination
                            v-model="value"
                            :length="length"
                            :total-visible="7"
                    ></v-pagination>
                </div>
        </v-row>
        <v-row v-if="model == 0">
            <v-data-table :headers="headers"
                          :loading="loading"
                          :items="items"
                          :options.sync="options"
                          :server-items-length="totalDesserts"
                          class="elevation-1">
                <template v-slot:item.action="item">
                    <v-btn x-small @click="preview(item.item)">预览</v-btn>
                </template>
            </v-data-table>
        </v-row>

        <v-dialog v-model="viewOthersDialog">
            <file-preview :files-item="filesItem"></file-preview>
        </v-dialog>
    </v-container>
</template>
<script>
  import FileUpload from "@/components/fileUpload.vue";
  import {list} from "@/api/files";
  import {getConfig} from '@/api/systemConfig'
  import filePreview from "@/components/filePreview.vue";

  export default {
      name:'personalUploadFile',
      components: {FileUpload,filePreview},
      data:() => ({
          viewOthersDialog:false,
          filesItem:[],

          model:0,
          items:[],
          loading:false,
          clear:false,

          headers:[
              {text: '文件名称', value: 'name',width:'300px'},
              {text: '文件类型', value: 'pk00811',width:'200px'},
              {text: '上传人', value: 'uploadUser.name',width:'100px'},
              {text: '上传时间', value: 'uploadDate',width:'200px'},
              {text: '操作', value: 'action',width: '200px'},
          ],
          totalDesserts:0,
          options:{},

          value:1,
          length:0,
          pageSize:18,

          serverHost: '',
          ftpFolder:null,

          menu1: false,
          menu2: false,
          queryParams:{
              startTime:null,
              endTime:null,
              ifMine:true,
              search:null,
              pageNum:1,
              pageSize:10,
              order:'pk00805',
              sort:'desc'
          }
      }),
      watch:{
          options:{
              handler(){
                  this.load()
              },
              deep:true
          },
          value:{
              handler(){
                  this.load()
              },
              deep:true
          },
          'queryParams.endTime': {
              handler() {
                  this.load()
              },
              deep: true,
          },
      },
      created() {
          getConfig("FTP_SERVER_PATH").then(result=>{
              if(result.id != null){
                  this.serverHost = result.value
              }else{
                  console.log('服务器未配置文件上传路径')
              }
          })
          getConfig("FTP_ROOT_FOLDER").then(result => {
              if (result.id != null) {
                  this.ftpFolder = result.value
              }
          })
          this.load()
      },
      methods:{
          confirmUpload(){
              this.clear = true
              this.load()
          },
          preview(item){
              this.filesItem = []
              this.filesItem.push(item)
              this.$nextTick(() => {
                  this.viewOthersDialog = true
              })
          },
          load(){
              if (this.model == 0){
                  this.queryParams.pageNum = this.options.page
                  this.queryParams.pageSize = this.options.itemsPerPage
              }else if (this.model == 1){
                  this.queryParams.pageNum = this.value
                  this.queryParams.pageSize = this.pageSize
              }
              this.loading = true
              list(this.queryParams).then(res => {
                  this.items = res.list
                  this.items.forEach(item => {
                      item.viewUrl = '/preview' + item.name + item.id + item.pk00811
                      // item.showPath = item.name + item.id + item.pk00811
                  })
                  this.fileSuffix(this.items)
                  this.totalDesserts = res.total
                  this.length = Math.ceil(this.totalDesserts/this.pageSize)
                  this.loading = false
              }).catch(e => {
                  console.log(e)
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
                                  paths.push(this.ftpFolder + "/" + encodeURIComponent(path))
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
      }
  }
</script>
<style>
.item-img-box {
    width: 300px;
    height: 330px;
}

.img-box-card {
    flex-wrap: wrap;
    display: flex;
    /*flex-direction: column;*/
}
 .imgItem{
    width: 90px;
     height: 120px;
     margin: 20px;
 }

</style>
