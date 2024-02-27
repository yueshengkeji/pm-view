<template>
  <div>
    <v-row dense>
      <v-col offset-sm="3" sm="6" cols="12">
        <v-row>
          <v-col cols="12">
            <v-text-field readonly label="员工姓名" v-model="workCheck.staffName"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field readonly label="补卡日期" v-model="workCheck.date"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field readonly label="补卡时间" v-model="workCheck.time"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field readonly label="事由" v-model="workCheck.note"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-btn class="mb-1" block color="primary" @click="approve(10)" :disabled="workCheck.type === 10">同意
            </v-btn>
            <v-btn block @click="approve(-1)" :disabled="workCheck.type === 10">驳回</v-btn>
            <p v-if="workCheck.type === 10">操作成功</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import {getById, updateState} from '@/api/workCheck'

export default {
  name: "approveWorkCheck",
  data: () => ({
    workCheck: {
      staffName: null,
      date: null,
      time: null,
      note: null,
    }
  }),
  created() {
    getById(this.$route.params.id).then(result => {
      this.workCheck = result
    })
  },
  methods: {
    approve(type) {
      this.loading = true
      this.workCheck.type = type
      updateState(this.workCheck).finally(() => {
        this.loading = false
        this.workCheck.type = 10
      })
    }
  }
}
</script>

<style scoped>

</style>