<template>
<div>
  <v-row>
    <v-col lg="6">
      <p>将科目设置为非项目成本，则不会统计该项到项目成本中</p>
    </v-col>
    <v-spacer></v-spacer>
    <v-col lg="2">
      <v-text-field label="搜索" v-model="searchText"></v-text-field>
    </v-col>
    <v-col cols="12">
      <v-data-table :items="items" :headers="headers" :search="searchText">
        <template v-slot:item.isProject="{item}">
          {{ item.isProject == 0 ? '否' : '是'}}
        </template>
        <template v-slot:item.action="{item}">
          <v-btn x-small class="mr-1" @click="expenseHandler(item)">报销统计</v-btn>
          <v-btn x-small @click="updateHandler(item)">修改</v-btn>
        </template>
      </v-data-table>
    </v-col>

    <v-dialog width="30%" :fullscreen="$vuetify.breakpoint.xs" v-model="updateDialog">
      <v-card class="pa-2">
        <v-form ref="form">
          <v-text-field label="科目名称" v-model="item.name" :rules="[v => !!v || '请输入科目名称',v => v.length < 20 || '名称过长']"></v-text-field>
          <v-radio-group v-model="item.isProject" label="是否项目成本">
            <v-radio :value="0" label="否"></v-radio>
            <v-radio :value="1" label="是"></v-radio>
          </v-radio-group>
        </v-form>
        <v-btn @click="updateDialog = false" block>关闭</v-btn>
        <v-btn color="primary" block class="mt-1" @click="savehandler" :loading="loading">提交</v-btn>
      </v-card>
    </v-dialog>
  </v-row>
</div>
</template>

<script>
import {queryAll,updateCourse} from '@/api/expense'
export default {
  name: "course",
  data:()=>({
    searchText:null,
    items:[],
    headers:[
      {text:'科目名称',value:'name'},
      {text:'项目成本',value:'isProject'},
      {text:'操作',value:'action'},
    ],
    loading:false,
    item:{
      name:null,
      isProject:1
    },
    updateDialog:false,
  }),
  created() {
    this.list()
  },
  methods:{
    savehandler(){
      if(this.$refs.form.validate()){
        this.loading = true
        updateCourse(this.item).then(()=>{
          this.updateDialog= false
        }).finally(()=>this.loading = false)
      }
    },
    expenseHandler(item){
      this.item = item
      let r = this.$router.resolve({
        path:'/expense/totalExpense',
        query:item
      })
      window.open(r.href)
    },
    updateHandler(item)
    {
      this.item = item
      this.updateDialog = true
    },
    list()
    {
      this.loading = true
      queryAll().then(result=>this.items = result).finally(()=>this.loading = false)
    }
  }
}
</script>

<style scoped>

</style>