<template>
  <div>
    <v-btn @click="viewList" fab absolute small style="left:100px;tpo:50px">{{ treeview ? '视图' : '列表' }}
    </v-btn>
    <v-row>
      <v-col v-if="treeview">
        <v-data-table :items="items" :headers="headers" item-key="id" :search="search">
          <template v-slot:top>
            <v-row>
              <v-col lg="2">
                <v-btn color="primary" @click="addSection">添加</v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col lg="2">
                <v-text-field label="搜索" v-model="search"></v-text-field>
              </v-col>
            </v-row>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn x-small @click="updateHandler(item)" class="mr-1">修改</v-btn>
            <v-btn x-small @click="detailHandler(item)">查看</v-btn>
          </template>
        </v-data-table>
      </v-col>
      <v-col v-else>
        <vue-okr-tree node-key="id"
                      :render-content="renderContent"
                      @node-click="treeDetailHandler"
                      :data="okrItems"
                      default-expand-all
                      show-collapsable></vue-okr-tree>
      </v-col>
    </v-row>
    <!--        编辑部门信息-->
    <v-dialog v-model="sectionDialog" width="50%">
      <v-card class="pa-3">
        <v-form ref="sectionForm">
          <v-text-field label="部门名称" :rules="rules.name" v-model="item.name"></v-text-field>
          <v-text-field label="联系电话" v-model="item.tel"></v-text-field>
          <v-text-field label="办公地点" v-model="item.address"></v-text-field>
          <v-autocomplete :search-input.sync="searchUsers"
                          label="部门经理"
                          v-model="item.managerid"
                          :items="users"
                          item-text="name"
                          item-value="id"></v-autocomplete>
          <v-autocomplete :search-input.sync="searchUsers2"
                          label="部门总监"
                          v-model="item.assistManager"
                          :items="users2"
                          item-text="name"
                          item-value="id"></v-autocomplete>
          <v-autocomplete :search-input.sync="searchSection" label="上级部门" v-model="item.parentid"
                          :items="selectSection" item-text="name" item-value="id"></v-autocomplete>
          <v-text-field label="部门编码" title="对应着办公用品查看数据的权限标签值"
                        v-model="item.coding"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :loading="loading" @click="sectionDialog = false">取消</v-btn>
          <v-btn :loading="loading" @click="insertSection" color="primary">确定</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
    <!--        部门内人员列表信息-->
    <v-dialog v-model="detailDialog" width="50%">
      <v-card class="pa-3">
        <v-data-table :items="staffList"
                      :headers="staffHeaders">
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="detailDialog = false" small>关闭</v-btn>
          <v-btn @click="updateHandler(detailItem)" small color="primary">修改部门</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {getStaffBySectionId, insert, list, treeList, update} from '@/api/section'
import {getStaff} from '@/api/staff'
import {VueOkrTree} from 'vue-okr-tree'
import 'vue-okr-tree/dist/vue-okr-tree.css'

export default {
  name: "personnel-section",
  components: {
    VueOkrTree
  },
  data: () => ({
    search: null,
    staffHeaders: [
      {text: '部门名称', value: 'section.name'},
      {text: '姓名', value: 'name'},
      {text: '手机号', value: 'tel'},
    ],
    staffList: [],
    items: [],
    headers: [
      {text: '部门名称', value: 'name'},
      {text: '上级部门', value: 'parent.name'},
      {text: '部门经理', value: 'managerName'},
      {text: '部门总监', value: 'assistManagerName'},
      {text: '编码', value: 'coding'},
      {text: '操作', value: 'action'},
    ],
    item: null,
    sectionDialog: false,

    searchUsers: null,
    searchUsers2: null,
    users: [],
    users2: [],

    searchSection: null,
    selectSection: [],

    rules: {
      name: [v => !!v || "部门名称不能为空", v => (!!v && v.length < 100) || "部门名称过长"],
    },
    loading: false,
    treeview: false,

    okrItems: [],
    detailDialog: false,
    detailItem: null,
    itemsMap: []
  }),
  created() {
    this.reset()
    this.treeList()
    this.list()
  },
  watch: {
    searchUsers2(value) {
      getStaff(value).then(data => {
        this.users2 = data;
      })
    },
    searchUsers(value) {
      getStaff(value).then(data => {
        this.users = data;
      })
    },
    searchSection(value) {
      this.selectSection = [];
      this.items.forEach(item => {
        if (item.name.indexOf(value) != -1) {
          this.selectSection.push(item);
        }
      })
    }
  },
  methods: {
    treeDetailHandler(i) {
      if (i.parentId != "") {
        i.parent
      }
      this.detailHandler(i)
    },
    renderContent(i, node) {
      return i('div', node.data.name)
    },
    insertSection() {
      this.loading = true;
      let valid = this.$refs['sectionForm'].validate();
      if (valid) {
        if (this.item.id != null) {
          update(this.item).then(() => {
            this.list();
          }).catch((e) => {
            console.log(e);
          }).finally(() => {
            this.loading = false
            this.sectionDialog = false
          })
        } else {
          insert(this.item).then(() => {
            this.list();
          }).catch((e) => {
            console.log(e);
          }).finally(() => {
            this.loading = false
            this.sectionDialog = false
          })
        }

      }
    },
    reset() {
      this.item = {
        managerid: null,
        name: null,
        parentid: null,
        tel: null,
        address: null,
        remark: null,
        assistManager: '',
        assistManagerName: '',
        coding: ''
      }
      this.selectSection = [];
      this.users = [];
    },
    addSection() {
      this.sectionDialog = true
    },
    detailHandler(item) {
      this.detailItem = item
      this.staffList = []
      getStaffBySectionId(item.id).then(result => {
        this.staffList = result
      })
      this.detailDialog = true
    },
    updateHandler(item) {
      this.reset()
      if (item.parent) {
        this.selectSection.push(item.parent)
      }
      if (item.managerName) {
        this.users.push({id: item.managerid, name: item.managerName})
      }
      if (item.assistManagerName) {
        this.users2.push({id: item.assistManager, name: item.assistManagerName})
      }
      this.item = item
      this.sectionDialog = true
    },
    list() {
      list().then(data => {
        this.items = data
        this.items.forEach(item => {
          this.itemsMap[item.id] = item
        })
      })
    },
    treeList() {
      treeList().then(result => {
        this.okrItems = result
      })
    },
    viewList() {
      this.treeview = !this.treeview
    }
  }
}
</script>

<style scoped>

</style>
