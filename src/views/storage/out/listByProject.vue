<template>
  <div>
    <v-row>
      <v-col cols="4">
        <v-autocomplete label="项目名称"
                        @change="list"
                        :search-input.sync="searchProject"
                        v-model="searchProjectId"
                        item-value="id"
                        :items="projectArray"
                        item-text="name"></v-autocomplete>
      </v-col>
      <v-col cols="8">
        <v-text-field label="搜索" hint="支持搜索材料信息" v-model="searchText" @keyup.enter="list"></v-text-field>
      </v-col>
      <v-col cols="12">
        <div style="overflow-y: auto;height: 250px" @scroll="scrollHandler($event)">
          <v-data-table :items.sync="projectList"
                        :loading="loading"
                        hide-default-header
                        @click:row="loadOutMater"
                        :headers="headers"
                        hide-default-footer
                        :items-per-page="-1">
            <template v-slot:item.outNumber="{item}">
              <span v-if="item.select" class="blue--text">{{ item.outNumber }}</span>
              <span v-else>{{ item.outNumber }}</span>
            </template>
            <template v-slot:item.outDate="{item}">
              <span v-if="item.select" class="blue--text">{{ item.outDate }}</span>
              <span v-else>{{ item.outDate }}</span>
            </template>
            <template v-slot:item.outPerson.name="{item}">
              <span v-if="item.select" class="blue--text">{{ item.outPerson.name }}</span>
              <span v-else>{{ item.outPerson.name }}</span>
            </template>
            <template v-slot:item.company.name="{item}">
              <span v-if="item.select" class="blue--text">{{ item.company.name }}</span>
              <span v-else>{{ item.company.name }}</span>
            </template>
          </v-data-table>
          <v-progress-circular
              v-if="this.loading"
              indeterminate
              color="primary"
              style="left: 50%"
          ></v-progress-circular>
        </div>

      </v-col>
      <v-col cols="12" style="max-height: 300px">
        <v-data-table :items="materList"

                      @click:row="selectHandler"
                      show-select
                      v-model="selectItems"
                      :headers="materHeaders"
                      :loading="loading2"
                      hide-default-footer
                      :items-per-page="-1">
          <template v-slot:item.index="{index}">{{ index + 1 }}</template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {listByProject, outMaterList} from '@/api/outMater'
import {search} from '@/api/project'

export default {
  name: "listByProject",
  components: {},
  props: {
    projectId: null,
  },
  data: () => ({
    selectItems: [],
    searchText: null,
    projectList: [],
    materList: [],
    materHeaders: [
      {text: '序号', value: 'index'},
      {text: '材料编码', value: 'material.id'},
      {text: '材料名称', value: 'material.name'},
      {text: '型号', value: 'material.model'},
      {text: '品牌', value: 'material.brand'},
      {text: '退库数量', value: 'sum'},
      {text: '单位', value: 'material.unit.name'},
      {text: '单价', value: 'taxPrice'},
      {text: '金额', value: 'taxMoney'},
    ],
    headers: [
      {text: "项目名称", value: 'project.name'},
      {text: "领料单号", value: 'outNumber'},
      {text: "领料日期", value: 'outDate'},
      {text: "领料人", value: 'outPerson.name'},
      {text: "领料单位", value: 'company.name'},
    ],
    loading: false,
    loading2: false,
    item: null,

    projectArray: [],
    searchProject: null,
    searchProjectId: null,
    outPage: 1,
    concatOut: false,
    prevTop:0,
    lastPage:false
  }),
  created() {
    this.searchProjectId = this.projectId
    this.list()
  },
  watch: {
    searchProject(val) {
      search(val).then(r => {
        this.projectArray = r
      })
    },
    projectId: {
      handler() {
        this.lastPage = false
        this.page = 1
        this.projectList = []
        this.searchProjectId = this.projectId
        this.materList = []
        this.list()
      }
    },
    outPage(){
      this.list()
    }
  },
  methods: {
    scrollHandler(e) {
      let container = e.target
      if (container.clientHeight + container.scrollTop >= container.scrollHeight && !this.lastPage) {
        // 这里可以写其他需要执行的逻辑
        this.concatOut = true
        this.outPage++
      }else {
        /*let top = container.scrollTop
        let offset = top - this.prevTop

        if(top > this.prevTop && offset > 38){
          let thanIdx = this.item._index + 1
          if(thanIdx < this.projectList.length){
            this.loadOutMater(e,{item:this.projectList[thanIdx],index:thanIdx})
          }
          this.prevTop = top
        }else{
          offset = this.prevTop - top
          if(offset > 38){
            let thanIdx = this.item._index - 1
            if(thanIdx != -1){
              this.loadOutMater(e,{item:this.projectList[thanIdx],index:thanIdx})
            }
            this.prevTop = top
          }
        }*/
      }
    },
    list() {
      // if (this.projectId) {
      this.loading = true
      listByProject({searchStr: this.searchText, projectId: this.searchProjectId, page: this.outPage, itemsPerPage: 20})
          .then((items) => {
            if (this.concatOut) {
              if(items.length <= 0){
                this.lastPage = true
                return
              }
              this.projectList = this.projectList.concat(items)
            } else {
              this.projectList = items
              if (items.length > 0) {
                this.loadOutMater(null, {item: items[0],index:0})
              }
            }
          }).finally(() => this.loading = false)
      // }
    },
    loadOutMater(event, {item,index}) {
      if (item.select) {
        item.select = !item.select
      } else {
        this.$set(item, "select", true)
      }
      if (this.item) {
        this.item.select = false
      }
      item._index = index
      this.item = item
      this.loading2 = true
      outMaterList(item.id).then(result => {
        this.materList = result
      }).finally(() => {
        this.loading2 = false
      })
    },
    selectHandler(event, {select, isSelected}) {
      select(!isSelected)
    },
    getSelectItems() {
      return this.selectItems
    },
    clearSelectItems() {
      this.selectItems = []
    },
    /**
     * 获取当前选中的出库单材料对象
     * @returns {null}
     */
    getItem() {
      return this.item
    }
  }
}
</script>

<style scoped>

</style>