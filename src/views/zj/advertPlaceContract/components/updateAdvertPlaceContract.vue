<template>
    <v-container class="pa-3">
        <v-form ref="addForm">
            <v-row>
                <v-col md="3">
                    <v-text-field label="合同名称" v-model="advertPlaceContractItem.contractName" :rules="[v => !!v || '请填写合同名称']"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="乙方" v-model="advertPlaceContractItem.partB" :rules="[v => !!v || '请填写乙方']"></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field type="number" label="广告位块数" v-model="advertPlaceContractItem.number"></v-text-field>
                </v-col>
                <v-col md="1.5">
                    <v-text-field label="广告类型" v-model="advertPlaceContractItem.advertType"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="位置编号" v-model="advertPlaceContractItem.placeNum"></v-text-field>
                </v-col>
                <v-col md="6">
                    <v-text-field label="具体位置" v-model="advertPlaceContractItem.placeAddress"></v-text-field>
                </v-col>

                <v-col md="3">
                    <v-menu v-model="menu1" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="advertPlaceContractItem.startDate"
                                          :rules="[v => !!v || '请选择合同开始日期']" label="合同开始日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="advertPlaceContractItem.startDate" no-title scrollable
                                       @change="menu1 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="3">
                    <v-menu v-model="menu2" transition="scale-transition" offset-y :close-on-content-click="false"
                            min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="advertPlaceContractItem.endDate"
                                          :rules="[v => !!v || '请选择合同截止日期']" label="合同截止日期" hide-details
                                          readonly v-bind="attrs" v-on="on"></v-text-field>
                        </template>
                        <v-date-picker v-model="advertPlaceContractItem.endDate" no-title scrollable
                                       @change="menu2 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="租金单价(元/块)"
                                  v-model="advertPlaceContractItem.price"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="租金总计(元)" v-model="advertPlaceContractItem.money"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="租金总计(大写)" v-model="advertPlaceContractItem.capitalizationMoney"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="设计费用"
                                  v-model="advertPlaceContractItem.designPrice"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="电费单价(元/块/月)"
                                  v-model="advertPlaceContractItem.perElectricPrice"></v-text-field>
                </v-col>
                <v-col md="2">
                    <v-text-field type="number" label="电费总计(元)"
                                  v-model="advertPlaceContractItem.electricMoney"></v-text-field>
                </v-col>
                <v-col md="3">
                    <v-text-field label="电费总计(大写)"
                                  v-model="advertPlaceContractItem.capitalizationElectricMoney"></v-text-field>
                </v-col>
                <v-col sm="3">
                    <file-upload ref="file" @change="fileChangeHandler" :dense="false"></file-upload>
                </v-col>
                <v-col sm="2">
                    <easy-flow coding="1320289" ref="easyFlow" default-flow-name="广告租赁合同"></easy-flow>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>
