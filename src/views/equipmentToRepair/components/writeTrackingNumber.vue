<template>
        <v-container>
            <v-form ref="expressForm">
                <v-row align="center" class="pa-5" :style="{height: height+'px'}">
                    <v-col cols="12" align-self="center">
                        <p>请允许访问摄像机权限；对准快递单条形码扫描或手动输入快递单号，点击确定上传即可</p>
                        <h3 class="text-center">采购订单物流信息上传</h3>
                        <h2 class="red--text" v-if="this.id == null">{{error}}</h2>
                        <v-switch v-model="torchActive" small block label="手电筒开关"></v-switch>
                        <div class="QrCode"
                             id="qrCode"
                             v-if="expressCode == '' || expressCode == null"
                             style="margin-left: -15px">

                        </div>
                        <v-text-field :disabled="disabled" class="mt-1"
                                      :rules="[v => !!v || '快递单号不能为空！',v => v.length < 50 || '快递单号过长！']"
                                      v-model="expressCode"
                                      label="快递单号"></v-text-field>
<!--                        <v-text-field v-model="supplier" label="供货商" :rules="[v => !!v || '供货商不能为空！',v => (!!v && v.length < 50) || '快递单号过长！']"></v-text-field>-->
                        <v-combobox v-model="supplier"
                                    :search-input.sync="searchCompany"
                                    :items="companyItems"
                                    :rules="[v => !!v || '供货商不能为空！',v => (!!v && v.length < 50) || '快递单号过长！']"
                                    label="供货商"
                        ></v-combobox>
                        <v-btn class="mt-1 mb-1" block @click="reInit">重新扫码</v-btn>
                        <v-btn :disabled="(expressCode == '' || expressCode == null) || disabled"
                               :loading="loading"
                               block
                               color="primary"
                               @click="saveExpressCode">{{btnStr}}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-container>

</template>

<script>

    import Quagga from 'quagga'
    import equipmentToRepairApi from "../../../api/equipmentToRepair";
    import {list} from '@/api/company';


    export default {
        name: "express",
        components: {},
        props:{
            equipmentToRepairItem:Object
        },
        data: () => ({
            supplier:null,
            id: null,
            expressCode: '',
            height: 0,
            loading: false,
            btnStr: '确定上传',
            width: 0,
            size: {
                width: 0,
                height: 0
            },
            camera: "auto",
            torchActive: false,
            error: '非法请求',
            disabled:false,

            searchCompany:null,
            companyItems:[],
        }),
        watch:{
            searchCompany: {
                handler() {
                    if (this.searchCompany != null) {
                        this.getCompany(this.searchCompany)
                    }
                },
                deep: true,
            },
        },
        created() {
            this.height = this.getClientHeight()
            this.width = this.$vuetify.breakpoint.getClientWidth() - 30
            this.size.width = this.width
            this.size.height = this.height

            this.$nextTick(()=>{
                this.init()
            })
        },
        methods: {
            getCompany(str) {
                this.companyItems = []
                list(str).then(res => {
                    res.forEach(item => {
                        this.companyItems.push(item.name)
                    })
                })
            },
            async init() {
                Quagga.init({
                    inputStream : {
                        constraints: {
                            width: this.width,
                            height: 300,
                        },
                        name : "Live",
                        type : "LiveStream",
                        target: document.getElementById('qrCode')    // Or '#yourElement' (optional)
                    },
                    decoder : {
                        readers : ["code_128_reader"]
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                        return
                    }
                    console.log("Quagga.start()",Quagga.start())
                });
                Quagga.onDetected((data)=>{
                    console.log("Quagga.onDetected")
                    this.expressCode = data.codeResult.code
                    Quagga.stop()
                })
            },
            reInit() {
                window.location.reload()
            },
            detected(data) {
                console.log("data", data)
                this.expressCode = data
            },
            saveExpressCode() {
                let valid = this.$refs.expressForm.validate()
                if (valid) {
                    this.loading = true
                    this.equipmentToRepairItem.trackingNumber = this.expressCode
                    this.equipmentToRepairItem.supplier = this.supplier
                    this.equipmentToRepairItem.state = 1
                    equipmentToRepairApi.updateRepair(this.equipmentToRepairItem).then(() => {
                        this.disabled = true
                        this.btnStr = '上传成功'
                        window.location.reload()
                    }).finally(() => {
                        this.loading = false
                    })
                }
            },
        }
    }
</script>

<style scoped>
canvas {
  display: none;
}
</style>
