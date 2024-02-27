<template>
    <v-card>
        <v-card-title>{{overtime.staff.name}}的加班单</v-card-title>
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col
                            sm="6"
                            md="4"
                            xs="2">
                        <v-text-field v-model="overtime.staff.name" label="加班人员" readonly></v-text-field>
                    </v-col>
                    <v-col
                            sm="6"
                            md="4"
                            xs="2">
                        <v-text-field v-model="overtime.name" label="单据编号" readonly></v-text-field>
                    </v-col>
                    <v-col
                            cols="12"
                            sm="6"
                            md="4">
                        <v-text-field v-model="overtime.overtime" label="加班日期" readonly></v-text-field>
                    </v-col>
                    <v-col
                            sm="6"
                            md="4"
                            xs="2">
                        <v-text-field v-model="overtime.begin" label="开始时间" readonly></v-text-field>
                    </v-col>
                    <v-col
                            sm="6"
                            md="4"
                            xs="2">
                        <v-text-field v-model="overtime.end" label="截止时间" readonly></v-text-field>
                    </v-col>
                    <v-col
                            cols="12"
                            sm="6"
                            md="4">
                        <v-text-field v-model="overtime.hour" label="时长" readonly></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="overtime.remark" label="备注" readonly></v-text-field>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    import overTimeApi from '@/api/workOvertime';

    export default {
        name: 'frame-1320279',
        props: {
            frameId: String,
            overtimeItem: {
                type: Object,
                default: null,
            }
        },
        data: () => ({
            id: null,
            overtime: null,

        }),

        created() {
            this.reset()
            this.id = this.frameId
            if (this.id != null) {
                this.loadOverTime()
            } else {
                this.overtime = this.overtimeItem
            }
        },

        watch: {
            frameId: {
                handler() {
                    this.reset()
                    if (this.frameId != null) {
                        this.id = this.frameId
                        this.loadOverTime()
                    }
                },
                deep: true,
            },
            overtimeItem: {
                handler() {
                    this.reset()
                    if (this.overtimeItem != null) {
                        this.overtime = this.overtimeItem
                    }
                }
            }
        },

        methods: {
            loadOverTime() {
                overTimeApi.getOverTime({id: this.id}).then(res => {
                    this.overtime = res
                })
            },

            reset() {
                this.overtime = {
                    id: null,
                    date: null,
                    overtime: null,
                    begin: null,
                    end: null,
                    remark: null,
                    name: null,
                    hour: null,
                    staff:{
                        name:null
                    },

                }
            }
        }
    }
</script>