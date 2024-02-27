<template>
    <div class="pa-3">
        <v-row>
            <v-col lg="4" md="4" cols="12">
                <v-text-field readonly v-model="expense.project" label="项目"></v-text-field>
            </v-col>
          <v-col lg="4" md="4" cols="12">
            <v-text-field readonly v-model="expense.applyDate" label="申请日期"></v-text-field>
          </v-col>
          <v-col lg="4" md="4" cols="12">
            <v-text-field readonly v-model="expense.totalMoney" label="费用"></v-text-field>
          </v-col>
          <v-col lg="4" md="4" cols="12">
            <v-text-field readonly v-model="expense.staff.name" label="申请人"></v-text-field>
          </v-col>
          <v-col lg="4" md="4" cols="12">
            <v-text-field readonly v-model="expense.staff.openBlank" label="收款开户行"></v-text-field>
          </v-col>
          <v-col lg="4" md="4" cols="12">
            <v-text-field readonly v-model="expense.staff.bankNumber" label="收款银行账号"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field readonly v-model="expense.remark" label="备注"></v-text-field>
            </v-col>
        </v-row>
        <v-data-table
                hide-default-footer
                :headers="headers"
                :items="expense.expenseSubjects"
                class="elevation-1">

        </v-data-table>
    </div>

</template>
<script>
    import {selectById} from "../api/expense";

    export default {
        name:'1320284',
        props:{
            frameId: String,
        },
        data:() => ({
            expense: {project: null,
                projectId: null,
                totalMoney: null,
                applyDate: null,
                remark: null,
                staff:{
                name:null
                },
                expenseFiles: [],
                expenseSubjects: []},
            headers: [
                {text: '科目名称', value: 'course.name', sortable: false},
                {text: '费用金额', value: 'money', sortable: false, with: '20%'},
                {text: '备注', value: 'remark', sortable: false},
            ],
            desserts:[],
        }),

        watch:{
            frameId: {
                handler() {
                    this.reset();
                    if (this.frameId != null){
                        this.load()
                    }
                },
                deep: true,
            },
        },
        created() {
            if (this.frameId != null){
                this.load()
            }
        },

        methods:{
            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },
            load(){
                selectById({id:this.frameId}).then(res => {
                    res.applyDate = this.formatTimer(res.applyDate)
                    this.expense = res
                })
            },

            reset(){
                this.expense = {
                    project: null,
                    projectId: null,
                    totalMoney: null,
                    applyDate: null,
                    remark: null,
                    expenseFiles: [],
                    expenseSubjects: [],
                    staff:{
                        name:null
                    },
                }
            }
        }
    }
</script>
