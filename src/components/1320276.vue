<template>
    <div class="pa-3">
        <v-row>
            <v-col
                    cols="6"
                    sm="4"

            >
                <v-text-field label="加班人员" v-model="overtimeItem.staff.name"></v-text-field>
            </v-col>
            <v-col
                    cols="6"
                    sm="4"

            >
                <v-text-field label="加班日期" v-model="overtimeItem.overtime"></v-text-field>
            </v-col>
            <v-col
                    cols="6"
                    sm="4"

            >
                <v-text-field label="开始时间" v-model="overtimeItem.begin"></v-text-field>
            </v-col>
            <v-col
                    cols="6"
                    sm="3"

            >
                <v-text-field label="截止时间" v-model="overtimeItem.end"></v-text-field>
            </v-col>
            <v-col
                    cols="2"
                    sm="3"

            >
                <v-text-field label="时长" v-model="overtimeItem.hour"></v-text-field>
            </v-col>
            <v-col
                    cols="10"
                    sm="6"

            >
                <v-text-field label="事由" v-model="overtimeItem.remark"></v-text-field>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import workOvertimeApi from '@/api/workOvertime';

    export default {
        name: "frame-1320276",
        props: {
            frameId: String,
        },
        data: () => ({
            overtimeItem: {
                staff: {name: null},
                name: null,
                overtime: null,
                begin: null,
                end: null,
                hour: null,
                remark: null,
            }
        }),
        watch: {
            frameId: {
                handler() {
                    this.reset()
                    if (this.frameId != null) {
                        this.getOvertime();
                    }
                },
            }
        },
        created() {
            this.reset()
            if (this.frameId != null) {
                this.getOvertime()
            }

        },
        methods: {
            getOvertime() {
                workOvertimeApi.getOverTime({id: this.frameId}).then(res => {
                    this.overtimeItem = res
                })
            },
            reset() {
                this.overtimeItem = {
                    staff: {name: null},
                    name: null,
                    overtime: null,
                    begin: null,
                    end: null,
                    hour: null,
                    remark: null,
                }
            }
        }
    }
</script>