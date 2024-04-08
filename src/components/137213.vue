<template>
  <div>
    <!--    <h2>{{ per.staff.name }}-{{ per.month }}月-考核审批</h2>-->
    <v-data-table :items="per.workLogs"
                  :headers="headers"
                  dense
                  hide-default-footer
                  :items-per-page="-1">
      <template v-slot:top>
        <table style="width: 100%" class="text-center">
          <thead>
          <tr>
            <td>姓名</td>
            <td class="font-weight-black">{{per.staff.name}}</td>
            <td>部门</td>
            <td class="font-weight-black">{{per.section.name}}</td>
            <td>职务</td>
            <td v-if="per.staff.duty && per.staff.duty.length > 0" class="font-weight-black">{{per.staff.duty[0].name}}</td>
            <td>考核月份</td>
            <td class="font-weight-black">{{per.month}}</td>
          </tr>
          </thead>
        </table>
      </template>
      <template v-slot:item.workDate="{item}">
        {{ formatDateStr(item.workDate, 0, 10) }}
      </template>
      <template v-slot:item.weight="{item}">
        <v-text-field dense v-model="item.weight" :disabled="off" @change="weightHandler(item)" type="number"></v-text-field>
      </template>
      <template v-slot:item.note="{item}">
        <div v-if="item.edit || item.staff.id != $store.state.user.id">
          {{item.note}}
        </div>
        <v-text-field v-else
                      dense
                      @change="changeNoteHandler(item)"
                      v-model="item.note"
                      :disabled="item.edit || item.staff.id != $store.state.user.id"></v-text-field>
      </template>
      <template v-slot:item.score="{item}">
        <v-text-field dense v-model="item.score" :disabled="off" @change="scoreHandler(item)" type="number"></v-text-field>
      </template>
      <template v-slot:item.state="{item}">
        <v-checkbox v-model="item.stateFlag" :disabled="item.edit || item.staff.id != $store.state.user.id" dense @change="changeStateHandler(item)"></v-checkbox>
      </template>
      <template v-slot:body.append>
        <tr>
          <td colspan="4" class="text-right font-weight-black">合计</td>
          <td>{{weightSum}}</td>
          <td>{{ per.logScore }}</td>
          <td colspan="2" style="width: 100px;"></td>
        </tr>
        <tr v-if="false">
          <td colspan="8">月度综合表现</td>
        </tr>
        <tr v-if="false">
          <td>96及以上</td>
          <td colspan="4">月度工作优秀，工作态度端正，责任感、协作性、纪律性、执行力非常强</td>
          <td rowspan="4">
            <v-text-field type="number"
                          v-model="per.score"
                          :disabled="off"
                          @change="scoreChange('1',per.score)"></v-text-field>
          </td>
          <td rowspan="4" colspan="2">
            <v-text-field label="备注"  :disabled="off" @change="updatePer" v-model="per.remark"></v-text-field>
          </td>
        </tr>
        <tr v-if="false">
          <td>80-95</td>
          <td colspan="4">月度工作良好，未出现工作拖沓、敷衔、协作不力及违纪事件</td>
        </tr>
        <tr v-if="false">
          <td>60-79</td>
          <td colspan="4">月度工作合格，基本未出现工作拖沓、敷衍、协作不力及违纪事件，但偶有不足</td>
        </tr>
        <tr v-if="false">
          <td>60以下</td>
          <td colspan="4">月度工作较差，工作拖沓、敷衔、协作不力，产生一定的不良影响</td>
        </tr>
        <tr v-if="false">
          <td colspan="5" class="text-right">月度综合表现合计</td>
          <td>{{ per.score }}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="4" class="text-center font-weight-black">月度周工作完成情况</td>
          <td class="font-weight-black">10%</td>
          <td colspan="3"></td>
        </tr>
        <v-row>
          <v-col cols="12">
            <v-data-table :items="per.workLogs"
                          :headers="headers"
                          dense
                          hide-default-footer
                          :items-per-page="-1">
              <template v-slot:top>
                <table style="width: 100%" class="text-center">
                  <thead>
                  <tr>
                    <td>姓名</td>
                    <td class="font-weight-black">{{per.staff.name}}</td>
                    <td>部门</td>
                    <td class="font-weight-black">{{per.section.name}}</td>
                    <td>职务</td>
                    <td v-if="per.staff.duty && per.staff.duty.length > 0" class="font-weight-black">{{per.staff.duty[0].name}}</td>
                    <td>考核月份</td>
                    <td class="font-weight-black">{{per.month}}</td>
                  </tr>
                  </thead>
                </table>
              </template>
              <template v-slot:item.workDate="{item}">
                {{ formatDateStr(item.workDate, 0, 10) }}
              </template>
              <template v-slot:item.weight="{item}">
                <v-text-field dense v-model="item.weight" :disabled="off" @change="weightHandler(item)" type="number"></v-text-field>
              </template>
              <template v-slot:item.note="{item}">
                <div v-if="item.edit || item.staff.id != $store.state.user.id">
                  {{item.note}}
                </div>
                <v-text-field v-else
                              dense
                              @change="changeNoteHandler(item)"
                              v-model="item.note"
                              :disabled="item.edit || item.staff.id != $store.state.user.id"></v-text-field>
              </template>
              <template v-slot:item.score="{item}">
                <v-text-field dense v-model="item.score" :disabled="off" @change="scoreHandler(item)" type="number"></v-text-field>
              </template>
              <template v-slot:item.state="{item}">
                <v-checkbox v-model="item.stateFlag" :disabled="item.edit || item.staff.id != $store.state.user.id" dense @change="changeStateHandler(item)"></v-checkbox>
              </template>
              <template v-slot:body.append>
                <tr>
                  <td colspan="4" class="text-right font-weight-black">合计</td>
                  <td>{{weightSum}}</td>
                  <td>{{ per.logScore }}</td>
                  <td colspan="2" style="width: 100px;"></td>
                </tr>
                <tr v-if="false">
                  <td colspan="8">月度综合表现</td>
                </tr>
                <tr v-if="false">
                  <td>96及以上</td>
                  <td colspan="4">月度工作优秀，工作态度端正，责任感、协作性、纪律性、执行力非常强</td>
                  <td rowspan="4">
                    <v-text-field type="number"
                                  v-model="per.score"
                                  :disabled="off"
                                  @change="scoreChange('1',per.score)"></v-text-field>
                  </td>
                  <td rowspan="4" colspan="2">
                    <v-text-field label="备注"  :disabled="off" @change="updatePer" v-model="per.remark"></v-text-field>
                  </td>
                </tr>
                <tr v-if="false">
                  <td>80-95</td>
                  <td colspan="4">月度工作良好，未出现工作拖沓、敷衔、协作不力及违纪事件</td>
                </tr>
                <tr v-if="false">
                  <td>60-79</td>
                  <td colspan="4">月度工作合格，基本未出现工作拖沓、敷衍、协作不力及违纪事件，但偶有不足</td>
                </tr>
                <tr v-if="false">
                  <td>60以下</td>
                  <td colspan="4">月度工作较差，工作拖沓、敷衔、协作不力，产生一定的不良影响</td>
                </tr>
                <tr v-if="false">
                  <td colspan="5" class="text-right">月度综合表现合计</td>
                  <td>{{ per.score }}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="4" class="text-center font-weight-black">月度周工作完成情况</td>
                  <td class="font-weight-black">10%</td>
                  <td colspan="3"></td>
                </tr>

                <tr v-for="(item) in weekLogs" :key="item.id">
                  <td colspan="3">
                    {{item.note}}
                  </td>
                  <td>
                    {{item.weight}}
                  </td>
                  <td>
                    <v-text-field dense v-model="item.score" :disabled="off" @change="scoreHandler(item)" type="number"></v-text-field>
                  </td>
                  <td>
                    <v-checkbox v-model="item.stateFlag" :disabled="off" dense @change="changeStateHandler(item)"></v-checkbox>
                  </td>
                  <td>
                    {{item.remark}}
                  </td>
                </tr>
                <tr v-for="(item) in weekLogs" :key="item.id">
                  <td colspan="3">
                    {{item.note}}
                  </td>
                  <td>
                    {{item.weight}}
                  </td>
                  <td>
                    <v-text-field dense v-model="item.score" :disabled="off" @change="scoreHandler(item)" type="number"></v-text-field>
                  </td>
                  <td>
                    <v-checkbox v-model="item.stateFlag" :disabled="off" dense @change="changeStateHandler(item)"></v-checkbox>
                  </td>
                  <td>
                    {{item.remark}}
                  </td>
                </tr>

                <tr>
                  <td colspan="4" class="font-weight-black text-center">临时或特殊事项完成情况</td>
                  <td class="font-weight-black">10%</td>
                  <td colspan="3"></td>
                </tr>
                <tr>
                  <td>情况说明</td>
                  <td colspan="4">
                    <v-text-field  :disabled="off" v-model="per.note" @change="updatePer"></v-text-field>
                  </td>
                  <td>
                    <v-text-field  :disabled="off" type="number" v-model="per.weight" @change="weightChangeHandler"></v-text-field>
                  </td>
                  <td colspan="2"></td>
                </tr>
                <tr class="font-weight-black">
                  <td colspan="3" class="text-right">合计</td>
                  <td>{{per.scoreSum}}</td>
                  <td colspan="2"></td>
                </tr>
              </template>
            </v-data-table>
            <tr>
              <td colspan="4" class="font-weight-black text-center">临时或特殊事项完成情况</td>
              <td class="font-weight-black">10%</td>
              <td colspan="3"></td>
            </tr>
            <tr>
              <td>情况说明</td>
              <td colspan="4">
                <v-text-field  :disabled="off" v-model="per.note" @change="updatePer"></v-text-field>
              </td>
              <td>
                <v-text-field  :disabled="off" type="number" v-model="per.weight" @change="weightChangeHandler"></v-text-field>
              </td>
              <td colspan="2"></td>
            </tr>
            <tr class="font-weight-black">
              <td colspan="3" class="text-right">合计</td>
              <td>{{per.scoreSum}}</td>
              <td colspan="2"></td>
            </tr>
      </template>
    </v-data-table>
    </v-col>
    </v-row>

  </div>
