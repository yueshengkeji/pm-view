<template>
  <div>
    <v-data-table :items.sync="items"
                  :loading="loading"
                  :options.sync="options"
                  sort-desc
                  sort-by="id"
                  :server-items-length.sync="total"
                  :headers="headers">
      <template v-slot:top>
        <v-row dense>
          <v-col sm="5">
            <v-btn @click="insertHandler" color="primary">新增参数</v-btn>
            <v-btn @click="dingLinkPic" color="primary" style="margin-left: 10px">钉钉消息图片</v-btn>
            <v-btn @click="createDingDepartment" color="primary" style="margin-left: 10px">钉钉创建部门</v-btn>
            <v-btn @click="dingCreateUserDialog = true" color="primary" style="margin-left: 10px">钉钉邀请用户</v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col sm="2">
            <v-text-field label="搜索" v-model="options.str"></v-text-field>
          </v-col>
        </v-row>
      </template>

      <template v-slot:item.action="{item}">
        <v-btn x-small @click="insertHandler(item)">新增</v-btn>
        <v-btn class="ml-1" x-small @click="updateHandler(item)">修改</v-btn>
        <v-btn class="ml-1" x-small color="error" @click="deleteHandler(item)">删除</v-btn>
        <v-btn class="ml-1" x-small @click="configListHandler(item)">参数列表</v-btn>
      </template>

    </v-data-table>

    <v-dialog v-model="configListDialog" width="80%">
      <v-card class="pa-3">
        <h3>
          <v-btn small color="primary" @click="insertHandler(item)">新增参数</v-btn>
          {{ item.name }}
        </h3>
        <v-data-table :items.sync="configList"
                      :headers="configListHeader">
          <template v-slot:item.action="{item}">
            <v-btn x-small @click="updateHandler(item)">修改</v-btn>
            <v-btn class="ml-1" x-small color="error" @click="deleteHandler(item)">删除</v-btn>
          </template>
        </v-data-table>

      </v-card>
    </v-dialog>

    <v-dialog v-model="updateDialog" width="60%">
      <v-card class="pa-3">
        <v-form>
          <v-text-field label="参数名称" v-model="item.name"></v-text-field>
          <v-text-field label="参数编码" v-model="item.coding"></v-text-field>
          <v-text-field label="参数数值" v-model="item.value"></v-text-field>
          <v-text-field label="备注" v-model="item.remark"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="updateDialog = false">取消</v-btn>
          <v-btn color="primary" @click="saveHandler">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--钉钉链接消息图片-->
    <v-dialog v-model="dingImageDialog" width="60%">
      <ding-link-image></ding-link-image>
    </v-dialog>

    <v-dialog v-model="dingCreateUserDialog" width="40%">
      <v-card>
        <v-card-title class="text-h5">创建用户前请先确认是否先创建了部门？</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary"
                 @click="createDingUser"
          >
            确定
          </v-btn>
          <v-btn @click="dingCreateUserDialog = false">
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--加载框-->
    <v-dialog v-model="loadDialog"
              hide-overlay
              persistent
              width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          正在处理。。。
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {deleteById, insert, list, update} from '@/api/systemConfig'
import dingLinkImage from "../dingTalkLinkNoticeImage/dingLinkImage"
import {createDingDepartment, createDingUser} from "../../../api/dingTalk";

export default {
  name: "index",
  components: {dingLinkImage},
  data: () => ({
    items: [],
    loading: false,
    options: {str: null, parent: -1},
    total: 0,
    headers: [
      {text: '参数名称', value: 'name'},
      {text: '参数编码', value: 'coding'},
      {text: '数值', value: 'value'},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action'},
    ],
    menu: false,
    listDef: null,

    configListDialog: false,
    item: null,

    configListHeader: [
      {text: '参数名称', value: 'name'},
      {text: '参数编码', value: 'coding'},
      {text: '数值', value: 'value'},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action'},
    ],
    configList: [],
    updateDialog: false,

    dingImageDialog: false,
    loadDialog: false,
    dingCreateUserDialog: false,
  }),
  watch: {
    options: {
      handler() {
        this.loadList()
      },
      deep: true
    }
  },
  created() {
    this.reset()
  },
  methods: {
    insertHandler(item) {
      this.reset()
      if (item) {
        this.item.parent = item.parent || item.id
      }
      this.updateDialog = true
    },
    reset() {
      this.item = {name: null, coding: null, value: null, remark: null, id: null}
    },
    saveHandler() {
      if (this.item.id) {
        update(this.item).then(() => {
          this.updateDialog = false
        })
      } else {
        insert(this.item).then(() => {
          this.updateDialog = false
          if (this.item.parent) {
            this.loadDetail(this.item.parent)
          } else {
            this.loadList()
          }
        })
      }
    },
    updateHandler(item) {
      this.item = item
      this.updateDialog = true
    },
    loadDetail(parent) {
      let q = Object.assign({}, this.options)
      q.parent = parent || this.item.id
      q.sortBy = q.sortBy[0]
      q.sortDesc = q.sortDesc[0]
      q.page = 1
      q.itemsPerPage = 100
      q.str = null
      list(q).then(result => {
        this.configList = result.rows
      })
    },
    configListHandler(item) {
      this.item = item
      this.configListDialog = true
      this.loadDetail()
    },
    deleteHandler(item) {
      this.confirm("确定删除该参数吗？").then(() => {
        deleteById(item.id).then(() => {
          this.loadList()
          this.loadDetail()
        })
      })
    },
    loadList() {
      this.loading = true
      let query = Object.assign({}, this.options)
      try {
        query.sortBy = query.sortBy[0]
        query.sortDesc = query.sortDesc[0]
      } catch (e) {
        // ignore this e
      }
      if (this.listDef) {
        console.log(this.listDef)
      }
      this.listDef = list(query).then(result => {
        this.items = result.rows
        this.total = result.total
      }).finally(() => this.loading = false)
    },

    dingLinkPic() {
      this.dingImageDialog = true
    },

    createDingDepartment() {
      this.loadDialog = true
      createDingDepartment().then(res => {
        if (res != null) {
          this.loadDialog = false
        }
      })
    },

    createDingUser() {
      this.loadDialog = true
      createDingUser().then(res => {
        if (res != null) {
          this.loadDialog = false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