<script>
    import {update} from "../../../../api/advertPlaceContract";
    import {insertAdvertPlaceContractWordRecord} from "@/api/contractWordModel";
    import EasyFlow from "@/components/easyflow/easyFlow.vue";
    import FileUpload from "@/components/fileUpload.vue";

    export default {
        name: 'updateAdvertPlaceContract',
        components: {EasyFlow,FileUpload},
        props: {
            item: {
                type: Object,
            }
        },
        data: () => ({
            advertPlaceContractItem: {
                id: null,
                contractName: null,
                partB: null,
                number: null,
                placeNum: null,
                placeAddress: null,
                advertType: null,
                startDate: null,
                endDate: null,
                price: null,
                money: null,
                capitalizationMoney: null,
                designPrice: null,
                perElectricPrice: null,
                electricMoney: null,
                capitalizationElectricMoney: null,
                type: 3,
                files:''
            },
            menu1: false,
            menu2: false,
        }),
        watch: {
            'advertPlaceContractItem.money': {
                handler() {
                    if (this.advertPlaceContractItem.money != null && this.advertPlaceContractItem.money != '') {
                        this.advertPlaceContractItem.capitalizationMoney = this.convertCurrency(this.advertPlaceContractItem.money)
                    }
                },
                deep: true
            },
            'advertPlaceContractItem.electricMoney': {
                handler(){
                    if (this.advertPlaceContractItem.electricMoney != null && this.advertPlaceContractItem.electricMoney != ''){
                        this.advertPlaceContractItem.capitalizationElectricMoney = this.convertCurrency(this.advertPlaceContractItem.electricMoney)
                    }
                },
                deep: true
            },
            item:{
                handler(){
                    if (this.item != null){
                        this.advertPlaceContractItem = this.item
                    }
                },
                deep:true
            }

        },

        methods: {
            validateForm() {
                let flag = null
                if (this.$refs['addForm'].validate()) {
                    flag = true
                } else {
                    flag = false
                }
                return flag
            },
            submitUpdate() {
                return update(this.advertPlaceContractItem).then(res => {
                    insertAdvertPlaceContractWordRecord(this.advertPlaceContractItem)
                    this.$refs.easyFlow.startFlow({
                        title: this.advertPlaceContractItem.partB + "合同审批",
                        content: this.advertPlaceContractItem.remark || '',
                        frameId: this.advertPlaceContractItem.id,
                        frameCoding: 1320289,
                        frameColumn: 'id'
                    })
                    return res
                })
            },
            saveAdvertPlaceContract(){
                return update(this.advertPlaceContractItem).then(res => {
                    insertAdvertPlaceContractWordRecord(this.advertPlaceContractItem)
                    return res
                })
            },

            convertCurrency(money) {
                //汉字的数字
                var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
                //基本单位
                var cnIntRadice = new Array('', '拾', '佰', '仟');
                //对应整数部分扩展单位
                var cnIntUnits = new Array('', '万', '亿', '兆');
                //对应小数部分单位
                var cnDecUnits = new Array('角', '分', '毫', '厘');
                //整数金额时后面跟的字符
                var cnInteger = '整';
                //整型完以后的单位
                var cnIntLast = '圆';
                //最大处理的数字范围 999999999999999.9999
                //金额整数部分
                var integerNum;
                //金额小数部分
                var decimalNum;
                //输出的中文金额字符串
                var chineseStr = '';
                //分离金额后用的数组，预定义
                var parts;

                if (money == '') {
                    return '';
                }

                money = parseFloat(money);
                let moneyStr = ('' + money).split('.');
                if (money > 999999999999999.9999 || (moneyStr.length > 1 && moneyStr[1].length > 4)) {
                    throw '超出最大处理数字';
                }
                if (money == 0) {
                    chineseStr = cnNums[0] + cnIntLast + cnInteger;
                    return chineseStr;
                }

                //转换为字符串
                money = money.toString();
                if (money.indexOf('.') == -1) {
                    integerNum = money;
                    decimalNum = '';
                } else {
                    parts = money.split('.');
                    integerNum = parts[0];
                    decimalNum = parts[1].substr(0, 4);
                }

                //获取整型部分转换
                if (parseInt(integerNum, 10) > 0) {
                    var zeroCount = 0;
                    var IntLen = integerNum.length;
                    for (var i = 0; i < IntLen; i++) {
                        var n = integerNum.substr(i, 1);
                        var p = IntLen - i - 1;
                        var q = p / 4;
                        var m = p % 4;
                        if (n == '0') {
                            zeroCount++;
                        } else {
                            if (zeroCount > 0) {
                                chineseStr += cnNums[0];
                            }
                            //归零
                            zeroCount = 0;
                            chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
                        }
                        if (m == 0 && zeroCount < 4) {
                            chineseStr += cnIntUnits[q];
                        }
                    }
                    chineseStr += cnIntLast;
                }

                //小数部分
                if (decimalNum != '') {
                    var decLen = decimalNum.length;
                    for (var j = 0; j < decLen; j++) {
                        var k = decimalNum.substr(j, 1);
                        if (k != '0') {
                            chineseStr += cnNums[Number(k)] + cnDecUnits[j];
                        }
                    }
                }

                if (chineseStr == '') {
                    chineseStr += cnNums[0] + cnIntLast + cnInteger;
                } else if (decimalNum == '') {
                    chineseStr += cnInteger;
                }

                return chineseStr;
            },

            fileChangeHandler({files}) {
                this.advertPlaceContractItem.files = ""
                files.forEach(item => {
                    this.advertPlaceContractItem.files += item.id + ";"
                })
            },

            reset() {
                this.advertPlaceContractItem = {
                    id: null,
                    contractName: null,
                    partB: null,
                    number: null,
                    placeNum: null,
                    placeAddress: null,
                    advertType: null,
                    startDate: null,
                    endDate: null,
                    price: null,
                    money: null,
                    capitalizationMoney: null,
                    designPrice: null,
                    perElectricPrice: null,
                    electricMoney: null,
                    capitalizationElectricMoney: null,
                    type: 3,
                    files:''
                }
            }
        }
    }
</script>

