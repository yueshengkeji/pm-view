<template>
    <div>
        <v-data-table :headers="headers"
                      :items-per-page="query.itemsPerPage"
                      sort-desc
                      sort-by="pm01410"
                      :server-items-length="total"
                      :options.sync="options"
                      @click:row="edit"
                      :loading="loading"
                      :items="items">
            <template v-slot:top>
                <v-row>
                    <v-col md="2" cols="12">
                        <v-autocomplete label="指定项目"
                                        :items.sync="projectList"
                                        item-value="id"
                                        clearable
                                        @click:clear="clearProject"
                                        item-text="name"
                                        :search-input.sync="searchProject"
                                        v-model="options.projectId"></v-autocomplete>
                    </v-col>
                    <v-col md="2" cols="12">
                        <v-text-field label="搜索" @keyup.enter="list" v-model="options.searchText"></v-text-field>
                    </v-col>

                    <v-col md="2" cols="12">
                        <v-menu ref="menu"
                                v-model="menu"
                                transition="scale-transition"
                                :close-on-content-click="false"
                                offset-y
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                        v-model="date"
                                        label="指定开始/截止日期"
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                    v-model="date"
                                    range
                                    @change="changeDate"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                </v-row>
            </template>

        </v-data-table>
        <v-snackbar v-model="showMsg" centered color="waring">{{msg}}
            <template v-slot:action>
                <v-btn small @click="showMsg = false">确定</v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
    import {noDhList} from '@/api/procurement'
    import {getById, search} from '@/api/project'

    export default {
        name: "report",
        data: () => ({
            query: {

            },
            loading: false,
            total: 0,
            menu: false,
            items: [],
            headers: [
                {text: '项目', value: 'project.name', width: '20%',sortable:false},
                {text: '材料', value: 'material.name', width: '15%',sortable:false},
                {text: '规格', value: 'material.model', width: '15%',sortable:false},
                {text: '品牌', value: 'material.brand',sortable:false},
                {text: '采购数量', value: 'sum',sortable:false},
                {text: '采购员', value: 'p.staff.name', width: '10%',sortable:false},
                {text: '到货日期', value: 'dhDate',sortable:false},
            ],
            date: null,

            msg: ``,
            showMsg: false,
            options: {
                searchText: null,
                companyName: null,
                projectId: null,
                staffName: null,
                dhStartDate: null,
                dhEndDate: null,
                itemPerPage: 10,
            },
            projectList:[],
            searchProject:null,
        }),
        created() {
            this.options.projectId = this.$route.params.projectId
            this.options.dhStartDate = this.dateFormat(new Date(), 'YYYY-mm-dd');
            this.options.dhEndDate = this.dateAfter(3);
            this.date = []
            this.date.push(this.options.dhStartDate)
            this.date.push(this.options.dhEndDate)

            if(this.options.projectId != null){
                getById(this.options.projectId).then(result=>{
                    this.projectList.push(result)
                })
            }
        },
        watch: {
            options: {
                handler() {
                    this.list();
                }
            },
            searchProject(value){
                search(value).then(result=>{
                    this.projectList = result
                })
            }
        },
        methods: {
            clearProject(){
                this.options.projectId = null
                this.list()
            },
            edit(row, param) {
                param.expand(!param.isExpanded);
            },
            changeDate() {
                // this.query.dhDate = this.date
                if (this.date.length > 0) {
                    let date1 = this.date[0];
                    let date2 = this.date[1];
                    if (date1 <= date2) {
                        this.options.dhStartDate = date1;
                        this.options.dhEndDate = date2;
                    } else {
                        this.options.dhStartDate = date2;
                        this.options.dhEndDate = date1;
                    }
                    this.menu = false;
                    this.list();
                } else {
                    this.options.dhStartDate = null;
                    this.options.dhEndDate = null;
                }

            },
            changePutState() {
                this.list();
            },
            list() {
                this.loading = true;
                this.query = Object.assign({}, this.options)
                this.query.sortBy = this.query.sortBy[0]
                this.query.sortDesc = this.query.sortDesc[0]
                noDhList(this.query).then(data => {
                    this.items = data.rows;
                    this.total = data.total;
                }).finally(() => {
                    this.loading = false;
                })
            },
        }
    }
</script>

<style scoped>

</style>