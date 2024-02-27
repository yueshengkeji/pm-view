<template>
    <div>
        <v-data-table :items="items" :headers="headers" :search="search">
            <template v-slot:top>
                <v-row dense>
                    <v-col md="2" cols="6">
                        <v-menu v-model="menu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                ref="menu"
                                min-width="auto">
                            <template v-slot:activator="{on,attrs}">
                                <v-text-field v-model="param.startDate" v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="param.startDate" @change="$refs.menu.save()">

                            </v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col md="2" cols="6">
                        <v-menu v-model="menu2"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                ref="menu2"
                                min-width="auto">
                            <template v-slot:activator="{on,attrs}">
                                <v-text-field v-model="param.endDate" v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="param.endDate" @change="$refs.menu2.save()">

                            </v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" label="搜索"></v-text-field>
                </v-row>
            </template>
            <template v-slot:item.action="{item}">
                <v-btn x-small @click="initDetailHeader(item)">初始化</v-btn>
                <v-btn x-small @click="genProDetailHeader(item)">生成采购账单</v-btn>
                <v-btn x-small @click="genPutDetailHeader(item)">生成入库账单</v-btn>
            </template>
        </v-data-table>
    </div>
</template>

<script>
    import {genProDetail, genPutDetail, initProDetail, noDetailList} from '@/api/put'

    export default {
        name: "checkList",
        data:()=>({
            headers:[
                {text:'入库单编号',value:'putSerial'},
                {text:'供应单位',value:'company.name'},
                {text:'采购订单信息',value:'proId'},
                {text:'操作',value:'action'},
            ],
            items:[],
            param:{
                startDate:'',
                endDate:''
            },
            menu:false,
            menu2:false,
            search:''
        }),
        watch:{
          param:{
              handler(){
                  this.list()
              },
              deep:true
          }
        },
        created() {
            this.param.startDate = this.formatTimer(new Date())
            this.param.endDate = this.formatTimer(new Date())
        },
        methods:{
            list(){
                noDetailList(this.param).then(result=>{
                    this.items = result
                })
            },
            initDetailHeader(item){
                initProDetail(item.procurement.id)
            },
            genProDetailHeader(item){
                genProDetail(item.procurement.id,item.id)
            },
            genPutDetailHeader(item){
                genPutDetail(item.id)
            }
        }
    }
</script>

<style scoped>

</style>