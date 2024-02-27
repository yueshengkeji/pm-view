<template>
  <v-row class="border" justify="center">
    <v-col cols="2" class="border-rb text-center">主题</v-col>
    <v-col cols="4" class="border-rb text-center">{{ message.title }}</v-col>
    <v-col cols="2" class="border-rb text-center">状态</v-col>
    <v-col cols="4" class="border-b text-center" v-html="formatFlowMsgState(message)"></v-col>

    <v-col cols="2" class="border-rb text-center ">发起人</v-col>
    <v-col cols="4" class="border-rb text-center">{{ message.staff.name }}</v-col>
    <v-col cols="2" class="border-rb text-center">发起时间</v-col>
    <v-col cols="4" class="border-b text-center">{{ message.startDate }}</v-col>
  </v-row>
</template>

<script>
export default {
  name: "print-head",
  props:{
    message:Object
  }
}
</script>

<style scoped>
</style>