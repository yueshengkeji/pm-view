<template>
  <div>
    <v-row>
      <v-col lg="4">
        <v-btn @click="insertHeader" color="primary">新增流程</v-btn>
        <v-btn class="ml-1" @click="hideSeries = !hideSeries">{{ hideSeries ? '隐藏序号' : '显示序号' }}</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col lg="3">
        <v-text-field v-model="options.name" @change="list" label="搜索"></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col lg="6">
        <v-data-table :items.sync="flowList"
                      :loading="loading"
                      :options.sync="options"
                      @click:row="loadCourse"
                      :server-items-length="flowTotal"
                      :headers="headers">
          <template v-slot:item.type="{item}">
            <div v-if="item.type == 0">关联表单</div>
            <div v-else-if="item.type == 2">关联模板</div>
            <div v-else>未关联</div>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn x-small @click="updateHeader(item)">修改</v-btn>
            <v-btn class="ml-1" x-small @click="deleteHeader(item)" color="error">删除</v-btn>
          </template>
        </v-data-table>
      </v-col>
      <v-col lg="6">
        <course-manager :flow-id="this.flow.id" :hide-series="hideSeries"></course-manager>
      </v-col>
    </v-row>
    <!--流程表单-->
    <v-dialog v-model="dialog" width="50%">
      <v-card class="pa-5">
        <v-form ref="flowForm">
          <v-row>
            <v-col sm="3">
              <v-text-field v-model="flow.name"
                            :rules="rules.name"
                            label="流程名称"></v-text-field>
            </v-col>
            <v-col sm="3">
              <v-autocomplete
                  v-model="flow.folderObj"
                  @change="flow.folder = flow.folderObj.code"
                  :items="folderList"
                  :rules="rules.folderObj"
                  return-object
                  item-text="name"
                  label="流程目录"></v-autocomplete>
            </v-col>
            <v-col sm="3">
              <v-autocomplete
                  clearable
                  v-model="flow.menu"
                  @change="menuChange"
                  :items="menuList"
                  return-object
                  :item-text="getItemName"
                  :search-input.sync="searchMenu"
                  label="指定表单">

              </v-autocomplete>
            </v-col>

            <v-col sm="3">
              <v-autocomplete
                  @change="flow.templement = flow.wordModule.id"
                  v-model="flow.wordModule"
                  :items.sync="wordModuleList"
                  return-object
                  item-text="name"
                  :search-input.sync="searchWord"
                  label="指定办文模板">

              </v-autocomplete>
            </v-col>
            <v-col sm="3">
              <v-radio-group v-model="flow.type" label="流程绑定类型">
                <v-radio key="0" label="关联窗体"></v-radio>
                <v-radio key="2" label="关联模板"></v-radio>
                <v-radio key="3" label="无关联"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col sm="3">
              <v-text-field label="流程说明" v-model="flow.remark"></v-text-field>
            </v-col>
          </v-row>

        </v-form>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog=false">关闭</v-btn>
          <v-btn color="primary" @click="saveFlow">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {deleteFlow, folderList, insertFlow, list, updateFlow} from '@/api/flow'
import {searchMenu} from '@/api/menu'
import {searchModule} from '@/api/article'
import courseManager from './courseManager'


export default {
  name: "index",
  data: () => ({
    hideSeries: false,
    loading: false,
    flowTotal: 0,
    headers: [
      {text: '流程名称', value: 'name'},
      {text: '模板对象', value: 'wordModule.name'},
      {text: '表单对象', value: 'menu.name'},
      {text: '表单编码', value: 'menu.coding'},
      {text: '目录名称', value: 'folderObj.name'},
      {text: '最近使用', value: 'lastUseDate'},
      {text: '操作', value: 'action', width: '150px'},
    ],
    flowList: [],
    options: {name: ''},
    rules: {
      name: [
        v => !!v || '请输入流程名称'
      ],
      folderObj: [
        v => (!!v && v.code != null) || '请选择流程目录'
      ]
    },

    dialog: false,

    flow: null,
    folderList: [],

    menuList: [],
    searchMenu: null,

    wordModuleList: [],
    searchWord: null,
  }),
  watch: {
    options: {
      handler() {
        this.list();
      }
    },
    searchMenu(value) {
      if (value != null) {
        searchMenu(value).then(result => {
          this.menuList = result
        })
      }
    },
    searchWord(value) {
      if (value != null) {
        searchModule(value).then(result => {
          this.wordModuleList = result
        })
      }
    }
  },
  created() {
    this.reset()
    folderList().then(result => {
      this.folderList = result
    });
  },
  components: {
    courseManager,
  },
  methods: {
    getItemName(item) {
      return item.name + '(' + item.coding + ")"
    },
    menuChange() {
      if (this.flow.menu != null) {
        this.flow.frameCoding = this.flow.menu.coding
      } else {
        this.flow.frameCoding = ""
      }
    },
    insertHeader() {
      this.reset()
      this.dialog = true
    },
    loadCourse(row) {
      this.flow = row
    },
    successBack() {
      this.dialog = false
      this.list()
    },
    saveFlow() {
      let valid = this.$refs['flowForm'].validate()
      if (valid) {
        if (this.flow.id == null) {
          insertFlow(this.flow).then(this.successBack);
        } else {
          updateFlow(this.flow).then(this.successBack);
        }
      }

    },
    list() {
      this.loading = false
      list(this.options).then(result => {
        this.flowList = result.rows
        this.flowTotal = result.total
      }).finally(() => this.loading = false);
    },
    updateHeader(item) {
      this.dialog = true
      if (item.wordModule != null) {
        this.wordModuleList.push(item.wordModule)
      }
      if (item.menu != null) {
        this.menuList.push(item.menu)
      }
      this.flow = item
    },
    deleteHeader(item) {
      this.confirm("确定删除流程吗？").then(() => {
        deleteFlow(item.id).then(this.successBack);
      })
    },
    reset() {
      this.flow = {
        folderObj: null,
        name: null,
        id: null,
        menu: null,
        wordModule: null,
        remark: null,
        type: 3,

      }
    }
  }
}
</script>

<style scoped>

</style>