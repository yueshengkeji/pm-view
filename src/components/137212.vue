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
            <td class="font-weight-black">{{ per.staff.name }}</td>
            <td>部门</td>
            <td class="font-weight-black">{{ per.section.name }}</td>
            <td>职务</td>
            <td v-if="per.staff.duty && per.staff.duty.length > 0" class="font-weight-black">
              {{ per.staff.duty[0].name }}
            </td>
            <td>考核月份</td>
            <td class="font-weight-black">{{ per.month }}</td>
          </tr>
          </thead>
        </table>
      </template>
      <template v-slot:item.workDate="{item}">
        {{ formatDateStr(item.workDate, 0, 10) }}
      </template>
      <template v-slot:item.weight="{item}">
        <v-text-field dense v-model="item.weight" :disabled="off" @change="weightHandler(item)"
                      type="number"></v-text-field>
      </template>
      <template v-slot:item.note="{item}">
        <div v-if="item.edit || item.staff.id != $store.state.user.id">
          {{ item.note }}
        </div>
        <v-text-field v-else
                      dense
                      @change="changeNoteHandler(item)"
                      v-model="item.note"
                      :disabled="item.edit || item.staff.id != $store.state.user.id"></v-text-field>
      </template>
      <template v-slot:item.score="{item}">
        <v-text-field dense v-model="item.score" :disabled="off" @change="scoreHandler(item)"
                      type="number"></v-text-field>
      </template>
      <template v-slot:item.iScore="{item}">
        {{ item.iScore }}
      </template>
      <template v-slot:item.state="{item}">
        <v-checkbox v-model="item.stateFlag" :disabled="item.edit || item.staff.id != $store.state.user.id" dense
                    @change="changeStateHandler(item)"></v-checkbox>
      </template>
      <template v-slot:body.append>
        <tr>
          <td colspan="4" class="text-right font-weight-black">合计</td>
          <td>{{ weightSum }}</td>
          <td>{{iScoreSum}}</td>
          <td>{{ per.logScore }}</td>
          <td colspan="2" style="width: 100px;"></td>
        </tr>
        <tr>
          <td colspan="4" class="text-center font-weight-black">月度周工作完成情况</td>
          <td class="font-weight-black">10%</td>
          <td colspan="4"></td>
        </tr>

        <tr v-for="(item) in weekLogs" :key="item.id">
          <td colspan="4">
            {{ item.note }}
          </td>
          <td>
            {{ item.weight }}
          </td>
          <td>
            {{ item.iScore }}
          </td>
          <td>
            <v-text-field dense v-model="item.score" :disabled="off" @change="scoreHandler(item)"
                          type="number"></v-text-field>
          </td>
          <td>
            <v-checkbox v-model="item.stateFlag" :disabled="off" dense @change="changeStateHandler(item)"></v-checkbox>
          </td>
          <td>
            {{ item.remark }}
          </td>
        </tr>

        <tr>
          <td colspan="4" class="font-weight-black text-center">临时或特殊事项完成情况</td>
          <td class="font-weight-black">10%</td>
          <td colspan="4"></td>
        </tr>
        <tr>
          <td>情况说明</td>
          <td colspan="4">
            <v-text-field :disabled="off" v-model="per.note" @change="updatePer"></v-text-field>
          </td>
          <td>
            <v-text-field :disabled="off" type="number" v-model="per.weight"
                          @change="weightChangeHandler"></v-text-field>
          </td>
          <td colspan="3"></td>
        </tr>
        <tr class="font-weight-black">
          <td colspan="4" class="text-right">合计</td>
          <td></td>
          <td>{{iScoreSum + weekScoreSum}}</td>
          <td>{{ per.scoreSum }}</td>
          <td colspan="2"></td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>

import {updateState, update, updateScore, updatePer, updateNote, getPerByScoreId} from "@/api/workLog";

export default {
  name: "137212",
  data: () => ({
    weightSum: 0,
    iScoreSum:0,
    weekScoreSum:0,
    off: false,
    per: {
      month: null,
      staff: {
        name: null,
        duty: []
      },
      workLogs: [],
      score: 0,
      remark: null,
      note: null,
      weight: null,
      scoreSum: null,
      logScore: null,
      section: {
        name: null,
      }
    },
    headers: [
      {text: '工作性质', value: 'tag'},
      {text: '工作内容', value: 'content'},
      {text: '计划完成时间', value: 'workDate'},
      {text: '完成情况说明', value: 'note'},
      {text: '权重', value: 'weight', width: '150px'},
      {text: '自评分', value: 'iScore', width: '150px'},
      {text: '综合评分', value: 'score', width: '150px'},
      {text: '是否完成', value: 'state'},
      {text: '备注', value: 'remark'}
    ],

    weekLogs: []
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
    getWeekScore(data) {
      let weekScore = 0.0
      if (data.size == 0) {
        return 0
      } else {
        data.forEach(item => {
          weekScore += parseFloat(item.score)
        })
        return weekScore
      }
    },
    changeNoteHandler(item) {
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
    updatePer() {
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
        getPerByScoreId(this.frameId).then(result => {
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
          result.workLogs.forEach(item => {
            item.stateFlag = item.state == 1
          })
          this.off = result.staffId == this.$store.state.user.id
          let logs = []
          this.weightSum = 0
          this.iScoreSum = 0
          this.weekScoreSum = 0
          result.workLogs.forEach((item) => {
            if (item.content == '月度周计划') {
              this.weekLogs.push(item)
              if(item.iScore){
                this.weekScoreSum += item.iScore
              }
            } else {
              if (item.weight) {
                this.weightSum += parseFloat(item.weight)
              }
              if(item.iScore){
                this.iScoreSum += item.iScore
              }
              logs.push(item)
            }
          })
          if (result.staff.duty == null) {
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
