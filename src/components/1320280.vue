<template>
    <div class="pa-3">
        <v-form ref="form">
            <v-autocomplete :search-input.sync="searchProject"
                            :items="projectList"
                            return-object
                            item-text="name"
                            item-value="id"
                            label="项目名称"
                            hint="项目（可选）"
                            v-model="data.project"></v-autocomplete>
            <v-text-field label="事由*" hint="事由（必填）" :rules="rules.note" v-model="data.note"></v-text-field>
            <v-text-field type="number"
                          label="就餐人数*"
                          hint="就餐人数(必填)"
                          :rules="rules.personNum"
                          v-model="data.personNum"></v-text-field>
            <v-text-field label="就餐标准" hint="就餐标准" v-model="data.standard"></v-text-field>
            <v-menu ref="menu" v-model="menu">
                <template v-slot:activator="{attrs,on}">
                    <v-text-field v-model="data.date"
                                  v-bind="attrs"
                                  v-on="on"
                                  label="就餐时间"
                                  :rules="rules.date"></v-text-field>
                </template>
                <v-date-picker v-model="data.date" @change="$refs.menu.save()"></v-date-picker>
            </v-menu>
            <easy-flow coding="1320280" ref="flow" default-flow-name="就餐申请（市场）"></easy-flow>
        </v-form>
    </div>
</template>

<script>
    import {search} from '@/api/project'
    import {getById, insert, updateDine} from '@/api/applyDine'
    import easyFlow from "./easyflow/easyFlow";

    export default {
        name: "frame-1320280",
        components: {
            easyFlow
        },
        props: {
            formData: Object,
            frameId: String,
        },
        model: {
            prop: 'formData',
            event: 'change'
        },
        data: () => ({
            projectList: [],
            data: null,
            menu: false,
            rules: {
                note: [
                    v => !!v || '事由不能为空',
                    v => v.length < 100 || '输入的字符信息过长'
                ],
                date: [
                    v => !!v || '就餐时间不能为空'
                ],
                personNum: [
                    v => !!v || '请输入就餐人数',
                    v => parseInt(v) > 0 || '就餐人数不能为0',
                    v => parseInt(v) < 10000 || '就餐人数不能大于10000人',
                ]
            },
            searchProject: null,
        }),
        watch: {
            frameId: {
                handler() {
                    if (this.frameId) {
                        this.loadData()
                    }
                }
            },
            formData: {
                handler() {
                    if (this.formData) {
                        if(this.formData.project){
                            this.projectList.push(this.formData.project)
                        }
                        this.data = this.formData
                    }
                }
            },
            data: {
                handler() {
                    this.$emit("change", this.data)
                },
                deep: true,
            },
            searchProject(val) {
                if (val) {
                    search(val).then(result => this.projectList = result)
                }
            }
        },
        created() {
            if (this.frameId) {
                this.loadData()
            } else {
                this.reset()
            }
        },
        methods: {
            loadData(){
                getById(this.frameId).then(result=>{
                    if(result.project){
                        this.projectList.push(result.project)
                    }
                    this.data = result
                })
            },
            save() {
                let valid = this.$refs.form.validate()
                if (valid) {
                    if (this.data.id) {
                        return updateDine(this.data).then(this.startFlow)
                    } else {
                        return insert(this.data).then(this.startFlow)
                    }
                } else {
                    return new Promise((resolve,reject)=>{
                        reject("输入信息不完整");
                    });
                }
            },
            startFlow(result) {
                this.$refs.flow.startFlow({
                    title: result.note + '-就餐申请',
                    content: result.note + '-就餐申请',
                    frameId: result.id,
                    frameCoding: 1320280,
                    frameColumn: 'id'
                })
            },
            reset() {
                this.data = {
                    project: {name: '', id: ''},
                    note: '',
                    personNum: '',
                    standard: '',
                    date: this.formatTimer(new Date()),
                }
                console.log(this.data.date)
                if (this.$refs.form) {
                    this.$refs.form.resetValidation()
                }
            }
        }
    }
</script>

<style scoped>

</style>