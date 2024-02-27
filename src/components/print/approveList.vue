<template>
  <v-row justify="center">
    <template v-for="(fa,i) in approveList">
      <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="2" :key="fa.id"
             class="border-rb text-center pa-5"><span class="vertical-center">{{ fa.courseName }}</span>
      </v-col>
      <v-col v-if="fa.approveState == 5 || fa.approveState == 6" cols="10" :key="fa.id+i"
             class="border-b">
        <v-container class="full-height">
          <v-row class="full-height" style="margin-top: -20px;">
            <v-col cols="12" class="border-b text-center" style="min-height:32px;">
              <span class="vertical-center">{{ fa.content }}</span>

            </v-col>
            <v-col cols="2" class="border-r pl-5 full-height">知会人</v-col>
            <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">{{ fa.acceptUser.name }}
            </v-col>
            <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
            <v-col cols="2" class="border-r pl-5 full-height">知会时间</v-col>
            <v-col cols="2" class="border-r pl-5 full-height"
                   v-html="formatterApproveDate(fa)"></v-col>
            <v-col cols="2" class="border-r pl-5 full-height">知会结果</v-col>
            <v-col cols="2" class="pl-5 full-height">{{ formatApproveState(fa) }}</v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="2" :key="fa.id"
             class="border-rb text-center pa-5"><span class="vertical-center">{{ fa.courseName }}</span>
      </v-col>
      <v-col v-if="fa.approveState != 5 && fa.approveState != 6" cols="10" :key="fa.id+i"
             class="border-b">
        <v-container class="full-height">
          <v-row class="full-height" style="margin-top: -20px;">
            <v-col cols="12" class="border-b text-center" style="min-height:32px;">
              <span class="vertical-center">{{ fa.content }}</span>

            </v-col>
            <v-col cols="2" class="border-r pl-5 full-height">审批人</v-col>
            <v-col cols="2" class="border-r pl-5 full-height" v-if="fa.acceptUser">{{ fa.acceptUser.name }}
            </v-col>
            <v-col cols="2" class="border-r pl-5 full-height" v-else>-</v-col>
            <v-col cols="2" class="border-r pl-5 full-height">审批时间</v-col>
            <v-col cols="2" class="border-r pl-5 full-height"
                   v-html="formatterApproveDate(fa)"></v-col>
            <v-col cols="2" class="border-r pl-5 full-height">审批结果</v-col>
            <v-col cols="2" class="pl-5 full-height">{{ formatApproveState(fa) }}</v-col>
          </v-row>
        </v-container>

      </v-col>
    </template>
  </v-row>
</template>

<script>
export default {
  name: "print-approveList",
  props:{
    approveList:Array
  }
}
</script>

<style scoped>
</style>
