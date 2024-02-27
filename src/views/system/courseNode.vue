<template>
  <div class="grid-node pl-1 pr-1 pt-1"
       @mouseover="mouseover"
       @mouseout="mouseout">
    <p v-if="judge != null" class="judge-info">{{judge.name}}</p>
    <p class="mb-0 blue--text text--darken-3">{{ itemData.serial + itemData.label }}</p>
    <p v-bind:style="{maxWidth:maxWidth+'px',width:maxWidth+'px'}"
       class="course-person">
      <template v-for="(item) in personList">
            <span class="black--text text--darken-3"
                  style="font-size: 14px"
                  v-if="item.type == 0"
                  :key="item.id">{{ item.persons }}</span>
        <span class="grey--text"
              style="font-size: 14px"
              v-else-if="!flag"
              :key="item.id">{{ item.persons }}</span>

      </template>
    </p>
  </div>
</template>

<script>

export default {
  name: "gridNode",
  data: () => ({
    personList: [],
    hoverNode: null,
    personsLength: 10,
    maxWidth: 0,
    //是否没有审批人，如果没有，则显示知会人
    flag: false,
    approveLength: 0,
    judge:null,
  }),
  props: {
    itemData: {
      type: Object,
    },
    canvasNode: {
      type: Object
    }
  },
  methods: {
    formatPersons(persons) {
      /*console.log("persons",persons,this.personsLength,this.itemData.label)
      let str = ""
      if (persons.length > 10) {
          str = persons.substr(0, this.personsLength) + '.'
          this.personsLength = 0
      } else if (persons.length > this.personsLength) {
          str = persons.substr(0, this.personsLength)
      } else {
          this.personsLength -= persons.length
          str = persons
      }
      console.log(this.itemData.label,str)*/
      this.approveLength--
      if (this.approveLength <= 0) {
        return persons
      } else {
        return persons + ","
      }
    },
    loadPersons() {
      this.maxWidth = this.itemData.label.length * 16
      let flag = false
      this.approveLength = 0
      let temp = []
      this.itemData.data.personList.forEach(item => {
        if (item.type == 0) {
          flag = true
          this.approveLength++
        }
        temp.push(item)
      })
      this.personList.forEach(item=>{
        this.formatPersons(item.persons)
      })
      this.flag = flag
      this.personList = temp
    },
    mouseover() {
      this.hoverNode = this.$el.parentElement
      this.$emit("nodeMouseover", this.hoverNode, this.itemData)
    },
    mouseout() {
      this.hoverNode = this.$el.parentElement
      this.$emit("nodeMouseout", this.hoverNode, this.itemData)
    },
  },
  created() {
    if(this.itemData.data && this.itemData.data.judgeList){
      this.judge = this.itemData.data.judgeList[0]
    }
    this.loadPersons()
  },
};
</script>

<style>
.grid-node {
  height: 42px;
  line-height: 1.0;
  overflow: hidden;
  text-align: center;
  border: 2px solid #000000;;
  background-color: #FFF;
}

.course-person {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.judge-info{
  position: absolute;
  top: -10px;
  font-size: 10px;
  color: red;
}

</style>