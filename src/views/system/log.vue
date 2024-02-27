<template>
  <div>
    <v-data-table :items.sync="logList"
                  :loading="loading"
                  :options.sync="options"
                  sort-desc
                  sort-by="datetime"
                  :server-items-length="total"
                  :headers="headers">
      <template v-slot:top>
        <v-row dense>
          <v-col sm="2">
            <v-select label="请求类型" :items="types" v-model="options.method"></v-select>
          </v-col>
          <v-col sm="3">
            <v-radio-group v-model="options.type" row>
              <v-radio label="操作日志" value="info" key="info"></v-radio>
              <v-radio label="异常日志" value="error" key="error"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col sm="1">
            <v-menu v-model="menu" offset-y>
              <template v-slot:activator="{on,attrs}">
                <v-text-field label="指定日期"
                              v-on="on"
                              v-bind="attrs"
                              v-model="options.datetime"></v-text-field>
              </template>
              <v-date-picker v-model="options.datetime" @change="menu = false">

              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col sm="1">
            <v-text-field @keyup.enter="list" label="指定操作用户" v-model="userName"></v-text-field>
          </v-col>
          <v-col sm="1">
            <v-text-field @keyup.enter="list" label="指定url" v-model="url"></v-text-field>
          </v-col>
          <v-col sm="1">
            <v-text-field @keyup.enter="list" label="api标题" v-model="title"></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col sm="2">
            <v-text-field @keyup.enter="list" label="搜索" v-model="searchText"></v-text-field>
          </v-col>
        </v-row>
      </template>

      <template v-slot:item.action="{item}">
        <v-btn x-small @click="detailHandler(item)">详细</v-btn>
      </template>

    </v-data-table>

    <v-dialog width="70%" v-model="detailDialog">
      <v-card class="pa-2">
        <div>
          <p>请求参数</p>
          <v-textarea v-model="logItem.params"></v-textarea>
          <p>返回结果</p>
          <v-textarea v-model="logItem.result"></v-textarea>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {logList} from '@/api/systemLog'

export default {
  name: "index",
  components: {

  },
  data: () => ({
    logList: [],
    loading: false,
    options: {searchText: null, type: 'info', method: null, userName: null},
    total: 0,
    headers: [
      {text: '日志时间', value: 'datetime'},
      {text: '客户端ip', value: 'ip'},
      {text: '用户', value: 'userName'},
      {text: '接口名称', value: 'title'},
      {text: '地址', value: 'url'},
      {text: '类型', value: 'method'},
      {text: '详细', value: 'action'},
    ],
    types: ["GET", "POST", "DELETE", "PUT"],
    menu: false,
    listDef: null,
    searchText: null,
    userName: null,
    url: null,
    title: null,
    logItem: {
      params:null,
      result:null,
    },
    detailDialog: false,
  }),
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep: true
    }
  },
  methods: {
    detailHandler(item) {
      this.logItem = item
      this.detailDialog = true
    },
    list() {
      this.loading = true
      let query = Object.assign({}, this.options)
      try {
        query.sortBy = query.sortBy.join(",")
        query.sortDesc = query.sortDesc.join(",")
        query.searchText = this.searchText
        query.userName = this.userName
        query.url = this.url
        query.title = this.title
      } catch (e) {
        // ignore this e
      }
      if (this.listDef) {
        console.log(this.listDef)
      }
      this.listDef = logList(query).then(result => {
        this.logList = result.rows
        this.total = result.total
      }).finally(() => this.loading = false)
    }
  }
}
</script>

<style scoped>

</style>