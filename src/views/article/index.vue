<template>
  <div>
    <v-row>
      <v-col sm="3" cols="12" class="overflow-y-auto" style="max-height: 550px;">
        <v-btn v-if="treeData.length == 0" x-small link @click.stop="insertFolderHander(null)">新增</v-btn>
        <v-treeview :active.sync="active"
                    :items="treeData"
                    :load-children="fetchFolders"
                    activatable
                    :open.sync="open"
                    open-on-click
                    return-object
                    @update:active="activeFolder"
                    transition>
          <template v-slot:append="{item}">
            <v-btn v-if="showFolderBtn" x-small link @click.stop="insertFolderHander(item)">新增</v-btn>
            <v-btn v-if="showFolderBtn" class="ml-1" x-small link @click.stop="updateFolderHanlder(item)">修改</v-btn>
            <v-btn v-if="showFolderBtn" class="ml-1" x-small color="error" link
                   @click.stop="deleteFolder(item)">删除
            </v-btn>
          </template>
        </v-treeview>
      </v-col>
      <v-col sm="9" cols="12">
        <v-data-table :items="articleList.list"
                      @dblclick:row="editArticle"
                      :search="articleList.param.searchName"
                      :items-per-page="10"
                      :options.sync="articleList.options"
                      :server-items-length="articleList.total"
                      :headers="articleList.header">

          <template v-slot:top>
            <v-row>
              <v-col lg="1" sm="2" cols="6">
                <v-btn bottom @click="openArticle" color="primary">新增</v-btn>
              </v-col>
              <v-col lg="2" sm="3" cols="6">
                <v-checkbox class="ma-0" @change="loadArticleList"
                            v-model="articleList.param.isLoadAll" label="所有单据"/>
              </v-col>
            </v-row>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-1"

                    @click="editArticle($event,item)">
              mdi-pencil
            </v-icon>
            <v-icon small
                    class="mr-1"
                    @click="deleteArticle(item)">
              mdi-delete
            </v-icon>
            <v-icon small @click="detail(item)">
              mdi-printer
            </v-icon>
          </template>

        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog
        v-model="loading"
        hide-overlay
        persistent
        width="300">
      <v-card
          color="primary"
          dark>
        <v-card-text>
          加载中
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="article.show"
              ref="editDialog"
              :fullscreen="$vuetify.breakpoint.xs" width="92%">

      <v-card class="pa-3">
        <!--<v-card-title>
            新增办文
            <v-spacer></v-spacer>
            <v-btn @click="addArticle" color="primary">提交</v-btn>
            <v-btn class="ml-1" @click="article.show = false">取消</v-btn>
        </v-card-title>-->
        <v-form ref="articleForm" style="overflow: hidden" class="pt-2">

          <v-row dense>
            <v-col sm="4" cols="6">
              <v-autocomplete :items.sync="article.projects"
                              item-text="name"
                              dense
                              v-model="article.form.article.project"
                              label="项目名称"
                              auto-select-first
                              return-object
                              :loading="article.projectLoading"
                              :search-input.sync="search">
                <template v-slot:item="data">
                  <v-list-item-content v-text="data.item.name"></v-list-item-content>
                </template>

              </v-autocomplete>
            </v-col>
            <v-col sm="4" cols="6">
              <v-text-field dense :rules="articleRules.name" v-model="article.form.article.name"
                            label="办文标题"></v-text-field>
            </v-col>
            <v-col sm="4" cols="6">
              <easyFlow :start="article.startFlow"
                        :instance="article.flowModel"
                        :folderId="thisFolder.id"
                        :searchValue="searchFlow"
                        :default-flow-name="defaultFlowName"
                        dense
                        :change="change"
                        :success="success"></easyFlow>
            </v-col>
            <v-col sm="8" cols="6">
              <v-text-field dense :rules="articleRules.remark" label="备注"
                            v-model="article.form.article.remark"></v-text-field>
            </v-col>
            <v-col sm="4" cols="12">
              <file-upload ref="fileUpload"
                           :mainId="article.form.article.id"
                           mainCoding="15203"
                           @change="fileUpload"></file-upload>
            </v-col>
            <v-col cols="12">
              <vue-ueditor-wrap forceInit @ready="readyEdit" v-model="article.moduleHtml"
                                :config="article.editorOption"></vue-ueditor-wrap>
            </v-col>
          </v-row>

        </v-form>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-checkbox label="需要用印" v-model="article.form.article.useSeal" class="mr-1"></v-checkbox>
          <v-btn @click="addArticle" color="primary">提交</v-btn>
          <v-btn class="ml-1" @click="article.show = false">取消</v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>

    <v-dialog v-model="confirmInsert" width="30%">
      <v-card>
        <v-card-title>未选择审批流程，仅保存当前编辑的数据，确定提交吗？</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmAddArticle()" color="primary">确定</v-btn>
          <v-btn class="ml-1" @click="cancelInsert">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="articleFolderDialog" width="70%">
      <v-card class="pa-5">
        <v-card-title>
          编辑目录
        </v-card-title>
        <v-form ref="folderForm" style="max-height: 500px;overflow-y: auto">
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <v-autocomplete :items.sync="editTreeData"
                                :search-input.sync="searchTreeData"
                                v-model="thisFolder.parent"
                                item-text="name"
                                item-value="id"
                                return-object
                                label="上级目录"></v-autocomplete>
              </v-col>
              <v-col sm="4" cols="12">
                <v-text-field v-model="thisFolder.name" label="目录名称"
                              :rules="[v => !!v || '请输入目录名称']"></v-text-field>
              </v-col>
              <v-col sm="4" cols="12">
                <v-chip small>菜单路径：{{ menuUrl }}</v-chip>
              </v-col>
              <v-col cols="12">
                <vue-ueditor-wrap forceInit @ready="readyEdit2" v-model="folderModule"
                                  :config="article.editorOption"></vue-ueditor-wrap>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :loading="loading" color="primary" @click="saveFolder">确定</v-btn>
          <v-btn :loading="loading" @click="articleFolderDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>
    <instance-detail :close="close" :frame="frameId"></instance-detail>
  </div>
