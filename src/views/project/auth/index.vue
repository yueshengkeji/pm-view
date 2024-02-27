<template>
  <div>
    <p>{{data.name}}-权限管理</p>
    <select-staff label="输入员工姓名，绑定项目权限" @change="bindHandler" v-model="bindStaff">

    </select-staff>
    <v-data-table :items="items"
                  :headers="headers"
                  :loading="loading"
                  hide-default-footer
                  :items-per-page="-1">
      <template v-slot:item.index="{index}">
        {{index+1}}
      </template>
      <template v-slot:item.action="{item}">
        <v-btn x-small color="error" @click="delHandler(item)">删除</v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import {deleteAuth, getAuth,insertAuth} from '@/api/project'
import SelectStaff from "@/views/user/select.vue";

export default {
  name: "authManager",
  components: {SelectStaff},
  props: {
    project: Object,
  },
  watch: {
    project() {
      this.data = this.project
      this.load()
    }
  },
  data: () => ({
    data: {
      name:null,
      id:null
    },
    bindStaff:null,
    loading: false,
    items:[],
    headers:[
      {text:'序号',value:'index'},
      {text:'姓名',value:'staff.name'},
      {text:'操作',value:'action'},
    ]
  }),

  created() {
    this.data = this.project
    this.load()
  },
  methods: {
    bindHandler(){
      insertAuth({project:{id:this.data.id},staff:{id:this.bindStaff.id}}).then(this.load)
    },
    delHandler(item){
      this.confirm("确定删除？").then(()=>{deleteAuth(item.id).finally(this.load)})
    },
    load() {
      this.loading=true
      getAuth(this.data.id).then(result => {
        this.items = result
      }).finally(()=>this.loading=false)
    }
  }

}
</script>

<style scoped>

</style>