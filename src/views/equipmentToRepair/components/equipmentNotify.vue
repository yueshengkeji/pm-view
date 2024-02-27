<template>
    <div>
        <v-row>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.projectName" label="项目名称" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.equipmentName" label="设备名称" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.brand" label="品牌" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.serialNumber" label="序列号" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.number" label="数量" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.supplier" label="供应商" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-model="equipmentToRepair.trackingNumber" label="快递单号" readonly></v-text-field>
            </v-col>
            <v-col cols="12" md="4" sm="2" xs="2">
                <v-text-field v-if="equipmentToRepair.state == 0" value="未发货" label="状态" readonly></v-text-field>
                <v-text-field v-if="equipmentToRepair.state == 1" value="已发货" label="状态" readonly></v-text-field>
                <v-text-field v-if="equipmentToRepair.state == 2" value="已收货" label="状态" readonly></v-text-field>
                <v-text-field v-if="equipmentToRepair.state == 3" value="已报废" label="状态" readonly></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="equipmentToRepair.cause" label="故障原因" readonly
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="equipmentToRepair.remark" label="备注" readonly
                ></v-text-field>
            </v-col>
        </v-row>
        <v-col cols="12">
            <span style="color: red;text-align: center;margin: 0 20px">tip:超时3天自动确认</span>
            <v-btn v-if="equipmentToRepair.notifyFlag != 1" :loading="loading" @click="resultConfirm" block
                   color="primary">确认结果
            </v-btn>
            <v-btn v-if="equipmentToRepair.notifyFlag == 1" :loading="loading" disabled block>已确认
            </v-btn>
        </v-col>
    </div>
</template>
<script>
    import equipmentToRepairApi from "../../../api/equipmentToRepair";

    export default {
        name: 'equipmentNotify',
        data: () => ({
            equipmentToRepair: {
                projectName: null,
                equipmentName: null,
                number: null,
                brand: null,
                serialNumber: null,
                cause: null,
                remark: null,
                supplier: null,
                trackingNumber: null,
                notifyFlag: null
            },
            loading: false,
        }),

        created() {
            equipmentToRepairApi.getById({id: this.$route.params.id}).then(res => {
                this.equipmentToRepair = res
            })
        },

        methods: {
            resultConfirm() {
                equipmentToRepairApi.resultConfirm(this.equipmentToRepair).then(res => {
                    this.equipmentToRepair = res
                })
            }
        }
    }
</script>
