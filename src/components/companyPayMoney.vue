<template>
    <v-card>
        <v-data-table :loading="loading"
                      :headers="headers"
                      :items="items"
                      :search="search"
                      sort-desc
                      sort-by="cname">
            <template v-slot:top>
                <v-container>
                    <v-row justify="20">
                        <v-col cols="3">
                            <v-text-field type="number" label="数据年份" v-model="year" @change="loadData()"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field
                                    v-model="search"
                                    append-icon="mdi-magnify"
                                    label="Search"
                                    single-line
                                    hide-details
                            ></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <div v-text="items.length+'家单位待付'"></div>
                        </v-col>
                    </v-row>
                </v-container>

            </template>
        </v-data-table>
        <v-snackbar v-model="msgShow">{{msg}}</v-snackbar>
    </v-card>
</template>

<script>
    import {getPayMoneyByCompany} from '@/api/payment'

    export default {
        name: "companyPayMoney",
        data: () => ({
            search:'',
            msgShow:false,
            msg:"",
            year: new Date().getFullYear(),
            loading: false,
            headers: [
                {text: '单位名称', value: 'cname', width: '60%'},
                {text: '本年已付', value: 'ytMoney', width: '20%'},
                {text: '待付', value: 'money', width: '20%'},
            ],
            items: [],
        }),
        created() {
            this.loadData()
        },
        methods: {
            loadData() {
                if((this.year+"").length == 4){
                    this.loading = true
                    getPayMoneyByCompany(this.year).then(data => {
                        this.items = data;
                        this.loading = false
                    })
                }else{
                    this.msg = "请输入正确的年份"
                    this.msgShow = true
                }

            }
        }
    }
</script>

<style scoped>

</style>