</template>

<script>

import {getPerById, updateState, update, updateScore, updatePer,updateNote} from "@/api/workLog";

export default {
  name: "137213",
  data: () => ({
    weightSum:0,
    off:false,
    per: {
      month: null,
      staff: {
        name:null,
        duty:[]
      },
      workLogs: [],
      score: 0,
      remark: null,
      note: null,
      weight: null,
      scoreSum: null,
      logScore:null,
      section:{
        name:null,
      }
    },
    headers: [
      {text: '工作性质', value: 'tag'},
      {text: '工作内容', value: 'content'},
      {text: '计划完成时间', value: 'workDate'},
      {text: '完成情况说明', value: 'note'},
      {text: '权重', value: 'weight', width: '150px'},
      {text: '综合评分', value: 'score', width: '150px'},
      {text: '是否完成', value: 'state'},
      {text: '备注', value: 'remark'}
    ],

    weekLogs:[]
  }),
  props: {
    frameId: String,
  },
  watch: {
    frameId() {
      this.loadData()
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    getWeekScore(data){
      let weekScore = 0.0
      if (data.size == 0){
        return 0
      }else {
        data.forEach(item => {
          weekScore += parseFloat(item.score)
        })
        return weekScore
      }
    },
    changeNoteHandler(item){
      updateNote(item)
    },
    weightChangeHandler() {
      let scoreSum = parseFloat(this.per.weight) + parseFloat(this.per.score) + this.getWeekScore(this.weekLogs)
      this.per.scoreSum = scoreSum.toFixed(2)
      this.updatePer(this.per)
    },
    scoreChange(type, val) {
      this.per.score = val
      this.updatePer(this.per)
    },
    updatePer(){
      this.per.scoreSum = parseFloat(this.per.weight) + parseFloat(this.per.score) + parseFloat(this.per.logScore) + this.getWeekScore(this.weekLogs)
      this.per.scoreSum = this.per.scoreSum.toFixed(2)
      updatePer(this.per)
    },
    refreshScore() {
      let scoreSum = 0
      this.per.workLogs.forEach(item => {
        scoreSum += parseFloat(item.score);
      })
      scoreSum = scoreSum.toFixed(2)
      this.per.logScore = scoreSum
      this.per.scoreSum = parseFloat(this.per.logScore) + this.getWeekScore(this.weekLogs) + parseFloat(this.per.weight)
    },
    scoreHandler(item) {
      if (item.weight < item.score) {
        this.confirm("评分不能高于权重")
      } else {
        updateScore(item)
        this.refreshScore()
        this.updatePer(this.per)
      }
    },
    weightHandler(item) {
      if (item.weight < item.score) {
        item.score = item.weight
      }
      update(item)
      this.refreshScore()
      this.updatePer(this.per)
    },
    changeStateHandler(item) {
      item.state = item.stateFlag ? 1 : 0
      updateState(item)
    },
    loadData() {
      if (this.frameId) {
        this.weekLogs = []
        getPerById(this.frameId).then(result => {
          if (result.note == null) {
            result.note = ''
          }
          if (result.scoreSum == null) {
            result.scoreSum = 0
          }
          if (result.weight == null) {
            result.weight = 0
          }
          if (result.score == null) {
            result.score = 0
          }
          if (result.logScore == null) {
            result.logScore = 0
          }
          result.workLogs.forEach(item=>{
            item.stateFlag = item.state == 1
          })
          this.off = result.staffId == this.$store.state.user.id
          let logs = []
          this.weightSum = 0
          result.workLogs.forEach((item)=>{
            if(item.content == '月度周计划'){
              this.weekLogs.push(item)
            }else{
              if(item.weight){
                this.weightSum += parseFloat(item.weight)
              }
              logs.push(item)
            }
          })
          if(result.staff.duty == null){
            result.staff.duty = []
          }
          result.workLogs = logs
          this.per = result
          this.refreshScore()
        })
      }
    }
  }
}
</script>

<style scoped>

</style>

