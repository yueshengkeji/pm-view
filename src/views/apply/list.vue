<template>
  <div>
    <v-data-table :headers="headers"
                  :dense="$vuetify.breakpoint.md"
                  :server-items-length="total"
                  :options.sync="options"
                  :loading="loading"
                  sort-desc
                  sort-by="date"
                  :items="items">
      <template v-slot:top>
        <v-row dense>
          <v-col lg="1">
            <v-btn color="primary" @click="addApply">新增</v-btn>
          </v-col>
          <v-col lg="2">
            <v-checkbox class="mt-1" dense label="我的单据" @change="list"
                        v-model="query.isStaffId"></v-checkbox>
          </v-col>
          <v-spacer></v-spacer>
          <v-col lg="2">
            <v-autocomplete :items="projectList"
                            :search-input.sync="searchProject"
                            label="搜索项目"
                            dense
                            hide-details
                            clearable
                            item-text="name"
                            item-value="id"
                            return-object
                            v-model="queryProject">

            </v-autocomplete>
          </v-col>
          <v-col lg="2">
            <v-text-field dense label="搜索"
                          @keyup.enter="list"
                          append-outer-icon="mdi-magnify"
                          @click:append-outer="list"
                          v-model="query.str"></v-text-field>
          </v-col>
        </v-row>
      </template>

      <template v-slot:item.project.name="{item}">
        <p v-if="item.project">{{ item.project.name }}</p>
      </template>

      <template v-slot:item.audit="{item}">
        <v-chip x-small :color="formatter(item.audit)">{{ formatterText(item.audit) }}</v-chip>
      </template>

      <template v-slot:item.remark="{item}">
        <div :title="item.remark" class="text-no-wrap text-truncate" :style="{width:'150px'}">
          {{ item.remark }}
        </div>
      </template>

      <template v-slot:item.action="{item}">
        <v-btn @click="detail(item)" x-small>明细</v-btn>
        <v-btn @click="editItem(item)" color="primary" x-small class="ml-1">编辑</v-btn>
        <v-btn @click="deleteApply(item)" color="error" x-small class="ml-1">删除</v-btn>
      </template>
    </v-data-table>
    <!--        申请单明细-->
    <v-dialog v-model="detailDialog" width="80%" :fullscreen="$vuetify.breakpoint.xs">
      <v-card class="pa-5">
        <apply :frameId="item.id" :edit="edit" @success="success"></apply>
      </v-card>
    </v-dialog>
    <!--        删除申请单提示dialog-->
    <v-dialog v-model="deleteDialog" width="50%">
      <v-card class="pa-5" :loading="deleteLoading">
        <v-card-title>删除申请单</v-card-title>
        <v-card-text>确定删除:{{ deleteItem.serialNumber }}?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="submitDelete(deleteItem)">确定</v-btn>
          <v-btn @click="deleteDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <instance-detail :frame="id" :close="reset"></instance-detail>

    <v-snackbar v-model="msgShow">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {deleteApply, list} from '@/api/apply'
import {search} from '@/api/project'

export default {
  components: {
    apply: () => import('@/components/15304'),
    instanceDetail: () => import('@/components/easyflow/instance-detail.vue')
  },
  name: "list",
  data: () => ({
    detailDialog: false,

    id: null,
    items: [],
    headers: [
      {text: '项目名称', value: 'project.name', width: '15%'},
      {text: '申请单名称', value: 'serialNumber', width: '15%'},
      {text: '申请日期', value: 'date', width: '10%'},
      {text: '审批日期', value: 'approveDate', width: '10%'},
      {text: '申请人', value: 'staff.name', width: '10%'},
      {text: '状态', value: 'audit', width: '10%'},
      {text: '备注', value: 'remark', width: '10%'},
      {text: '操作', value: 'action', width: '20%'},
    ],
    total: 0,
    query: {
      str: null,
      approves: '0,1',
      proStatus: '0,1,2',
      staffId: null,
      isStaffId: true,
    },
    options: {},
    loading: false,
    edit: false,

    msgShow: false,
    msg: null,
    item: {
      id: null,

    },

    deleteDialog: false,
    deleteItem: {serialNumber: null},
    deleteLoading: false,

    searchProject: null,
    projectList: [],
    queryProject: null,
  }),
  created() {

  },
  watch: {
    searchProject(val) {
      search(val).then(result => this.projectList = result)
    },
    options: {
      handler() {
        this.list();
      },
      deep: true
    },
  },

  methods: {
    editItem(item) {
      if (item.audit == 1) {
        this.msg = '单据已审核，禁止修改'
        this.msgShow = true
      } else {
        this.edit = false
        this.item = item
        this.detailDialog = true
      }
    },
    deleteApply(item) {
      this.deleteItem = item
      this.deleteDialog = true
    },
    submitDelete(item) {
      this.deleteLoading = true
      deleteApply(item.id).then(() => {
        this.list();
      }).finally(() => {
        this.deleteLoading = false
        this.deleteDialog = false
      })
    },
    success() {
      this.detailDialog = false
      this.list()
    },
    addApply() {
      this.reset()
      this.edit = false
      this.detailDialog = true
    },
    reset() {
      this.id = null
      this.item = {
        serialNumber: null,
        project: {id: null, name: null},
        city: {name: null, id: ''},
        staff: {name: null, id: null},
        applyMoney: 0,
        applyMaterialList: [],
        id: null,
        remark: '',
        date: this.dateFormat(new Date(), 'YYYY-mm-dd')
      }
    },
    formatter(state) {
      if (state == 0) {
        return "secondary"
      } else if (state == 1) {
        return "primary"
      } else {
        return "error"
      }
    },
    formatterText(state) {
      if (state == 0) {
        return "审核中"
      } else if (state == 1) {
        return "已审核"
      } else {
        return "未发起"
      }
    },
    getSort() {
      let sortName = this.options.sortBy[0], sortOrder = this.options.sortDesc[0] ? 'DESC' : "ASC";
      return [sortName, sortOrder];
    },
    detail(item) {
      this.id = item.id;
    },
    list() {
      this.loading = true
      let {page, itemsPerPage} = this.options;
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      let sort = this.getSort()
      this.query.sortName = sort[0]
      this.query.sortOrder = sort[1]
      this.query.staffId = this.query.isStaffId ? this.$store.state.user.id : null
      if (this.queryProject) {
        this.query.projectId = this.queryProject.id
      } else {
        this.query.projectId = null
      }
      list(this.query).then(data => {
        this.total = data.total
        this.items = data.rows
      }).finally(() => {
        this.loading = false
      });
    }
  }
}
</script>

<style scoped>

</style>