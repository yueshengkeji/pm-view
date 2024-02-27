<template>
  <course-canvas ref="courseManager"
                 @update="loadCourse"
                 @delete="loadCourse"
                 @importSuccess="loadCourse"
                 :flowId="flowId"
                 :mock-data="mockData"></course-canvas>
</template>

<script>
import courseCanvas from './courseCanvas'
import courseNode from './courseNode'

import {loadCourseList} from '@/api/course'

export default {
  name: "courseManager",
  components: {
    courseCanvas
  },
  props: {
    //流程id
    flowId: null,
    //隐藏序号
    hideSeries: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    width: 0,
    height: 0,

    nodeLinkMap: [],
    nodeDataMap: [],

    canvas: null,
    mockData: {
      groups: [],
      nodes: [],
      edges: [],
    },
    pointMap: null,
  }),
  watch: {
    flowId: {
      handler() {
        if (this.flowId != null) {
          this.loadCourse()
        }
      }
    }
  },
  created() {

  },
  methods: {
    reset() {
      this.mockData.nodes.splice(0, this.mockData.nodes.length)
      this.mockData.edges.splice(0, this.mockData.edges.length)
      this.mockData.groups.splice(0, this.mockData.groups.length)
      this.nodeDataMap = []
      this.nodeLinkMap = []
      this.pointMap = []
    },
    loadCourse() {
      this.width = this.$refs['courseManager'].$el.clientWidth
      this.height = this.$refs['courseManager'].$el.clientHeight
      this.reset();
      loadCourseList(this.flowId).then(result => {
        this.toNodeData(result)
      })
    },
    toNodeData(courseList) {
      let data = {
        nodes: [],
        edges: [],
      }
      //父节点
      courseList.forEach((val) => {
        if (val.fcr == null) {
          //节点数据
          let nodeData = this.nodeDataParse(val);

          this.mockData.nodes.push(nodeData)
          this.nodeDataMap[val.id] = val
        }
      });
      //    子节点
      for (let i = 0; i < courseList.length; i++) {
        courseList.forEach((val) => {
          if (val.fcr != null
              && this.nodeDataMap[val.fcr.currentId] != null
              && this.nodeDataMap[val.id] == null) {
            //节点数据
            let nodeData = this.nodeDataParse(val);

            this.mockData.nodes.push(nodeData)
            data.nodes.push(nodeData)
            //节点线
            let linkData = this.linkDataParse(val)
            data.edges.push(linkData)
            this.mockData.edges.push(linkData)
            this.nodeDataMap[val.id] = val
          }/*else if(val.fcr != null && this.nodeDataMap[val.fcr.currentId] == null && this.nodeDataMap[val.id] == null){
                            console.log("未找到父节点,添加到根节点上，便于显示",val)
                            let nodeData = this.nodeDataParse(val);
                            nodeData.label = `异常节点：${nodeData.label}`
                            this.mockData.nodes.push(nodeData)
                            this.nodeDataMap[val.id] = val
                        }*/

        });
      }

      //异常节点
      for (let i = 0; i < courseList.length; i++) {
        courseList.forEach((val) => {
          if (val.fcr != null && this.nodeDataMap[val.fcr.currentId] == null && this.nodeDataMap[val.id] == null) {
            console.log("未找到父节点,添加到根节点上，便于显示", val)
            let nodeData = this.nodeDataParse(val);
            nodeData.label = `异常节点：${nodeData.label}`
            this.mockData.nodes.push(nodeData)
            this.nodeDataMap[val.id] = val
          }
        })
      }
    },
    linkDataParse(course) {
      let parentPointer = this.nodeLinkMap[course.fcr.currentId]
      let thanPointer = this.nodeLinkMap[course.id]
      let lineName = this.getLineName(course)
      if (parentPointer != null &&
          (parentPointer.left > thanPointer.left)) {
        //换行
        return {
          arrowPosition:0.9,
          id: course.id,
          targetNode: course.id,
          sourceNode: course.fcr.currentId,
          arrow: true,
          type: 'endpoint',
          source: 'bottom',
          target: 'top',
          color: 'black',
          render: `<p style="font-size: 10px" class="mt-1">${lineName}</p>`,
        }
      } else {
        return {
          arrowPosition:0.9,
          id: course.id,
          targetNode: course.id,
          sourceNode: course.fcr.currentId,
          arrow: true,
          type: 'endpoint',
          source: 'right',
          target: 'left',
          color: 'black',
          render: `<p style="font-size: 10px" class="mt-1">${lineName}</p>`,
        }
      }

    },
    nodeDataParse(course) {
      let parent;
      if (course.fcr != null && this.nodeDataMap[course.fcr.currentId] != null) {
        parent = this.nodeLinkMap[course.fcr.currentId]
      } else {
        parent = {left: 10, top: 10}
      }
      let thanPointer = this.calculatePointer(parent);
      /*if (parent.label != null) {
          console.log("父元素", parent.label, parent.left, parent.top)
          console.log("子元素", course.name, thanPointer.left, thanPointer.top)
      }*/
      let resultData = {
        id: course.id,
        left: thanPointer.left,
        top: thanPointer.top,
        render: courseNode,
        label: course.name,
        data: course,
        endpoints: [
          {
            id: 'right',
            orientation: [1, 0],
            pos: [0, 0.5]
          }, {
            id: 'left',
            orientation: [-1, 0],
            pos: [0, 0.5]
          }, {
            id: 'top',
            orientation: [0, -1],
            pos: [0.5, 0]
          }, {
            id: 'bottom',
            orientation: [0, 1],
            pos: [0.5, 0]
          }
        ],
        serial: this.hideSeries ? '' : course.serial
      }
      this.nodeLinkMap[course.id] = resultData
      return resultData;
    },
    calculatePointer(point) {
      let temp = this.pointMap[point.left + ',' + point.top];
      if (temp == null) {
        this.pointMap[point.left + ',' + point.top] = point
        return point;
      } else {
        let offsetLeft = 0;
        if (point.label == null) {
          offsetLeft = 150
        } else {
          offsetLeft = point.label.length * 16 + 90;
        }

        let result = {left: point.left, top: point.top, calculateCount: !!point.calculateCount || 0}
        if (point.left === temp.left && point.top === temp.top) {
          if (result.calculateCount % 2 === 1) {
            result.calculateCount += 1
            result.top += 100
          } else {
            result.calculateCount += 1
            //left位置偏移
            result.left += offsetLeft
          }
        } else if (point.left === temp.left) {
          result.top += 100
        } else if (point.top === temp.top) {
          result.left += offsetLeft
        }
        if (result.left + offsetLeft >= this.width) {
          //超过画布宽度，自动换行
          result.left = 10
          result.top += 100
          result.calculateCount = 0
        }
        return this.calculatePointer(result);
      }
    },
    getLineName(course) {
      if(course.pubPerson == 1){
        return '审批时指定'
      }else{
        return ''
      }
    }
  }
}
</script>

<style scoped>

</style>