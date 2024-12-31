<template>
  <div>
      <v-data-table
              :headers="headers"
              :items="desserts"
              :items-per-page="12"
              class="elevation-1"
              hide-default-footer
      >
          <template v-slot:top>
              <v-toolbar
                      flat
              >
                  <v-toolbar-title><span style="font-weight: bold;font-size: 20px">{{ searchYear }}</span>年招商数据分析月报表
                  </v-toolbar-title>
                  <v-divider
                          class="mx-4"
                          inset
                          vertical
                  ></v-divider>
                  <v-spacer></v-spacer>
                  <v-col cols="6"
                         md="3">
                      <v-combobox
                              v-model="searchYear"
                              :items="yearItems"
                              label="选择年份"
                              aria-required="true"
                              oninput="value=value.replace(/[^\d]/g,'')"
                              @change="load"
                      ></v-combobox>
                  </v-col>
              </v-toolbar>
          </template>

      </v-data-table>
  </div>
</template>
<script>

    import {zjHouseReport} from "@/api/zjReport";

    export default {
      name:'houseReport',
      data:() => ({
          headers: [
              {text: '月份', value: 'date'},
              {text: '当月出租数', value: 'hiredTotal'},
              {text: '商铺总数', value: 'zjHouseTotal'},
              {text: '出租率(%)', value: 'hiredRate'},
              {text: '空置率(%)', value: 'vacancyRate'},
              {text: '开业率(%)', value: 'openingRate'},
          ],
          desserts: [],
          searchYear: '',
          yearItems: [],
          dateNow: '',
      }),

      created() {
          this.init()
      },

      methods:{
          init() {
              var nowYear = new Date().getFullYear()
              this.searchYear = nowYear + ''
              for (let i = 0; i < 20; i++) {
                  this.yearItems.push(nowYear - i)
              }
              this.load()
          },
          load(){
              zjHouseReport({year:this.searchYear}).then(res => {
                  this.desserts = res
              })
          }
      }
  }
</script>