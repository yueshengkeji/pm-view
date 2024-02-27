<template>
    <div>
        <v-form>
            <v-row>
                <v-col lg="3" md="3">
                    <v-text-field v-model="put.company.name" label="供应商"></v-text-field>
                </v-col>
                <v-col lg="3" md="3">
                    <v-text-field v-model="put.procurement.pmNumber" label="采购订单号"></v-text-field>
                </v-col>
                <v-col lg="3" md="3">
                    <v-text-field v-model="put.putSerial" label="入库单号"></v-text-field>
                </v-col>
                <v-col lg="3" md="3">
                    <v-text-field v-model="put.remark" label="备注"></v-text-field>
                </v-col>
                <v-col lg="3" md="3">
                    <v-text-field v-model="put.tax" label="税率"></v-text-field>
                </v-col>
                <v-col lg="3" md="3">
                    <v-text-field v-model="put.putDate" label="入库日期"></v-text-field>
                </v-col>
                <v-col lg="3" md="3">
                    <v-text-field label="优惠金额合计" v-model="put.saleMoney"></v-text-field>
                </v-col>
                <v-col lg="3" md="3">
                    <v-text-field label="总金额" v-model="put.moneys"></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-data-table :items="items" :headers="headers" :items-per-page="2000"
                                  hide-default-footer>
                        <template v-slot:item.taxPrice="{item}">
                            {{item.taxPrice.toFixed(2)}}
                        </template>
                        <template v-slot:item.moneyTax="{item}">
                            {{item.moneyTax.toFixed(2)}}
                        </template>
                        <template v-slot:item.taxMoney="{item}">
                            {{item.taxMoney.toFixed(2)}}
                        </template>
                    </v-data-table>
                </v-col>

            </v-row>
        </v-form>
    </div>
</template>

<script>
    import {loadById} from '@/api/put'
    import {getById} from '@/api/material'

    export default {
        name: "frame-15323",
        data: () => ({
            items: [],
            headers: [
                {text: '序号', value: 'index'},
                {text: '材料编码', value: 'material.id',width:'15%'},
                {text: '材料名称', value: 'material.name',width:'15%'},
                {text: '型号', value: 'material.model',width:'15%'},
                {text: '品牌', value: 'material.brand'},
                {text: '单位', value: 'material.unit.name'},
                {text: '入库数量', value: 'putSum'},
                {text: '单价', value: 'taxPrice'},
                {text: '金额', value: 'moneyTax'},
                {text: '税额', value: 'taxMoney'},
                {text: '项目', value: 'project.name',width:'10%'},
            ],
            put: {
                company: {name: null},
                procurement: {pmNumber: null},
                putSerial: null,
                remark: null,
                tax: null,
                putDate: null,
                saleMoney: null,
                moneys: 0,
            },
        }),
        props: {
            frameId: null,
            data: null,
        },
        created() {
            if (this.data != null) {

                this.put = this.data;

                this.items = this.put.materialList;

                this.loadMaterial();
            }

        },
        watch: {
            frameId: {

                handler() {

                    if (this.frameId != null) {

                        this.loadData();

                    }
                },

                deep: true,
            },
            data: {
                handler() {

                    if (this.data != null) {

                        this.put = this.data;

                        this.items = this.put.materialList;

                        this.loadMaterial();

                    }

                },

                deep: false,
            }
        },
        methods: {
            loadData() {
                loadById(this.frameId).then(res => {
                    this.put = res;
                })
            },
            loadMaterial(){
                let materialMap = [];
                this.put.moneys = 0;
                this.items.forEach((item,index)=>{
                    item.index = ++index;
                    materialMap[item.material.id] = item.material;
                    getById(item.material.id).then(material=>{
                        materialMap[material.id].name = material.name;
                        materialMap[material.id].model = material.model;
                        materialMap[material.id].unit = material.unit;
                        materialMap[material.id].brand = material.brand;
                    });
                    this.put.moneys += item.moneyTax;
                })
                this.put.moneys = this.put.moneys.toFixed(2);
            }
        }
    }
</script>

<style scoped>

</style>