<template>
  <div>
    <v-row class="pa-2">
      <v-col cols="12" class="text-center">
        <p>
          仓库管理员：{{ outMater.staff.name }}，发送时间：{{ data.putDate.substring(5) }}，共{{ items.length }}种材料</p>
        <p>项目：{{ outMater.project.name }}</p>
        <v-btn :loading="loading"
               :disabled="disable"
               @click="signDialog = true"
               :block="$vuetify.breakpoint.xs"
               color="primary"
               :disable="disable">
          签字确认出库
        </v-btn>
      </v-col>
      <v-col cols="12">
        <v-data-table :items="items"
                      hide-default-footer
                      :items-per-page="-1"
                      :headers="headers"></v-data-table>
      </v-col>
      <v-col cols="12" class="text-center">
        <v-btn :loading="loading"
               :disabled="disable"
               @click="signDialog = true"
               :block="$vuetify.breakpoint.xs"
               color="primary"
               :disable="disable">
          签字确认出库
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog width="70%" :fullscreen="$vuetify.breakpoint.xs" v-model="signDialog">
      <v-card>
        <div style="width: 100%" class="pa-3">
          <vue-signature-pad width="97%"
                             height="450px"
                             id="signature"
                             ref="signaturePad"
                             :options="signOptions"></vue-signature-pad>
        </div>
        <div class="pa-2">
          <v-btn color="primary" block :disabled="disable" @click="save" :loading="loading">确认签字</v-btn>
          <v-btn class="mt-2" @click="signDialog = false" block :loading="loading">取消</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {queryOutById, outSign} from '@/api/proSign'

export default {
  name: "signPut",
  data: () => ({
    items: [],
    headers: [
      {text: '材料名称', value: 'material.name'},
      {text: '型号', value: 'material.model'},
      {text: '品牌', value: 'material.brand'},
      {text: '出库数量', value: 'sum'},
      {text: '单位', value: 'material.unit.name'},
    ],
    signDialog: false,
    signOptions: {
      penColor: "#000",
    },
    data: {
      putDate: '',
    },
    outMater: {
      project: {name: null},
      staff: {name: null},
    },
    disable: false,
    loading: false,
  }),
  watch: {
    signDialog: {
      handler() {
        this.$nextTick(() => {
          console.log("resizeCanvas")
          window.setTimeout(() => {
            this.$refs.signaturePad.resizeCanvas()
          }, 500)
        })
      }
    }
  },
  created() {
    queryOutById(this.$route.params.id).then(result => {
      if (result && result.id) {
        if (result.type == 1) {
          this.disable = true
          this.message("已签字，请勿重复签字")
        } else if (result.type == 2) {
          this.disable = true
          this.message("单局已经拒签，请勿重复操作")
        }
        this.outMater = JSON.parse(result.putobj)
        this.items = this.outMater.materOuts
        this.data = result

      } else {
        this.message("出库签字单被撤回，请联系仓库")
      }
    })
  },
  methods: {
    save() {
      const {isEmpty, data} = this.$refs.signaturePad.saveSignature();
      if (isEmpty) {
        this.message("签名内容不能为空")
      } else {
        this.loading = true
        this.data.signImg = data
        this.data.type = 1
        outSign({
          signImg: data,
          id: this.data.id,
          type: 1,
          proId: this.data.proId,
          staffId: this.data.staffId
        }).then(() => {
          this.disable = true
          this.message("操作成功")
        }).finally(() => {
          this.loading = false
        })
      }
    }
  }
}
</script>

<style scoped>
#signature {
  border: double 3px transparent;
  border-radius: 5px;
  background-image: linear-gradient(white, white),
  radial-gradient(circle at top left, #000000, #727272);
  background-origin: border-box;
  background-clip: content-box, border-box;
}
</style>