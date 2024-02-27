<template>
    <div class="pa-5">
        <h3>{{this.$route.params.name}}-项目报修</h3>
        <v-row v-if="showForm">
            <v-col lg="6" offset-lg="3" cols="12">
                <v-form ref="formWeixiu">
                    <v-row>

                        <v-col cols="12">
                            <v-textarea ref="content"
                                        :rows="3"
                                        :disabled="data.id != null"
                                        label="请输入报修内容（必填）"
                                        :rules="rules.title"
                                        v-model="data.title"
                                        :error-messages="errorMsg"
                                        placeholder="请输入报修内容（必填）"></v-textarea>
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="data.name" label="请输入您的姓名(必填)" :rules="rules.name"></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="data.tel" label="请输入您的手机号(必填)" :rules="rules.tel"></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-file-input :loading="loading" label="拍照上传图片(可选)" @change="fileChange" accept="image/*">

                            </v-file-input>
                            <img :src="imgUrl" ref="prevImg" width="1024" style="width:100%;max-height: 300px">
                        </v-col>

                        <v-btn :loading="loading" color="primary" @click="insert" block>提交</v-btn>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col cols="12">
                <h3 class="text-center mt-5">{{msg}}</h3>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import {insertWeixiuExt} from '@/api/weixiu'

    export default {
        name: "insert-weixiu-ext",
        data: () => ({
            loading: false,
            materialLoading: false,
            data: null,
            searchProject: null,
            projects: [],
            rules: {
                title: [
                    v => !!v || "请输入报修内容",
                    v => v.length < 1000 || "报修内容过长",
                ],
                name:[
                    v => !!v || "请输入您的姓名！",
                    v => v.length < 50 || '姓名过长，请重新输入！'
                ],
                tel:[
                    v => !!v || "请输入您的手机号！",
                    v => v.length < 12 || '手机号过长，请重新输入！'
                ],
            },
            showMsg: false,
            msg: null,
            errorMsg: null,

            showForm: true,
            imgUrl: null
        }),
        created() {
            this.reset()
        },
        methods: {
            fileChange(files) {
                this.loading = true
                const reader = new FileReader()
                reader.readAsDataURL(files)
                reader.onload = () => {
                    this.imgUrl = reader.result
                    let img = this.$refs.prevImg
                    let b = 3;
                    if(img.width > 700){
                        b = 1
                    }
                    this.dealImageByTag(img, {width:img.width*b,height:img.height*b},(dealRes)=>{
                        img.onload = null
                        this.imgUrl = dealRes
                        this.loading = false
                        this.data.files = dealRes
                    })
                }
                /*if (files != null && files.length > 0) {
                    this.data.files = ""
                    files.forEach(item => {
                        this.data.files = item.ftpPath
                    })
                    this.data.id = files.mainId
                }*/
            },
            insert() {
                let valid = this.$refs['formWeixiu'].validate();
                if (valid) {
                    this.loading = true
                    let ajax;
                    ajax = insertWeixiuExt(this.data)
                    ajax.then(() => {
                        localStorage.setItem("projectAfterUserName",this.data.name)
                        localStorage.setItem("projectAfterUserTel",this.data.tel)
                        this.showForm = false
                        this.reset();
                        this.msg = "报修成功"
                    }).catch(() => {
                        this.msg = "报修失败，您可拨打0513-85516129进行报修"
                    }).finally(() => {
                        this.errorMsg = null
                        this.showMsg = true
                        this.loading = false
                        this.$emit('success');
                    });
                }
            },
            reset() {
                let projectId = this.$route.params.id
                let projectName = this.$route.params.name
                if (projectId == null || projectName == null) {
                    this.msg = "非法请求"
                    this.showMsg = true
                } else {
                    this.data = {
                        project: {id: projectId, name: projectName},
                        title: '',
                        returnContent: null,
                        isService: 0,
                        files: null,
                        name:localStorage.getItem("projectAfterUserName") || '',
                        tel:localStorage.getItem("projectAfterUserTel") || ''
                    }
                }
            },
            handleSelect() {
                this.$refs['content'].focus();
            },
        }
    }
</script>

<style scoped>

</style>