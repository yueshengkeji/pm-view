<template>
    <div>
        <v-row>
            <v-col>
                <v-data-table :items="items" :headers="headers" :search="search" show-select v-model="record">
                    <template v-slot:top>
                        <v-row>
                            <v-col lg="2">
                                <v-btn :loading="loading" class="ml-1 primary" @click="exportExcel">导出</v-btn>
                            </v-col>
                            <v-col lg="2" offset-lg="8">
                                <v-text-field label="搜索" v-model="search"></v-text-field>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.recordTime="{item}">
                        <span>{{item.recordTime | formatTimer}}</span>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import {exportRecord, selectRecord} from "@/api/downloadRecord"

    export default {
        name: "downloadRecord",
        data: () => ({
            search: null,
            items: [],
            loading: false,
            headers: [
                {text: '证书名称', value: 'name', width: "12%"},
                {text: '下载人员', value: 'recordUserName', width: "12%"},
                {text: '下载时间', value: 'recordTime', width: "14%"},
                {text: '用途', value: 'recordText'}
            ],
            record: []
        }),
        created() {
            this.list();
        },
        filters: {
            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },
        },
        methods: {
            list() {
                selectRecord().then(data => {
                    this.items = data;
                })
            },
            exportExcel() {
                if (this.record.length !== 0){
                    this.loading = true;
                    exportRecord(this.record).then(res => {
                        let a = document.createElement("a")
                        a.download = res
                        a.href = res
                        a.click()
                        console.log(a)
                    }).finally(() => {
                        this.loading = false;
                    })
                }
            }
        }
    }
</script>

<style scoped>

</style>