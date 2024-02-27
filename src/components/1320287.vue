<template>
  <v-container>
    <v-form ref="entertainForm">
      <v-row>
        <v-col sm="2">
          <v-text-field dense label="合同编号" v-model="data.series"></v-text-field>
        </v-col>
        <v-col sm="3">
          <v-text-field dense label="租赁方" v-model="data.company"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="品牌" v-model="data.brand"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field type="number" dense label="应收租金"
                        v-model="data.yearRental"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-select dense :items="payTypes" label="付租方式" v-model="data.payType"></v-select>
        </v-col>
        <v-col sm="2">
          <v-menu v-model="menu6" :close-on-content-click="false" transition="scale-transition" offset-y
                  min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="data.startDatetime"
                            label="合同开始日期" dense hide-details
                            readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="data.startDatetime" no-title scrollable></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="2">
          <v-menu v-model="menu4" :close-on-content-click="false" transition="scale-transition" offset-y
                  min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="data.endDatetime" label="截止日期" dense hide-details
                            readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="data.endDatetime" no-title scrollable></v-date-picker>
          </v-menu>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="租赁联系人" v-model="data.zlPerson"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="联系手机号" v-model="data.zlPersonTel"></v-text-field>
        </v-col>
        <v-col sm="4">
          <v-radio-group dense v-model="data.zlType" row>
            <v-radio :value="0" label="固定商铺"></v-radio>
            <v-radio :value="1" label="机动" @click="$refs.acreage.focus()"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col sm="4">
          <v-autocomplete :items="houseList" dense multiple v-model="data.houses"
                          :disabled="data.zlType === 1"
                          return-object
                          item-value="id" item-text="temp" auto-select-first
                          append-icon="mdi-map-marker" label="商铺位置">
          </v-autocomplete>
        </v-col>
        <v-col sm="2">
          <v-select dense label="业态" placeholder="请选择业态" v-model="data.yt"
                    :items="yitaiItems" item-text="name"
                     return-object></v-select>
        </v-col>
        <v-col sm="2">
          <v-text-field type="number" label="租赁面积" dense ref="acreage" v-model="data.acreage"></v-text-field>
        </v-col>

        <v-col sm="2">
          <v-checkbox dense label="有无孰商" v-model="data.sh" style="position:absolute;margin-top: 30px"></v-checkbox>
          <v-checkbox label="有无递增" dense class="mt-0" hide-details
                      v-model="data.dz"></v-checkbox>

        </v-col>
        <v-col sm="2">
          <v-text-field :disabled="!data.dz" label="递增比例" v-model="data.dzNumber" dense append-icon="%"></v-text-field>
        </v-col>
        <v-col sm="2">
          <v-text-field dense label="招商经办人" v-model="data.staffName"></v-text-field>
        </v-col>
        <v-col sm="10">
          <v-textarea dense rows="1" label="备注" v-model="data.remark"></v-textarea>
        </v-col>
      </v-row>
      <v-row>
        <div>
          <h3 v-if="richText != null">合同预览</h3>
          <v-container id="printc" v-html="richText">
          </v-container>
        </div>

      </v-row>
    </v-form>
  </v-container>
</template>
<script>
import {queryById} from "../api/zujin";
import {selectContractWordRecordByContractId} from "../api/contractWordModel";

export default {
  name: '1320286',
  props: {
    frameId: String
  },
  data: () => ({
    menu6:false,
    menu4:false,
    data: {
      id:null,
      series: null,
      company: null,
      brand: null,
      payType: 0,
      acreage: 0,
      zl_person: null,
      zl_person_tel: null,
      yt: {id: null, name: null},
      staffName: null,
      dz: null,
      sh: null,
      remark: null,
      houses: [],
      zlType: 0,
      dzNumber: 0,
      zlPerson: null,
      zlPersonTel: null,
      billOwe: {oweMoney: 0},
      moneyOwe: {oweMoney: 0},
      djYsMoney: 0,
      yearRental: null,
      endDatetime: null,
      kjType: [{money: 0}],
      type: 0
    },
    payTypes: [
      { text: '年付方式', value: 0 },
      { text: '季度方式', value: 1 },
      { text: '月付方式', value: 2 },
      { text: '双月付', value: 3 },
      { text: '其他', value: 4 },
    ],
    typeItems: [
      { name: '租赁合同', id: 0, active: false },
      { name: '物管合同', id: 1, active: false },
    ],
    houseList: [],
    yitaiItems:[],
    richText:''
  }),

  watch: {
    frameId: {
      handler() {
        if (this.frameId != null) {
          this.id = this.frameId
          this.selectById()
        }
      }
    },

  },

  created() {
    this.id = this.frameId
    this.selectById()
  },

  methods: {

    initData(data) {
      data.houses.forEach(item=>{
        item.temp = item.pwNumber+":"+item.acreage
      })
      this.houseList = data.houses
      this.yitaiItems.push(data.yt)
    },

    resetData() {
      this.data = {
        series: null,
        company: null,
        brand: null,
        payType: 0,
        acreage: 0,
        zl_person: null,
        zl_person_tel: null,
        yt: {id: null, name: null},
        staffName: this.$store.state.user.name,
        dz: null,
        sh: null,
        remark: null,
        houses: [],
        zlType: 0,
        dzNumber: 0,
        zlPerson: null,
        zlPersonTel: null,
        billOwe: {oweMoney: 0},
        moneyOwe: {oweMoney: 0},
        djYsMoney: 0,
        yearRental: null,
        endDatetime: null,
        kjType: [{money: 0}],
        type: 0
      }
    },

    selectById() {
      queryById((this.id+"").replaceAll("-zujin","")).then(res => {
        this.initData(res)
        this.data = res
        console.log('data',this.data)
        this.loadHtml(this.data.id)
      })

    },

    loadHtml(contractId){
      selectContractWordRecordByContractId({contractId:contractId}).then(result => {
        if (result != null){
          this.richText = result.richText
        }

      })
    }
  }
}
</script>
