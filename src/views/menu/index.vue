<template>
  <div>

    <v-row>
      <v-col lg="3">
        <v-treeview @click="active" activatable :items="menus" return-object item-text="name"
                    @update:open="open"
                    open-on-click :active.sync="active" @update:active="edit"></v-treeview>
      </v-col>
      <v-col lg="9">
        <v-card>
          <v-form ref="menuForm">
            <v-container>
              <v-row>
                <v-col lg="2">
                  <v-text-field label="菜单名称" :rules="nameRule" v-model="menu.name"></v-text-field>
                </v-col>
                <v-col lg="2">
                  <v-autocomplete label="上级菜单" v-model="menu.parent.id" item-value="id"
                                  item-text="name" :filter="filterMenus"
                                  :items="menus"></v-autocomplete>
                </v-col>
                <v-col lg="2">
                  <v-text-field label="实体类名称" v-model="menu.beanName"></v-text-field>
                </v-col>
                <v-col lg="2">
                  <v-text-field label="排序序号" v-model="menu.sort"></v-text-field>
                </v-col>
                <v-col lg="2">
                  <v-text-field label="url" v-model="menu.url"></v-text-field>
                </v-col>
                <v-col lg="2">
                  <v-text-field label="菜单编码" v-model="menu.coding"></v-text-field>
                </v-col>
                <v-col lg="4">
                  <v-text-field label="备注" v-model="menu.remark"></v-text-field>
                </v-col>
                <v-col lg="4">
                  <v-text-field label="图标" v-model="menu.ico"></v-text-field>
                </v-col>
                <v-col lg="2">
                  <v-checkbox label="是否隐藏" v-model="menu.hide"></v-checkbox>
                </v-col>
                <v-col lg="2">
                  <v-checkbox label="是否外链" v-model="menu.outer"></v-checkbox>
                </v-col>
                <v-col lg="8">
                  <v-text-field label="外链url" v-model="menu.outerPath"></v-text-field>
                </v-col>
                <v-col lg="4">
                  <v-textarea rows="1" v-model="menu.flowSql" label="流程sql语句"></v-textarea>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-data-table :items="roles"
                                hide-default-footer
                                :items-per-page="1000"
                                :headers="headers">
                    <template v-slot:top>
                      <v-btn @click="insertRole" :disabled="menu.id == null">新增角色</v-btn>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-icon small class="mr-2" @click="insertRole(item)">
                        mdi-account-multiple-plus
                      </v-icon>
                      <v-icon small @click="deleteRole(item)">
                        mdi-delete
                      </v-icon>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="submit">提交</v-btn>
                <v-btn color="error" class="ml-1" @click="deleteMenu">删除</v-btn>
              </v-card-actions>


            </v-container>
          </v-form>
        </v-card>

      </v-col>
    </v-row>

    <v-dialog v-model="addRole" width="30%">
      <v-card class="pa-5">
        <v-form ref="addRole">
          <v-text-field v-model="role.menuId" v-text="menu.name" label="菜单名称"></v-text-field>
          <v-autocomplete v-model="role.coding" :search-input.sync="search"
                          :items="bindItems" item-value="coding" item-text="name" :rules="codingRule"
                          label="角色名称"></v-autocomplete>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="bind">确定</v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>
  </div>
</template>

<script>
import {bindRole, deleteMenu, deleteRole, getById, getRoles, getRoot, insertMenu, updateMenu} from '@/api/menu'
import {searchRoles} from '@/api/role'

export default {
  name: "index",
  data: () => ({
    menus: [],
    active: [],
    menu: {parent: {name: null}},
    roles: [],
    headers: [
      {text: '角色名称', value: 'name', width: '50%'},
      {text: '操作', value: 'actions', sortable: false, width: '50%'},
    ],
    addRole: false,
    addRoleTitle: "",
    role: {
      menuId: null,
      coding: null
    },
    search: null,
    bindItems: [],
    codingRule: [
      v => !!v || "请选择角色",
    ],
    nameRule: [
      v => !!v || "请输入菜单名称",
    ]
  }),
  created() {
    this.reset();
    this.getRoot();
  },
  watch: {
    search(value) {
      searchRoles(value).then(result => {
        this.bindItems = result;
      })
    }
  },
  methods: {
    filterMenus(item, queryText, itemText) {
      console.log(item.nau);
      return itemText.indexOf(queryText) > -1;
    },
    bind() {
      let valid = this.$refs['addRole'].validate();
      if (valid) {
        bindRole(this.role).then(() => {
          this.loadRoles(this.menu);
          this.role = {
            menuId: null,
            coding: null
          }
        });
        this.addRole = false;
      }
    },
    insertRole() {
      this.addRole = true;
      this.role.menuId = this.menu.id;
      this.addRoleTitle = this.menu.name;
    },
    deleteRole(item) {
      deleteRole(item.id).then(() => {
        this.loadRoles(this.menu);
      });
    },
    deleteMenu() {
      if (this.menu.id != null) {
        deleteMenu(this.menu.id).then(() => {
          this.getRoot();
          this.reset();
        });
      }
    },
    reset() {
      this.menu = {
        type: 3,
        parent: {name: null},
        name: null,
        sort: null,
        ico: null,
        url: null,
        remark: null,
        outer: false,
        outerPath: null,
        hide: false,
        beanName: null,
        coding: null,
        flowSql: null
      }
      this.roles = [];
    },
    edit(activeMenu) {
      let menu = activeMenu[0];
      if (menu.parentId) {
        getById(menu.parentId).then(result => {
          getById(menu.id).then(result2 => {
            result2.parent = result
            this.menu = result2
            console.log("this.menu", this.menu.flowSql)
          })
        })
      } else {
        menu.parent = {id: null}
        this.menu = menu
      }
      this.loadRoles(menu);
    },
    loadRoles(menu) {
      getRoles(menu.id).then(roles => {
        this.roles = roles;
      })
    },
    getRoot() {
      getRoot(3).then(menus => {
        this.menus = menus;
      })
    },
    open(items) {
      if (items.length > 0) {
        this.edit(items);
      }
    },
    submit() {
      let valid = this.$refs['menuForm'].validate();
      if (valid) {
        if (this.menu.parent.id == null) {
          this.menu.parent = null;
        } else {
          this.menu.parentId = this.menu.parent.id;
        }
        if (this.menu.id != null) {
          //更新
          updateMenu(this.menu).then(() => {
            this.reset();
            this.getRoot();
          });
        } else {
          //添加
          insertMenu(this.menu).then(() => {
            this.reset();
            this.getRoot();
          });
        }
      }
    }
  }
}
</script>

<style scoped>

</style>