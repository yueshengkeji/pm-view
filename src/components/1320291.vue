<template>
    <v-container>
        <v-row>
            <v-col sm="3">
                <v-text-field dense label="项目名称" readonly
                              v-model="completionData.project.name"></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-text-field dense label="建设单位" readonly
                              v-model="completionData.project.oConstruction.name"></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-text-field dense label="项目人员" readonly
                              v-model="completionData.project.staff.name"></v-text-field>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
    import {selectById} from "../api/completionData";

    export default {
        name:'1320291',
        props: {
            frameId: String
        },
        data:() => ({
            completionData: {
                project: {name:null},
                staff: {name:null},
                files: ''
            }
        }),
        watch: {
            frameId: {
                handler() {
                    if (this.frameId != null) {
                        this.id = this.frameId
                        this.getById()
                    }
                }
            },
        },
        created() {
            this.id = this.frameId
            this.getById()
        },
        methods:{
            getById() {
                console.log('this.id',this.id)
                selectById({id: this.id}).then(res => {
                    this.completionData = res
                })
            },
        }
    }
</script>
