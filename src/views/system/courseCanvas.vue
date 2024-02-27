<template>
  <div @contextmenu="show">
    <butterfly-vue ref="butterflyVue"
                   @nodeMouseover="nodeMouseover"
                   @nodeMouseout="nodeMouseout"
                   @onLoaded="createMenu"
                   @onOtherEvent="otherEvent"
                   :canvasConf="config"
                   :canvasData="mockData"></butterfly-vue>
    <v-menu v-model="showMenu"
            ref="menu"
            absolute
            offset-y
            :position-x="x"
            :position-y="y"
            :close-delay="2000"
    >
      <v-list>
        <v-list-item link @click="insertHeader">
          <v-list-item-title>添加</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="updateHeader">
          <v-list-item-title>修改</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="deleteHeader">
          <v-list-item-title>删除</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="exportJson" :disabled="!this.flowId">
          <v-list-item-title>导出</v-list-item-title>
        </v-list-item>
        <v-list-item link @click="$refs.jsonFile.click()" :disabled="!this.flowId">
          <v-list-item-title>导入</v-list-item-title>
          <input @change="readJsonFile"
                 v-show="false"
                 type="file"
                 multiple="false"
                 ref="jsonFile"
                 style="opacity: 0;position: fixed"/>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog v-model="editDialog" width="70%">
      <v-card class="pa-5">
        <edit-course :node="node" :parentNode="parentNodes"></edit-course>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveCourse" :loading="loading">保存</v-btn>
          <v-btn @click="editDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar color="error" v-model="msgFlag">{{ msg }}</v-snackbar>
  </div>
</template>

<script>
import {ButterflyVue} from 'butterfly-vue'
import editCourse from './editCourse'
import {deleteCourse, insertCourse, updateCourse} from '@/api/course'

export default {
  name: "courseCanvas",
  components: {
    ButterflyVue,
    editCourse,
  },
  data: () => ({
    loading: false,
    x: 0,
    y: 0,
    showMenu: false,
    config: {
      disLinkable: false, // 可删除连线
      linkable: true,    // 可连线
      draggable: true,   // 可拖动
      zoomable: true,    // 可放大
      moveable: true,    // 可平移
      theme: {
        edge: {
          type: 'endpoint',
          shapeType: 'Manhattan', //
          arrow: true,
          arrowPosition: 0.7,
          arrowOffset: 0,
          isExpandWidth: true,//增加线条交互区域
          defaultAnimate: false,//默认开启线条动画
          label: 'test2',
          // labelPosition: 0.5,
        }
      }
    },
    node: null,
    parentNodes: [],
    editDialog: false,

    msg: null,
    msgFlag: false
  }),
  props: {
    mockData: Object,
    flowId: String,
  },
  watch: {
    mockData: {
      handler() {

      },
      deep: true,
    }
  },
  created() {
    this.$nextTick(() => {

    })
  },
  methods: {
    readJsonFile(e) {
      let reader = new FileReader()
      let than = this
      let importData = []
      let map = []
      let importNewData = []
      reader.onload = function (e) {
        importData = JSON.parse(e.target.result)
        let tempCount = 0
        importData.forEach(item => {
          let d = Object.assign({}, item)
          d.id = than.uuid()
          d.flowId = than.flowId
          if (d.fcr) {
            d.fcr.nextCourseId = d.id
            d.fcr.currentId = map[d.fcr.currentId].newId
            d.id = than.uuid()
          }
          item.newId = d.id
          if (d.personList) {
            d.personList.forEach(item => {
              item.courseId = d.id
              item.flowId = than.flowId
              item.id = than.uuid()
            })
          }
          if (d.judgeList) {
            d.judgeList.forEach(item => {
              item.id = "-1"
              item.courseId = d.id
            })
          }
          map[item.id] = item
          importNewData.push(d)
          insertCourse(d).then(() => tempCount++).then(() => {
            if (importNewData.length == tempCount) {
              than.$emit("importSuccess")
            }
          })
        })
      }
      let file = e.target.files[0]
      reader.readAsText(file)
    },
    exportJson() {
      let exportData = [];
      this.mockData.nodes.forEach(item => {
        exportData.push(item.data)
      })
      this.downloadText(exportData, this.flowId + ".json")
    },
    downloadText(data, filename) {
      if (typeof data === 'object') {
        data = JSON.stringify(data, null, 4);
      }
      // 导出数据
      const blob = new Blob([data], {type: 'text/json'}),
          e = new MouseEvent('click'),
          a = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      a.dispatchEvent(e);
    },
    saveCourse() {
      this.loading = true
      this.node.po02005 = this.node.po02005 ? 1 : 0
      this.node.pubPerson = this.node.pubPerson ? 1 : 0
      let axios;
      if (this.node.id == null) {
        axios = insertCourse(this.node)
      } else {
        axios = updateCourse(this.node)
      }
      axios.then(result => {
        this.editDialog = false
        this.$emit("update", result)
      }).finally(() => this.loading = false)
    },
    updateHeader() {
      this.setParentNodes()
      this.editDialog = true
    },
    insertHeader() {
      let parentId = this.node ? this.node.id : ''
      this.node = {
        flowId: this.flowId,
        serial: this.mockData.nodes.length,
        name: '',
        po02005: false,
        pubPerson: false,
        po02019: '',
        personList: [],
        judgeList: [],
        parentId: parentId,
        fcr: {
          id: '',
          nextCourseId: null,
          currentId: parentId,
        },
        invokeName: null
      }
      this.setParentNodes()
      this.editDialog = true
    },
    deleteHeader() {
      deleteCourse(this.node.id).then(result => this.$emit("delete", result)).catch(e => {
        this.msg = e
        this.msgFlag = true
      })
    },
    setParentNodes() {
      this.parentNodes = []
      this.mockData.nodes.forEach(item => {
        this.parentNodes.push(item.data)
      })
    },
    nodeMouseout() {
      window.setTimeout(() => {
        if (!this.showMenu) {
          this.reset()
        }
      }, 150)
    },
    nodeMouseover(nodeElement, nodeData) {
      window.setTimeout(() => {
        if (!this.showMenu) {
          this.node = nodeData.data
        }
      }, 200)
    },
    show(e) {
      if (e.target.className == "butterfly-wrapper") {
        this.reset()
      }
      e.preventDefault()
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    otherEvent() {

    },
    createMenu(data) {
      console.log("create data", data)
    },
    redraw(newData) {
      this.$refs.butterflyVue.canvas.redraw(newData, (result) => {
        console.log("newData", newData, result)
      });
    },
    reset() {
      console.log("reset")
      this.node = {
        flowId: this.flowId,
        serial: this.mockData.nodes.length,
        name: '',
        po02005: false,
        pubPerson: false,
        po02019: '',
        personList: [],
        judgeList: [],
        parentId: null,
        fcr: {
          id: '',
          nextCourseId: null,
          currentId: null,
        }
      }
      this.parentNodes = []
    }
  }
}
</script>

<style>
.butterflies-link {
  stroke: #000000;
}

.butterflies-arrow {
  fill: #000000;
  stroke: #000000;
  stroke-width: 2px;
}
</style>