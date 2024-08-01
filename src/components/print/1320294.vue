<template>
    <div>
        <v-row>
            <v-col cols="12" md="3" sm="3" xs="3">
                <v-text-field v-model="loanItem.staff.name" label="借款人" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="3" xs="3">
                <v-text-field v-model="loanItem.staff.section.name" label="部门" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="3" xs="3">
                <v-text-field v-model="loanItem.staff.openBlank" label="开户行" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="3" sm="3" xs="3">
                <v-text-field v-model="loanItem.staff.bankNumber" label="账号" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="4" xs="4">
                <v-text-field v-model="loanItem.lendMoney" label="借款金额" type="number" readonly
                              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="4" xs="4">
                <v-text-field hide-details v-model="loanItem.lendDate" readonly label="借款日期"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="loanItem.remark" label="借款原因" readonly></v-text-field>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import {selectById} from "../api/loan";

    export default {
        name:'1320294',
        props: {
            frameId: String,
        },
        data:() => ({
            loanItem:{
                staff:{
                    name:null,
                    section:{
                        name:null
                    },
                    openBlank:null,
                    bankNumber:null,
                },
                lendMoney:0.0,
                lendDate:null,
                remark:null
            }
        }),
        watch:{
            frameId: {
                handler() {
                    this.reset();
                    this.loadData();
                },
                deep: true,
            },
        },

        created() {
            this.reset();
            this.loadData();
        },

        methods:{
            loadData(){
                selectById(this.frameId).then(res => {
                    this.loanItem = res
                })
            },

            reset(){
                this.loanItem = {
                    staff:{
                        name:null,
                        section:{
                            name:null
                        },
                        openBlank:null,
                        bankNumber:null,
                    },
                    lendMoney:0.0,
                    lendDate:null,
                    remark:null
                }
            }
        }
    }
</script>
