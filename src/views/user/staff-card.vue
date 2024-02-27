<template>
  <v-card class="pa-3">
    <v-row>
      <v-col cols="12">

        <v-img width="100%" :src="card.log"  v-if="card.log != null && card.log != ''"></v-img>

        <template v-if="card.log == null || card.log == ''">
          <img src="/log.png" width="150px" style="position:absolute;"/>
          <div style="position: absolute;right: 50px;top:20px">
            <span class="font-weight-bold">{{ card.name }}</span><br/>
            <span>{{ card.duty }}</span>
          </div>
          <div style="height: 40px;background-color: #013187;margin-top: 100px;line-height: 40px;letter-spacing: 10px"
               class="white--text text-center">
            {{ card.company }}
          </div>
        </template>


      </v-col>
      <v-col cols="8">
        <v-text-field label="展示名称" v-model="card.name"></v-text-field>
      </v-col>
      <v-col cols="4">
        <file-upload label="自定义图片" :dense="false" @change="logChangeHandler"></file-upload>
      </v-col>
      <v-col cols="4">
        <v-text-field label="展示职务" v-model="card.duty"></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field label="手机" v-model="card.phone"></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field label="电话" v-model="card.tel"></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field label="传真" v-model="card.fax"></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field label="E-mail" v-model="card.email"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-textarea rows="3" label="自我介绍" v-model="card.remark"></v-textarea>
      </v-col>
      <v-col cols="12">
        <v-text-field rows="3" label="公司名称" v-model="card.company"></v-text-field>
      </v-col>
      <v-col cols="12">
        <canvas id="code" ref="code" style="display: inline-block;text-align: center"></canvas>
      </v-col>
    </v-row>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="$emit('close')">关闭</v-btn>
      <v-btn color="primary" @click="saveHandler">提交</v-btn>
    </v-card-actions>
  </v-card>

</template>

<script>
import {genStaffCard, updateCard, getStaffCardByStaffId} from "@/api/user";
import FileUpload from "@/components/fileUpload.vue";
import QRCode from "qrcode"
export default {
  name: "staff-card",
  components: {FileUpload},
  data: () => ({
    card: {
      name: null,
      phone: null,
      tel: null,
      fax: null,
      email: null,
      log: null,
      duty: null,
      company: null
    },
  }),
  props: {
    staffId: null
  },
  watch: {
    staffId() {
      if (this.staffId) {
        this.load(this.staffId)
      }
    }
  },
  created() {
    if (this.staffId) {
      this.load(this.staffId)
    }
  },
  methods: {
    genWxCode(id){
      let width = '200',
          height = '200';
      QRCode.toCanvas(
          document.getElementById('code'),
          this.$store.state.api.apiUrl+`/wxapps?id=${id}`,
          {width, height, toSJISFunc: QRCode.toSJIS},
          error => {
            console.log(error)
          }
      );
    },
    logChangeHandler(files) {
      let url = ""
      if (files.files && files.files.length > 0) {
        url = this.$store.state.api.apiUrl + files.ftpRootFolder + "/" + files.files[0].ftpPath
      }
      this.$set(this.card,"log",url)
    },
    load(staffId) {
      getStaffCardByStaffId(staffId).then(result => {
        if (result) {
          if(result.company == null){
            result.company = ''
          }
          if(result.log == null){
            result.log = ''
          }
          if(result.remark == null){
            result.remark = ''
          }
          if(result.duty == null){
            result.duty = ''
          }
          this.card = result
          this.genWxCode(this.card.id)
        } else {
          genStaffCard().then(result =>{
            this.card = result
            this.genWxCode(this.card.id)
          })
        }
      })
    },
    saveHandler() {
      updateCard(this.card).then(() => this.message("操作成功"))
    }
  }
}
</script>

<style scoped>

</style>