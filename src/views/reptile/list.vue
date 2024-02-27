<template>
  <div>
    <v-data-table :items.sync="data.rows"
                  :items-per-page="20"
                  :loading="loading"
                  :options.sync="options"
                  sort-desc
                  sort-by="reptileDatetime"
                  :server-items-length="data.total"
                  :headers="headers">
      <template v-slot:item.title="{item}">
        <a :href="item.content" target="_blank">{{item.title}}</a>
      </template>
      <template v-slot:item.action="{item}">
        <a :href="item.content" target="_blank">招标详情</a>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import {reptileList} from '@/api/systemLog'

export default {
  name: "reptileList",
  data: () => ({
    data:{
      rows: [],
      total:0
    },
    loading: false,
    options: {searchText: null, type: 'info', method: null, userName: null},
    headers: [
      {text: '标题', value: 'title'},
      {text: '关键词', value: 'key'},
      {text: '来源', value: 'sourceName'},
      {text: '发布时间', value: 'datetime',width:'170px'},
      {text: '同步时间', value: 'reptileDatetime',width:'170px'},
      {text: '详情', value: 'action',width:'90px'},
    ],
    keys: "'智能','立体停车','机械','车库','监控','智能-','立体停车-','机械-','车库-','监控-'",
  }),
  created() {
    if(this.$store.state.user.name.indexOf('宋正根') != -1){
      this.keys = "'软件','平台','系统','软件-','平台-','系统-'"
    }
  },
  watch: {
    options: {
      handler() {
        this.list()
      },
      deep:true
    }
  },
  methods: {
    list() {
      this.loading = true
      let query = Object.assign({}, this.options)
      try {
        query.sortBy = query.sortBy[0]
        query.sortDesc = query.sortDesc[0]
        query.keys = this.keys
      } catch (e) {
        // ignore this e
      }
      reptileList(query).then(result => {
        this.data = result
      }).finally(()=>this.loading = false)
    }
  }
}
</script>

<style scoped>

</style>