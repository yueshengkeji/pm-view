<template>
  <div>
    <v-form ref="articleForm">
      <v-container>
        <v-row dense>
          <v-col lg="4" cols="12">
            <v-text-field label="项目" v-model="data.project.name"></v-text-field>
          </v-col>
          <v-col lg="4" cols="12">
            <v-text-field label="文档标题" v-model="data.name"></v-text-field>
          </v-col>
          <v-col lg="4" cols="12">
            <v-text-field label="发起人" v-model="data.staff.name"></v-text-field>
          </v-col>
          <v-col lg="12" cols="12">
            <v-textarea rows="4" label="流程备注" v-model="data.remark"></v-textarea>
          </v-col>
        </v-row>
        <!--                <iframe :src="articleUrl" style="width: 100%;height: 100%;min-height:400px;border: 0px;"></iframe>-->
        <!--                <v-card id="article-content" v-html="content" ref="content"></v-card>-->
        <iframe @load="loadHandler"
                ref="iframe"
                :height="iframeHeight"
                style="width: 100%;border:none">
          <html></html>
        </iframe>
      </v-container>

    </v-form>
  </div>
</template>

<script>
import {getContent, loadById, updateArticle} from '@/api/article'
import {getMessageByFrameId} from '@/api/approve'

export default {
  name: "frame-15203",
  props: {
    frameId: String,
    consentHandler:Boolean
  },
  data: () => ({
    folderName: null,
    data: {
      remark:null,
      name:null,
      project:{name:''}
    },
    iframeHeight: 0,
    articleUrl: null,
    loadSuccess:false,
  }),
  created() {
    this.reset();
    this.loadData();
  },
  watch: {
    frameId: {
      handler() {
        if (this.frameId) {
          this.loadData()
        }
      },
      deep: true
    },
    consentHandler(){
      if(this.consentHandler){
        if(this.data.project.id == null){
          this.data.project = null
        }
        this.data.content = this.$refs.iframe.contentDocument.getElementsByTagName('html')[0].innerHTML
        updateArticle({
          article: this.data,
          attachs: []
        })
      }
    }
  },
  methods: {
    loadHandler(e) {
      let height = e.target.contentWindow.document.body.scrollHeight
      this.iframeHeight = height
    },
    loadData() {
      loadById(this.frameId).then(article => {
        if (article.project == null) {
          article.project = {name: null};
        }
        if(article.remark == null){
          article.remark = ''
          getMessageByFrameId(this.frameId).then(msg => {
            let temp = window.setInterval(()=>{
              if(this.loadSuccess){
                if (msg != null) {
                  this.data.remark = msg.content;
                }
                window.clearInterval(temp)
              }
            },100)
          })
        }
        this.folderName = article.folder.name;
        this.data = article;
      }).finally(()=>this.loadSuccess = true)

      getContent(this.frameId).then((content) => {
        let d = this.$refs.iframe.contentWindow.document
        d.open()
        d.write(content)
        let style = document.createElement('style')
        style.setAttribute("type", "text/css")
        style.innerHTML = "body{margin:0px;}div {width: 100% !important;margin: 0px !important;} table{width: 100% !important;margin:0px;}"
        d.head.appendChild(style)
        if(d.body.scrollHeight <= 0){
          window.setTimeout(()=>{
            this.iframeHeight = d.body.scrollHeight
          },200)
        }else{
          this.iframeHeight = d.body.scrollHeight
        }
      }).catch(e => {
        console.log("获取失败", e);
      })
    },
    reset() {
      this.data = {
        project: {name: null},
        title: null,
        content: null,
        remark: null,
        folder: {name: null},
        staff: {name: null},
      }

    }
  }
}
</script>

<style>

</style>