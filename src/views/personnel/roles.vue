<template>
  <div>
    <v-row>
      <v-col>
        <v-data-table :items="items" :headers="headers" :search="searchRole">
          <template v-slot:top>
            <v-row>
              <v-col lg="2">
                <v-btn color="primary" @click="openAddRole">新增</v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col lg="2">
                <v-text-field v-model="searchRole" label="搜索"></v-text-field>
              </v-col>
            </v-row>
          </template>
          <template v-slot:item.action="{item}">
            <v-btn :loading="loading" @click="update(item)" x-small>修改</v-btn>
            <v-btn :loading="loading" class="ml-1" @click="openDeleteDialog(item)" color="error" x-small>删除
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="updateDialog" width="50%">
      <v-card class="pa-5">
        <v-form>
          <v-text-field :disabled="disabled"
                        label="角色名称"
                        v-model="item.name"></v-text-field>
          <v-autocomplete multiple
                          item-value="id"
                          :items="users"
                          item-text="name"
                          return-object
                          :search-input.sync="searchUser"
                          label="添加人员"
                          v-model="addPersons"></v-autocomplete>
          <v-data-table :items="rolePersons" :headers="headers2">
            <template v-slot:item.action="{item}">
              <v-btn color="error" @click="unbind(item)" :loading="loading" x-small>删除</v-btn>
            </template>
          </v-data-table>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="updateRole" color="primary">确定</v-btn>
          <v-btn @click="updateDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" width="50%">
      <v-card class="pa-5">
        <h3 class="text-center">确定删除：{{ deleteItem.name }}?</h3>
        <v-data-table :items="rolePersons" :headers="headers2"></v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteRole" color="primary">确定</v-btn>
          <v-btn @click="deleteDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {deleteRole, deleteStaff, getRoleUsers, insertRole, insertStaff, searchRoles, update} from '@/api/role'
import {getStaff} from '@/api/staff'

export default {
  name: "roles",
  data: () => ({
    searchRole: null,
    loading: false,
    searchUser: null,
    updateDialog: false,
    items: [],
    headers: [
      {text: '角色名称', value: 'name', width: '15%'},
      {text: '人员列表', value: 'persons', width: '70%'},
      {text: '操作', value: 'action', width: '15%'}
    ],
    item: null,

    rolePersons: [],
    headers2: [
      {text: '姓名', value: 'name'},
      {text: '部门', value: 'section.name'},
      {text: '操作', value: 'action'},
    ],
    addPersons: [],
    users: [],

    deleteDialog: false,
    deleteItem: {
      name: null
    },
    disabled: true,
  }),
  watch: {
    searchUser(value) {
      getStaff(value).then(data => {
        this.users = data;
      });
    }
  },
  created() {
    this.reset();
    this.list();
  },
  methods: {
    openAddRole() {
      this.reset();
      this.disabled = false;
      this.updateDialog = true;
    },
    updateRole() {
      if (this.item.coding != null) {
        //    修改角色
        update(this.item)
        //添加人员到角色
        this.appendStaff();
      } else {
        //新增角色
        insertRole(this.item).then((data) => {
          this.item = data;
          //添加人员到角色
          this.appendStaff()
          this.list()
        });
      }
    },
    appendStaff() {
      this.item.staffList = this.addPersons;
      insertStaff(this.item).then(() => {
        this.getRoleUsers();
      }).finally(() => this.updateDialog = false)
    },
    reset() {
      this.item = {
        name: null,
        id: null,
        coding: null,
        persons: null
      };
      this.addPersons = [];
      this.rolePersons = [];
    },
    update(item) {
      this.reset()
      this.item = item
      this.getRoleUsers()
      this.disabled = false
      this.updateDialog = true
    },
    list() {
      searchRoles().then(data => {
        data.forEach(item => {
          item.persons = "";
        })
        this.items = data;
      })
    },
    getRoleUsers(coding) {
      this.item.persons = "";
      getRoleUsers(coding || this.item.coding).then(data => {
        data.forEach(user => {
          this.item.persons += user.name + ";";
        })
        this.rolePersons = data;
      })
    },
    unbind(person) {
      this.loading = true;
      deleteStaff(person.id, this.item.coding).then(() => {
        this.getRoleUsers();
      }).finally(() => {
        this.loading = false
      });
    },
    deleteRole() {
      this.loading = true;
      deleteRole(this.deleteItem.coding).then(() => {
        this.list();
      }).finally(() => {
        this.loading = false;
        this.deleteDialog = false;
      })
    },
    openDeleteDialog(item) {
      this.getRoleUsers(item.coding);
      this.deleteItem = item;
      this.deleteDialog = true;
      console.log("this.disabled", this.disabled);
    }
  }
}
</script>

<style scoped>

</style>