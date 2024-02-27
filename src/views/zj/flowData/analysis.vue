<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-radio-group row v-model="dataType" @change="loadData">
          <v-radio :value="0" label="车流量"></v-radio>
          <v-radio :value="1" label="客流量"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="12">
        <div id="main" style="height: 600px;width: 100%;pointer-events: auto"></div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import {LineChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer
]);
import {moneyTotal} from '@/api/flowCount'

export default {
  name: "flowCountAnalysis",
  data: () => ({
    options: {
      title: {
        text: '客流数据分析'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['本月', '上月']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '本月',
          type: 'line',
          stack: 'Total',
          data: []
        },
        {
          name: '上月',
          type: 'line',
          stack: 'Total',
          data: []
        }
      ]
    },
    day: null,
    myChart: null,
    dataType: 0,
  }),
  created() {
    this.loadData()
  },
  methods: {
    init() {
      if (this.myChart) {
        this.myChart.setOption(this.options)
      } else {
        let chartDom = document.getElementById('main');
        this.myChart = echarts.init(chartDom);
        this.myChart.setOption(this.options);
      }
    },
    loadData() {
      this.setXAxis()
      // 本期数值 - 上期数值）/ 上期数值 * 100
      moneyTotal(this.day).then(result => {
        let thanMoney = 0, prevMoney = 0, title = ""
        if (result.thanGroupModels) {
          result.thanGroupModels.forEach(item => {
            try {
              let d = parseInt(item.date.substring(8, 10))
              if (this.dataType == 1) {
                this.options.series[0].data[d - 1] = item.money2
                thanMoney += item.money2
              } else {
                this.options.series[0].data[d - 1] = item.money
                thanMoney += item.money
              }
            } catch (e) {
              console.log(e)
            }
          })
        }

        if (result.prevGroupModels) {
          result.prevGroupModels.forEach(item => {
            try {
              let d = parseInt(item.date.substring(8, 10))
              if (this.dataType == 1) {
                this.options.series[1].data[d - 1] = item.money2
                prevMoney += item.money2
              } else {
                this.options.series[1].data[d - 1] = item.money
                prevMoney += item.money
              }
            } catch (e) {
              console.log(e)
            }
          })
        }

        if (prevMoney != 0) {
          title = ((thanMoney - prevMoney) / prevMoney * 100).toFixed(2)
        } else {
          title = 100
        }
        this.options.title.text = "环比增长：" + title + "%,本月合计:" + thanMoney + ";上月合计：" + prevMoney
        // this.options.legend.data[0] = "本月："+thanMoney
        // this.options.legend.data[1] = "上月："+prevMoney
        this.init()
      })
    },
    setXAxis(day) {
      //获取当天日期天数
      this.day = day || new Date().getDate();
      let than = this
      than.options.xAxis.data = []
      than.options.series[0].data = []
      than.options.series[1].data = []
      for (let i = 1; i <= this.day; i++) {
        than.options.xAxis.data.push(i)
        than.options.series[0].data.push(0)
        than.options.series[1].data.push(0)
      }
    }
  }
}
</script>

<style scoped>

</style>