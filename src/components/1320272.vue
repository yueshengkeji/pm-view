<template>
    <div class="pa-3">
        <v-form>
            <v-row>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="姓名" v-model="data.userName"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="出发时间" v-model="data.departureDate"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="目的地" v-model="data.arriveAddr"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="途径地点" v-model="data.tjAddr"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="交通工具" v-model="data.jtTool"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="接触人数" v-model="data.number"></v-text-field>
                </v-col>
                <v-col lg="4" md="4" cols="12">
                    <v-text-field label="返回时间" v-model="data.backDate"></v-text-field>
                </v-col>
            </v-row>
        </v-form>
    </div>
</template>

<script>
    import {getById} from '@/api/tdc'

    export default {
        name: "frame-1320273",
        data: () => ({
            data: null,
        }),
        props: {
            frameId: null,
        },
        watch: {
            frameId: {
                handler() {
                    if (this.frameId) {
                        this.reset();
                        this.loadData()
                    }
                },
            }
        },
        created() {
            if (this.frameId) {
                this.reset();
                this.loadData();
            }
        },
        methods: {
            loadData() {
                getById(this.frameId).then(data => {
                    if (data != null) {
                        this.data = data;
                    }
                })
            },
            reset() {
                this.data = {
                    arriveAddr: null,
                    backDate: null,
                    departureDate: null,
                    id: null,
                    jtTool: null,
                    number: 0,
                    staff: null,
                    state: 0,
                    tjAddr: null,
                    userName: null,
                }
            }
        }
    }
</script>

<style scoped>

</style>