</template>

<script>
import {
  addArticle,
  deleteArticle,
  deleteFolder,
  getArticle,
  getContent,
  getFolder,
  getFolderById,
  getModuleByFolder,
  insertFolder,
  insertWord,
  searchFolder,
  updateArticle,
  updateFolder,
  updateWord
} from '@/api/article'
import {search} from '@/api/project'
import easyFlow from '@/components/easyflow/easyFlow'

import VueUeditorWrap from "vue-ueditor-wrap";
import instanceDetail from "@/components/easyflow/instance-detail";
import {backFLowMessage, getMessageByFrameId} from "@/api/approve";
import fileUpload from "../../components/fileUpload";

export default {
  components: {
    VueUeditorWrap,
    easyFlow,
    instanceDetail,
    fileUpload
  },
  name: "myArticle",
  data: () => ({
    searchTreeData: null,
    folderModule: null,
    folderEditor: null,
    articleFolderDialog: false,
    confirmInsert: false,
    confirmFlag: false,

    articleRules: {
      name: [v => !!v || "请输入办文标题", v => (!!v && v.length < 50) || "标题过长，不能超过50个字符"],
      remark: [v => (v != null && v.length < 1500) || "备注过长，不能超过1500个字符"]
    },
    showFolderBtn: false,
    autoOpenFolder: null,
    frameId: null,
    items: [],
    active: [],
    open: [],
    loading: false,
    thisFolder: {
      id: null,
    },
    article: {
      show: false,
      fileLoading: false,
      form: {
        flow: {name: null},
        article: {
          id: null,
          project: {name: null, id: ''},
          name: null,
          title: null,
          content: '',
          folder: {name: null},
          remark: '',
          useSeal: null
        },
        attachs: [],
        onUpFile: '',
        files: [],
        update: false,
      },
      projectLoading: false,
      projects: [],
      editorOption: {
        UEDITOR_HOME_URL: process.env.BASE_URL + "UEditor/",
        serverUrl: "",
        initialFrameHeight: '420'
      },
      editor: null,
      moduleHtml: '加载中...',
      flowModel: {
        message: {
          title: "",
          content: ""
        }
      },
      startFlow: false,
    },
    search: null,
    articleList: {
      header: [
        {text: '办文标题', value: 'name', width: '50%'},
        {text: '制单人', value: 'staff.name', width: '15%'},
        {text: '制单日期', value: 'date', width: '15%'},
        {text: '操作', value: 'actions', sortable: false, width: '10%'},
      ],
      list: [],
      param: {
        loading: false,
        isLoadAll: false,
        staffs: null,
        pageNumber: 1,
        pageSize: 10,
        searchText: null,
        sortName: null,
        sortOrder: null
      },
      options: {},
      total: 0,
    },
    deleteEditorStyle: false,
    searchFlow: null,
    parent: null,
    editTreeData: [],
    editModule: null,
    editContentFlag: false,
    editContent: null,
    defaultFlowName: null,
    menuUrl: null,
  }),
  props: {
    folderId: String,
  },
  computed: {
    treeData() {
      return this.items;
    }
  },
  created() {
    // let folderId = this.$route.params.folderId
    // if(folderId){
    //   getFolderById(folderId).then(result=>{
    //     if(result){
    //       this.autoOpenFolder = result.id
    //     }
    //   })
    // }
    if (this.$store.getters.roles.indexOf("维护") !== -1 || this.$store.getters.roles.indexOf("管理员") !== -1) {
      this.showFolderBtn = true
    }
    if (this.$vuetify.breakpoint.height) {
      console.log(this.$vuetify.breakpoint.height)
      if (this.$vuetify.breakpoint.height < 600) {
        this.article.editorOption.initialFrameHeight = 300
      } else if (this.$vuetify.breakpoint.height < 660) {
        this.article.editorOption.initialFrameHeight = 320
      } else {
        this.article.editorOption.initialFrameHeight = 400
      }
    }
    this.autoOpenFolder = this.folderId || this.$route.params.folderId
    this.loadFolder('')
  },
  watch: {
    'articleList.options': {
      handler() {
        this.loadArticleList();
      },
      deep: true,
    },
    search(value) {
      this.article.projectLoading = true
      search(value).then((projects) => {
        this.article.projects = projects;
      }).finally(() => {
        this.article.projectLoading = false;
      });
    },
    searchTreeData(value) {
      if (value != '') {
        searchFolder(value).then(res => {
          this.editTreeData = res
        })
      }
    },
    "$route.params.folderId": {
      handler() {
        // console.log("reload")
        // window.location.reload()
        this.autoOpenFolder = this.$route.params.folderId
        this.autoOpen()
      }
    }

  },
  methods: {
    saveFolder() {
      this.loading = true
      if (this.thisFolder.parent != null) {
        this.thisFolder.parentId = this.thisFolder.parent.id
      }
      this.editModule.wordToHtml = this.folderModule
      if ((this.editModule.id == null || this.editModule.id == "") && this.thisFolder.id == null) {
        //新增模板
        this.editModule.name = this.thisFolder.name
        insertWord(this.editModule).then((module) => {
          this.thisFolder.moduleId = module.id
          insertFolder(this.thisFolder).then(() => {
            this.articleFolderDialog = false
            this.loadFolder(null, this.parent)
          }).finally(() => this.loading = false)
        })
      } else {
        //更新模板
        updateWord(this.editModule)
        updateFolder(this.thisFolder).then(() => {
          this.articleFolderDialog = false
        }).finally(() => this.loading = false)
      }
    },
    insertFolderHander(parent) {
      this.resetFolder(parent)
      this.articleFolderDialog = true
    },
    updateFolderHanlder(item) {
      this.resetFolder()
      item.parent = {id: null, name: null};
      this.thisFolder = item
      this.loading = true;
      getFolderById(encodeURIComponent(item.parentId)).then(p => {
        this.editTreeData.push(p)
        this.thisFolder.parent = p
      })
      getModuleByFolder(this.thisFolder.moduleId).then(module => {
        this.editModule = module
        let htmlWord = module.wordToHtml
        htmlWord = htmlWord.replace(/0.5px/g, '1px');
        window.setTimeout(() => {
          this.folderEditor.execCommand('cleardoc');
          this.folderEditor.execCommand('inserthtml', htmlWord);
        }, 1000)
      }).finally(() => {
        this.loading = false
        this.articleFolderDialog = true
      })
      //
      let length = this.thisFolder.rootId.length
      let temp = []
      for (let x = 0; x < length; x = x + 8) {
        temp.push(this.thisFolder.rootId.substring(x, x + 8))
      }
      console.log(this.thisFolder, length, temp)
      this.menuUrl = `article/index/` + encodeURIComponent(temp.join(';'))
    },
    resetFolder(parent) {
      this.thisFolder = {
        id: null,
        name: null,
        parent: parent == null ? {id: null} : parent,
        parentId: null,
        moduleId: null,
      }
      this.editModule = {
        id: null,
        wordToHtml: null
      }
      if (parent != null) {
        this.editTreeData.push(parent)
      }
    },
    confirmAddArticle() {
      this.confirmFlag = true
      this.addArticle()
    },
    cancelInsert() {
      this.confirmInsert = false
    },
    deleteFolder(item) {
      deleteFolder(encodeURIComponent(item.id)).then(() => {
        location.reload()
      })
    },
    close() {
      this.frameId = null;
    },
    detail(item) {
      try {
        this.frameId = item.id
      } catch (e) {
        console.log("未发起流程", e);
      }
    },
    change(flow) {
      this.article.form.flow = flow;
    },
    editArticle(event, row) {
      this.reset()
      this.defaultFlowName = this.thisFolder.name
      row = row.item || row
      row.remark = row.remark || ''
      if (row.useSeal == null) {
        row.useSeal = false
      }
      this.article.form.article = row
      getContent(row.id).then(content => {
        try {
          this.editContent = content
          if (this.article.editor) {
            this.editContentFlag = false
            this.article.editor.execCommand('cleardoc');
            this.article.editor.execCommand('inserthtml', content);
          } else {
            this.editContentFlag = true
          }

        } catch (e) {
          console.log("editor error", e);
        }
      });

      getMessageByFrameId(row.id).then(msg => {
        if (msg != null) {
          if (msg.state == 2) {
            this.message("流程已经审批完成，禁止修改")
          } else {
            this.article.form.article.remark = msg.content;
            //提示用户修改文档，将会撤回已发起的流程
            this.confirm("文档已经发起审批，确定撤回修改吗？").then(() => {
              backFLowMessage(msg.id)
              //删除之前的流程
              this.article.show = true
              this.article.form.update = true
              this.loadFiles(row)
            })
          }
        } else {
          this.article.show = true;
          this.article.form.update = true;
          this.loadFiles(row)
        }
      })
      if (row.project) {
        this.article.projects.push(row.project)
      }

    },
    loadFiles(row) {
      this.$refs.editDialog.$nextTick(() => {
        if (this.$refs.fileUpload) {
          this.$refs.fileUpload.loadFiles(row.id)
        }
      })
    },
    deleteArticle(row) {
      this.confirm(`确定删除《${row.title}》？`).then(() => {
        this.loading = true
        deleteArticle(row.id).then(res => {
          if (res.id != null && res.state != -1) {
            this.loadArticleList();
          } else {
            this.message(res.msg)
          }
        }).finally(() => this.loading = false)
      })
    },
    success() {
      this.article.startFlow = false;
    },
    readyEdit2(editInstance) {
      this.folderEditor = editInstance
    },
    readyEdit(editInstance) {
      this.article.editor = editInstance
      if (this.editContent && this.editContentFlag) {
        window.setTimeout(() => {
          this.article.editor.execCommand('cleardoc');
          this.article.editor.execCommand('inserthtml', this.editContent);
        }, 500)
      }
    },
    async fetchFolders(parent) {
      this.parent = parent
      return this.loadFolder(null, parent);
    },
    activeFolder(folder) {
      this.thisFolder = folder[0];
      this.loadArticleList();
      console.log("activeFolder", this.thisFolder)
    },
    loadFolder(parent, parentNode) {
      this.loading = true;
      if (parentNode != null) {
        this.thisFolder = parentNode;
        this.active = [];
        this.active.push(parentNode);
      }

      return getFolder(parent != null ? parent : parentNode.id).then(folders => {
        folders.forEach((folder) => {
          if (folder.childrenNode) {
            folder.children = [];
          } else {
            delete folder['children'];
          }
        })
        if (parentNode != null) {
          if (folders.length <= 0) {
            if (this.thisFolder && this.thisFolder.children) {
              delete this.thisFolder['children'];
            }
          } else {
            this.thisFolder.children = folders;
          }

        } else {
          this.items = folders;
        }
        this.autoOpen();
      }).finally(() => {
        this.loading = false;
      });
    },
    autoOpen() {
      if (this.autoOpenFolder != null) {
        let fs = this.autoOpenFolder.split(';');
        if (fs.length > 0 && fs[0] != "") {
          let f = fs[0];
          this.autoOpenFolder = this.autoOpenFolder.replace(f, "");
          this.autoOpenFolder = this.autoOpenFolder.replace(";", "");

          this.thisFolder = {id: f};
          this.loadFolder(null, this.thisFolder);
        } else {
          if (this.autoOpenFolder.length <= 0) {
            this.openArticle();
            this.autoOpenFolder = null;
          }
        }
      }
    },
    sortBy(name, desc) {
      desc = desc ? 'DESC' : 'ASC';
      switch (name) {
        case 'date':
          name = 'po00910';
          break;
        case 'staff.name':
          name = 'po00908';
          break;
        case 'name':
          name = 'po00904';
          break;
        case 'title':
          name = 'po00906';
          break;
        default:
          name = 'po00910';
          desc = 'DESC';
          break;
      }
      return [name, desc];
    },
    loadArticleList() {
      if (this.thisFolder.id == null) {
        return;
      }
      this.loading = true;
      if (this.articleList.param.isLoadAll) {
        this.articleList.param.staffs = null;
      } else {
        this.articleList.param.staffs = `'${this.$store.state.user.id}'`;
      }
      const {sortBy, sortDesc, page, itemsPerPage} = this.articleList.options
      let sort = this.sortBy(sortBy[0], sortDesc[0]);
      this.articleList.param.sortName = sort[0];
      this.articleList.param.sortOrder = sort[1];
      this.articleList.param.pageSize = itemsPerPage;
      this.articleList.param.pageNumber = page;
      this.articleList.param.folder = this.thisFolder.id;
      getArticle(this.articleList.param).then(res => {
        this.articleList.list = res.rows;
        this.articleList.total = res.total;
      }).finally(() => {
        this.loading = false;
      });
    },
    loadModule() {
      this.loading = true;
      getModuleByFolder(this.thisFolder.moduleId).then(module => {
        let htmlWord = ''
        if (module) {
          htmlWord = module.wordToHtml;
          htmlWord = htmlWord.replace(/0.5px/g, '1px');
        }
        window.setTimeout(() => {
          if (this.article.editor) {
            this.article.editor.execCommand('cleardoc');
            this.article.editor.execCommand('inserthtml', htmlWord);
          }
        }, 1000)
      }).finally(() => {
        this.loading = false;
      })
    },
    openArticle() {
      if (this.thisFolder.id != null) {
        this.reset();
        this.defaultFlowName = this.thisFolder.name
        this.article.form.update = false;
        this.article.show = true;
        this.searchFlow = this.thisFolder.name
        this.loadModule();
      } else {
        this.message("请指定左侧办文目录")
      }
    },
    fileUpload(res) {
      this.article.form.attachs = res.files;
      if (this.article.form.article.id == null) {
        this.article.form.article.id = res.mainId
      }
    },
    reset() {
      this.article.form.article = {
        id: null,
        project: {name: null, id: ''},
        name: null,
        title: null,
        content: '',
        folder: {name: null},
        remark: '',
        useSeal: null
      }

      if (this.$refs.articleForm) {
        this.$refs.articleForm.resetValidation()
        this.$refs.fileUpload.reset()
      }

    },
    addArticle() {
      let valid = this.$refs['articleForm'].validate();
      if (valid) {
        if (this.article.form.flow.id == null && !this.confirmFlag) {
          this.confirmInsert = true
          return;
        }
        this.loading = true;
        let html = this.article.editor.document.getElementsByTagName('html')[0];
        try {
          if (!this.deleteEditorStyle) {
            let list = this.article.editor.document.getElementById("list")
            if (list != null) {
              list.remove();
            }
            html.getElementsByTagName('head')[0].firstChild.remove();
            html.getElementsByTagName('head')[0].firstChild.remove();
            let meta = document.createElement("meta");
            meta.setAttribute("http-equiv", "Content-Type");
            meta.setAttribute("content", "text/html;charset=utf-8");
            html.getElementsByTagName("head")[0].appendChild(meta);
            this.deleteEditorStyle = true;
          }
        } catch (e) {
          console.log(e);
        }

        this.article.form.article.content = html.innerHTML.replace(/\u200B/g, "");
        this.article.form.article.folder = this.thisFolder;
        let files = [];
        this.article.form.attachs.forEach(item => {
          files.push(item.id);
        })
        if (this.article.form.update) {
          updateArticle({
            article: this.article.form.article,
            attachs: files
          }).then(this.addSuccess).finally(() => {
            this.loading = false;
          });
        } else {
          addArticle({
            article: this.article.form.article,
            attachs: files
          }).then(this.addSuccess).catch((e) => {
            console.log("异常信息", e);
          }).finally(() => {
            this.loading = false;
          });
        }
      }

    },
    addSuccess(res) {
      this.confirmInsert = false
      this.confirmFlag = false
      if (res.id != null) {
        //添加成功
        this.loadArticleList();
        this.article.show = false;
        //发起流程
        if (this.article.form.flow.id != null) {
          let remark = this.article.form.article.remark;
          this.article.flowModel.message = {
            title: this.article.form.article.name,
            content: remark == null ? "" : remark,
            frameCoding: 15203,
            frameId: res.id,
            frameColumn: "po00901"
          }
          this.article.startFlow = true;
        } else {
          console.log("this.article.form.flow", this.article.form.flow);
        }
      }
    },
  }
}
</script>

<style>

</style>