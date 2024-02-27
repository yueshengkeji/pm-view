<template>
    <v-card>
        <v-row>
        <v-col
                cols="11"
                sm="2"
        >
            <v-menu
                    ref="menu4"
                    v-model="menu4"
                    :close-on-content-click="false"
                    :return-value.sync="monthData.dateSearch"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="auto"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                            v-model="monthData.dateSearch"
                            label="查询年月"
                            prepend-icon="mdi-calendar"
                            v-bind="attrs"
                            v-on="on"

                    ></v-text-field>
                </template>
                <v-date-picker
                        v-model="monthData.dateSearch"
                        type="month"
                        no-title
                        scrollable
                        @change="monthChanged"

                >
                    <v-spacer></v-spacer>
                </v-date-picker>
            </v-menu>

        </v-col>
        <v-col
                cols="11"
                sm="2"
        >
            <v-text-field
                    v-model="monthData.monthTotalMoney"
                    :label=labelMonthTotalMoney
                    readonly
            >
            </v-text-field>
        </v-col>
        <v-col
                cols="11"
                sm="2"
        >
            <v-text-field
                    v-model="monthData.monthTotalCollected"
                    :label=labelMonthTotalCollected
                    readonly
            >
            </v-text-field>
        </v-col>
        <v-col
                cols="11"
                sm="2"
        >
            <v-text-field
                    v-model="monthData.monthTotalPaid"
                    :label=labelMonthTotalPaid
                    readonly
            >
            </v-text-field>
        </v-col>
        <v-col
                cols="11"
                sm="2"
        >
            <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="搜索"
                    single-line
                    hide-details
                    @change="searchContract"
            ></v-text-field>
        </v-col>
            <div style="margin-left: 13px;margin-top: 25px">
                <v-dialog
                        v-model="dialog"
                        max-width="800px"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                                color="primary"
                                dark
                                class="mb-2"
                                v-bind="attrs"
                                v-on="on"
                                @click="resetClear"

                        >
                            采购合同登记
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="text-h5">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-form ref="editedItem" lazy-validation>
                                <v-container>
                                    <v-row>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.projectBase"
                                                    label="项目地址"
                                                    :rules="rules.projectBaseRules"
                                                    required
                                            ></v-text-field>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.agreementID"
                                                    label="合同编号(必填)"
                                                    :rules="rules.agreementIDRules"
                                                    required
                                            ></v-text-field>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.agreementName"
                                                    label="合同名称(必填)"
                                                    :rules="rules.agreementNameRules"
                                                    required
                                            ></v-text-field>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.agreementMoney"
                                                    label="合同金额(￥)(必填)"
                                                    :rules="rules.agreementMoneyRules"
                                                    required
                                                    type="number"
                                                    onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.tax"
                                                    label="税率(%)"
                                                    onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-menu
                                                    ref="menu"
                                                    v-model="menu"
                                                    :close-on-content-click="false"
                                                    :nudge-right="40"
                                                    transition="scale-transition"
                                                    offset-y
                                                    min-width="auto"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                            v-model="editedItem.signDate"
                                                            label="签订日期(必填)"
                                                            :rules="rules.signDateRules"
                                                            required
                                                            prepend-icon="mdi-calendar"
                                                            readonly
                                                            v-bind="attrs"
                                                            v-on="on"

                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                        v-model="editedItem.signDate"
                                                        @change="signDateChanged"
                                                ></v-date-picker>
                                            </v-menu>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-combobox

                                                    v-model="editedItem.paymentDays"
                                                    :items="paymentItems"
                                                    label="账期(天)(必填)"
                                                    :rules="rules.paymentDaysRules"
                                                    aria-required="true"
                                                    oninput="value=value.replace(/[^\d]/g,'')"

                                            ></v-combobox>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-combobox
                                                    v-model="editedItem.companyName"
                                                    :items="companyNameItems"
                                                    :search-input.sync="searchCompany"
                                                    label="单位名称(必填)"
                                                    :rules="rules.companyNameRules"
                                                    required
                                            ></v-combobox>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.companyAddress"
                                                    label="单位地址(可选)"
                                            ></v-text-field>

                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.bankName"
                                                    label="开户银行(可选)"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.bankAccount"
                                                    label="银行账户"
                                                    required
                                                    onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-text-field
                                                    v-model="editedItem.remark"
                                                    label="备注(可选)"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <file-upload :clear="clear" @change="fileUpload"
                                                         style="margin-top: 22px"></file-upload>
                                        </v-col>
                                        <v-col
                                                cols="12"
                                                sm="6"
                                                md="4"
                                        >
                                            <v-btn
                                                    color="blue darken-1"
                                                    text
                                                    @click="showFiles"
                                                    v-show="showPurchase"
                                                    style="margin-top: 22px"
                                            >
                                                查看附件
                                            </v-btn>
                                            <v-dialog v-model="showPurchaseFiles" max-width="600px">
                                                <v-card>
                                                    <v-data-table
                                                            :headers="purchaseFilesHeader"
                                                            :items="purchaseFilesDesserts"
                                                            :items-per-page="5"
                                                            class="elevation-1"
                                                    >
                                                        <template v-slot:item.delete="{ item }">
                                                            <v-icon
                                                                    small
                                                                    @click="purchaseFilesDelete(item)"
                                                            >
                                                                mdi-delete
                                                            </v-icon>
                                                        </template>
                                                        <template v-slot:item.download="{ item }">
                                                            <v-icon
                                                                    small
                                                                    @click="downloadFile(item)"
                                                            >
                                                                下载
                                                            </v-icon>
                                                        </template>
                                                    </v-data-table>
                                                </v-card>
                                            </v-dialog>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="close"

                            >
                                取消
                            </v-btn>
                            <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="save"
                            >
                                保存
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </div>
        </v-row>
        <v-spacer></v-spacer>


        <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">确定</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>


    <!--收票-->
    <v-dialog v-model="collect" max-width="1000px">
        <v-card>
            <v-data-table
                    :headers="collectHeaders"
                    :items="collectDesserts"
                    :items-per-page="5"
                    class="elevation-1"
            >
                <template v-slot:item.collectDate="{ item }">
                    <span>{{item.collectDate | formatTimer}}</span>
                </template>
                <template v-slot:top>
                    <v-toolbar
                            flat
                    >
                        <v-toolbar-title>收票明细</v-toolbar-title>
                        <v-divider
                                class="mx-4"
                                inset
                                vertical
                        ></v-divider>
                        <v-spacer></v-spacer>
                        <v-dialog
                                v-model="collectDialog"
                                max-width="800px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                        color="primary"
                                        dark
                                        class="mb-2"
                                        v-bind="attrs"
                                        v-on="on"
                                >
                                    收票登记
                                </v-btn>
                            </template>
                            <v-card>
                                <v-card-title>
                                    <span class="text-h5">{{ formCollectTitle }}</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"

                                            >
                                                合同名称：{{collectDefaultItem.agreementName}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                合同金额(￥)：{{collectDefaultItem.agreementMoney}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                已收票金额(￥)：{{collectDefaultItem.collectedMoney}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                已收票百分比(%)：{{collectDefaultItem.collectedPercent}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-text-field
                                                        v-model="collectEditedItem.collectID"
                                                        label="收票编号"

                                                ></v-text-field>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-menu
                                                        ref="menu2"
                                                        v-model="menu2"
                                                        :close-on-content-click="false"
                                                        :nudge-right="40"
                                                        transition="scale-transition"
                                                        offset-y
                                                        min-width="auto"
                                                >
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field
                                                                v-model="collectEditedItem.collectDate"
                                                                label="收票日期"
                                                                required
                                                                prepend-icon="mdi-calendar"
                                                                readonly
                                                                v-bind="attrs"
                                                                v-on="on"

                                                        ></v-text-field>
                                                    </template>
                                                    <v-date-picker
                                                            v-model="collectEditedItem.collectDate"
                                                            @change="collectDateChanged"
                                                    ></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-text-field
                                                        v-model="collectEditedItem.collectMoney"
                                                        label="收票金额(￥)(必填)"
                                                        type="number"
                                                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                        @change="collectMoneyOfPercent"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-text-field
                                                        v-model="collectEditedItem.percent"
                                                        label="百分比(%)"
                                                        type="number"
                                                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                        @change="percentOfCollectMoney"
                                                        :autofocus="true"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col>
                                                <v-text-field
                                                        v-model="collectEditedItem.remark"
                                                        label="备注"
                                                ></v-text-field>
                                            </v-col>

                                        </v-row>
                                    </v-container>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="closeCollect"
                                    >
                                        取消
                                    </v-btn>
                                    <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="saveCollect"
                                    >
                                        保存
                                    </v-btn>
                                </v-card-actions>
                            </v-card>

                        </v-dialog>
                        <v-dialog v-model="collectDelete" max-width="500px">
                            <v-card>
                                <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" text @click="collectCloseDelete">取消</v-btn>
                                    <v-btn color="blue darken-1" text @click="collectDeleteItemConfirm">确定
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.collectActions="{ item }">
                    <v-icon
                            small
                            @click="collectDeleteItem(item)"
                    >
                        mdi-delete
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>
    </v-dialog>
    <!--支付-->
    <v-dialog v-model="pay" max-width="1000px">
        <v-card>
            <v-data-table
                    :headers="payHeaders"
                    :items="payDesserts"
                    :items-per-page="5"
                    class="elevation-1"
            >
                <template v-slot:top>
                    <v-toolbar
                            flat
                    >
                        <v-toolbar-title>支出明细</v-toolbar-title>
                        <v-divider
                                class="mx-4"
                                inset
                                vertical
                        ></v-divider>
                        <v-spacer></v-spacer>
                        <v-dialog
                                v-model="payDialog"
                                max-width="800px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                        color="primary"
                                        dark
                                        class="mb-2"
                                        v-bind="attrs"
                                        v-on="on"
                                >
                                    支出登记
                                </v-btn>
                            </template>
                            <v-card>
                                <v-card-title>
                                    <span class="text-h5">{{ formPayTitle }}</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                合同名称：{{payDefaultItem.agreementName}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                合同金额(￥)：{{payDefaultItem.agreementMoney}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                已支出金额(￥)：{{payDefaultItem.paidMoney}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                已支出百分比(%)：{{payDefaultItem.paidPercent}}
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-text-field
                                                        v-model="payEditedItem.payID"
                                                        label="支出编号"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-menu
                                                        ref="menu3"
                                                        v-model="menu3"
                                                        :close-on-content-click="false"
                                                        :nudge-right="40"
                                                        transition="scale-transition"
                                                        offset-y
                                                        min-width="auto"
                                                >
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field
                                                                v-model="payEditedItem.payDate"
                                                                label="支出日期"
                                                                required
                                                                prepend-icon="mdi-calendar"
                                                                readonly
                                                                v-bind="attrs"
                                                                v-on="on"
                                                        ></v-text-field>
                                                    </template>
                                                    <v-date-picker
                                                            v-model="payEditedItem.payDate"
                                                            @change="payDateChanged"
                                                    ></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-text-field
                                                        v-model="payEditedItem.payMoney"
                                                        label="支出金额(￥)(必填)"
                                                        type="number"
                                                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                        @change="payMoneyOfPercent"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="3"
                                            >
                                                <v-text-field
                                                        v-model="payEditedItem.percent"
                                                        label="百分比(%)"
                                                        type="number"
                                                        onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"
                                                        @change="percentOfPayMoney"
                                                        :autofocus="true"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col>
                                                <v-text-field
                                                        v-model="payEditedItem.remark"
                                                        label="备注"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="closePay"
                                    >
                                        取消
                                    </v-btn>
                                    <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="savePay"
                                    >
                                        保存
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="payDialogDelete" max-width="500px">
                            <v-card>
                                <v-card-title class="text-h5">你确定要删除该记录?</v-card-title>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" text @click="payCloseDelete">取消</v-btn>
                                    <v-btn color="blue darken-1" text @click="payDeleteItemConfirm">确定
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.status="{ item }">
                    <v-container
                            class="px-0"
                            fluid
                    >
                        <v-switch
                                v-model="item.statusCheck"
                                :label="item.status"
                                @change="Check(item)"
                        ></v-switch>
                    </v-container>
                </template>
                <template v-slot:item.payActions="{ item }">
                    <v-icon
                            small
                            @click="payDeleteItem(item)"
                    >
                        mdi-delete
                    </v-icon>
                </template>

            </v-data-table>
        </v-card>
    </v-dialog>
    <v-data-table
            :headers="headers"
            :items="desserts"
            :options.sync="options"
            :server-items-length="totalDesserts"
            class="elevation-1"
    >
        <template v-slot:item.signDate="{ item }">
            <span>{{item.signDate | formatTimer}}</span>
        </template>

        <template v-slot:item.collectPercent="{ item }">
            <v-progress-linear

                    height="15"
                    :color="item.percentColorC"
                    :value="item.contractCollectP"
            >
                <strong style="font-size: 10px">{{item.contractCollectP}}%</strong>
            </v-progress-linear>
        </template>

        <template v-slot:item.payPercent="{ item }">
            <v-progress-linear

                    height="15"
                    :color="item.percentColorP"
                    :value="item.contractPaidP"
            >
                <strong style="font-size: 10px"> {{item.contractPaidP}}%</strong>
            </v-progress-linear>
        </template>

        <template v-slot:item.actions="{ item }">
            <v-icon
                    small
                    class="mr-2"
                    @click="editItem(item)"
            >
                mdi-pencil
            </v-icon>
            <v-icon
                    small
                    @click="deleteItem(item)"
            >
                mdi-delete
            </v-icon>
            <v-icon
                    small
                    class="mr-2"
                    @click="collectAction(item)"
            >
                收票明细
            </v-icon>
            <v-icon
                    small
                    class="mr-2"
                    @click="payAction(item)"
            >
                支出明细
            </v-icon>
        </template>
    </v-data-table>
    </v-card>
</template>

<script>
    import purchaseContractApi from "@/api/purchaseContractApi";
    import companyApi from '@/api/company';
    import fileUpload from "../../../components/fileUpload";

    export default {
        name: 'purchaseContract',
        components: {fileUpload},
        data: () => ({
            menu: false,
            menu2: false,
            menu3: false,
            menu4: false,
            showPurchase: false,
            clear: false,
            search: null,
            totalDesserts: 0,
            options: {},

            dialog: false,
            dialogDelete: false,
            headers: [
                {text: '项目地址', value: 'projectBase',sortable: false},
                {
                    text: '合同编号',
                    align: 'start',
                    sortable: false,
                    value: 'agreementID',
                },
                {text: '合同名称', value: 'agreementName',sortable: false},
                {text: '合同金额(￥)', value: 'agreementMoney',sortable: false},
                {text: '签订日期', value: 'signDate', dateType: 'Date',sortable: false},
                {text: '单位名称', value: 'companyName',sortable: false},
                {text: '备注', value: 'remark',sortable: false},
                {text: '收票进度', value: 'collectPercent',sortable: false},
                {text: '支出进度', value: 'payPercent',sortable: false},
                {text: '登记人', value: 'registrant',sortable: false},
                {text: '已收票金额(￥)', value: 'collectedMoney',sortable: false},
                {text: '已支出金额(￥)', value: 'paidMoney',sortable: false},
                {text: '操作', value: 'actions', sortable: false},
            ],
            desserts: [],
            editedIndex: -1,
            editedItem: {
                id: null,
                projectBase: null,
                agreementID: null,
                agreementName: null,
                agreementMoney: null,
                signDate: null,
                paymentDays: null,
                companyName: null,
                companyAddress: null,
                bankName: null,
                bankAccount: null,
                remark: null,
                tak: null,
                collectedMoney: null,
                paidMoney: null,
                collectPercent: null,
                payPercent: null,
                files: [],

            },
            defaultItem: {
                id: null,
                projectBase: null,
                agreementID: null,
                agreementName: null,
                agreementMoney: null,
                signDate: null,
                paymentDays: null,
                companyName: null,
                companyAddress: null,
                bankName: null,
                bankAccount: null,
                remark: null,
                tak: null,
                collectedMoney: null,
                paidMoney: null,
                collectPercent: null,
                payPercent: null,
                files: [],

            },
            rules: {
                agreementIDRules: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 50) || "合同编号过长，不能超过50个字符"
                ],
                agreementNameRules: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 50) || "合同名称过长，不能超过50个字符"
                ],
                agreementMoneyRules: [
                    v => !!v || '必填字段！'
                ],
                signDateRules: [
                    v => !!v || '必填字段！'
                ],
                companyNameRules: [
                    v => !!v || '必填字段！', v => (!!v && v.length < 50) || "名称过长，不能超过50个字符"
                ],
                paymentDaysRules: [
                    v => !!v || '必填字段！'
                ],

            },
            paymentItems: [30, 60, '其他'],
            searchCompany: null,
            companyNameItems: [],
            companyItems: [],
            companyMSG: {
                companyName: null,
                companyAddress: null,
                bankName: null,
                bankAccount: null,
            },
            tempAgreementID: null,

            purchaseFiles: {
                fileName: null,
                fileUrl: null,
                mark: null,
            },
            showPurchaseFiles: false,
            purchaseFilesDesserts: [],
            purchaseFilesHeader: [
                {text: '文件名', align: 'start', sortable: false, value: 'fileName'},
                {text: '下载', value: 'download', sortable: false},
                {text: '删除', value: 'delete', sortable: false}

            ],

            collect: false,
            collectDialog: false,
            collectDelete: false,
            collectHeaders: [
                {
                    text: '收票编号',
                    align: 'start',
                    sortable: false,
                    value: 'collectID',
                },
                {text: '收票金额(￥)', value: 'collectMoney'},
                {text: '百分比(%)', value: 'percent'},
                {text: '备注', value: 'remark'},
                {text: '收票日期', value: 'collectDate'},
                {text: '登记人', value: 'registrant'},
                {text: '操作', value: 'collectActions', sortable: false},
            ],
            collectDesserts: [],
            collectEditedIndex: -1,
            collectEditedItem: {
                id: '',
                collectID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                collectMoney: '',
                percent: '',
                remark: '',
                collectDate: '',
                registrant: '',
                collectedMoney: '',
                paymentDays: '',
                pMark: '',
                mark: null,
            },
            collectDefaultItem: {
                id: '',
                collectID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                collectMoney: '',
                percent: '',
                remark: '',
                collectDate: '',
                registrant: '',
                collectedMoney: '',
                paymentDays: '',
                pMark: '',
                mark: null,
            },

            pay: false,
            payDialog: false,
            payDialogDelete: false,
            payHeaders: [
                {
                    text: '支付编号',
                    align: 'start',
                    sortable: false,
                    value: 'payID',
                },
                {text: '合同编号', value: 'agreementID'},
                {text: '支付金额(￥)', value: 'payMoney'},
                {text: '百分比(%)', value: 'percent'},
                {text: '备注', value: 'remark'},
                {text: '预支付日期', value: 'pDate'},
                {text: '支付日期', value: 'payDate'},
                {text: '登记人', value: 'registrant'},
                {text: '登记状态', value: 'status', sortable: false},
                {text: '操作', value: 'payActions', sortable: false},
            ],
            payDesserts: [],
            payEditedIndex: -1,
            payEditedItem: {
                id: '',
                payID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                payMoney: '',
                percent: '',
                remark: '',
                payDate: '',
                registrant: '',
                paidMoney: '',
                pDate: '',
                status: null,
                mark: null,
            },
            payDefaultItem: {
                id: '',
                payID: '',
                agreementName: '',
                agreementID: '',
                agreementMoney: '',
                payMoney: '',
                percent: '',
                remark: '',
                payDate: '',
                registrant: '',
                paidMoney: '',
                pDate: '',
                status: null,
                mark: null,
            },

            monthData: {
                dateSearch: '',
                monthTotalMoney: '',
                monthTotalCollected: '',
                monthTotalPaid: '',
            },

            labelMonthTotalMoney:null,
            labelMonthTotalCollected:null,
            labelMonthTotalPaid:null,
        }),

        computed: {
            formTitle() {
                return this.editedIndex === -1 ? '新增采购合同登记' : '编辑'
            },

            formCollectTitle() {
                return this.collectEditedIndex === -1 ? '新增收票登记' : '编辑'
            },

            formPayTitle() {
                return this.payEditedIndex === -1 ? '新增支付登记' : '编辑'
            },

            companyName() {
                return this.editedItem.companyName;
            },

            paymentDays(){
                return this.editedItem.paymentDays;
            },

        },

        watch: {
            dialog(val) {
                console.log(val)
                val || this.close()
            },
            dialogDelete(val) {
                val || this.closeDelete()
            },
            searchCompany() {
                this.companySearch()
            },
            collectDialog(val) {
                val || this.closeCollect()
            },
            collectDialogDelete(val) {
                val || this.collectCloseDelete()
            },
            payDialog(val) {
                val || this.closePay()
            },
            payDialogDelete(val) {
                val || this.payCloseDelete()
            },
            options: {
                handler() {
                    this.loadPurchaseContract()
                },
                deep: true,
            },
            companyName: {
                handler() {
                    for (let x = 0; x < this.companyItems.length; x++) {
                        if (this.companyItems[x].companyName == this.editedItem.companyName) {
                            this.editedItem.companyAddress = this.companyItems[x].companyAddress;
                            this.editedItem.bankName = this.companyItems[x].bankName;
                            this.editedItem.bankAccount = this.companyItems[x].bankAccount;
                        }
                    }
                },
                immediate: true,
            },
            paymentDays: {
                handler(){
                    if (this.editedItem.paymentDays == '其他'){
                        this.editedItem.paymentDays = '';
                        this.paymentItems = [30,60]
                    }
                },
                deep: true,
            },

        },

        filters: {

            formatTimer: function (value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "-" + MM + "-" + d;
            },
            formatNum: function (value) {
                if (value == null) {
                    return null;
                }
                let tempVal = parseFloat(value).toFixed(3)
                let realVal = tempVal.substring(0, tempVal.length - 1)
                return realVal
            }
        },

        methods: {
            signDateChanged() {
                this.$refs.menu.save(this.editedItem.signDate)
            },

            formatTimer(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                return y + "-" + MM + "-" + d;
            },

            formatYearMonth(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                return y + "-" + MM;
            },

            formatNowTime(value) {
                let date = new Date(value);
                let y = date.getFullYear();
                let MM = date.getMonth() + 1;
                MM = MM < 10 ? "0" + MM : MM;
                let d = date.getDate();
                d = d < 10 ? "0" + d : d;
                // let h = date.getHours();
                // h = h < 10 ? "0" + h : h;
                // let m = date.getMinutes();
                // m = m < 10 ? "0" + m : m;
                // let s = date.getSeconds();
                // s = s < 10 ? "0" + s : s;
                return y + "." + MM + "." + d + "#";
            },

            formatNum(value) {
                if (value == null) {
                    return 0.00;
                }
                let tempVal = parseFloat(value).toFixed(3)
                let realVal = tempVal.substring(0, tempVal.length - 1)
                return realVal
            },

            companySearch() {
                if (this.searchCompany != '') {
                    companyApi.getCompany({companyName: this.searchCompany}).then(result => {
                        if (result.rows != null) {
                            this.companyNameItems = [];
                            this.companyItems = [];
                            for (let x = 0; x < result.rows.length; x++) {
                                this.companyNameItems.push(result.rows[x].name);
                                this.companyMSG.companyName = result.rows[x].name;
                                this.companyMSG.companyAddress = result.rows[x].address;
                                this.companyMSG.bankName = result.rows[x].openAccount;
                                this.companyMSG.bankAccount = result.rows[x].bankNumber;
                                this.companyItems.push(this.companyMSG);
                                this.companyMSG = {
                                    companyName: null,
                                    companyAddress: null,
                                    bankName: null,
                                    bankAccount: null,
                                }
                            }
                        }
                    })
                }
            },

            collectDateChanged() {
                return this.$refs.menu2.save(this.collectEditedItem.collectDate);
            },

            payDateChanged() {
                return this.$refs.menu3.save(this.payEditedItem.payDate);
            },

            monthChanged() {
                this.loadMonthPurchaseContract();
                this.$refs.menu4.save(this.monthData.dateSearch)
                var MM = this.monthData.dateSearch.substr(5,2)
                this.labelMonthTotalPaid = MM + '月已支出总金额'
                this.labelMonthTotalCollected = MM + '月已收票总金额'
                this.labelMonthTotalMoney = MM + '月合同总金额'
            },

            //附件
            fileUpload(res) {
                for (let x = 0; x < res.files.length; x++) {
                    this.purchaseFiles.fileUrl = res.files[x].ftpPath;
                    this.purchaseFiles.fileName = res.files[x].fileName;
                    this.purchaseFiles.mark = this.editedItem.id;
                    this.editedItem.files.push(this.purchaseFiles);
                    this.purchaseFiles = {fileName: null, fileUrl: null, mark: null}
                }
            },

            resetClear() {
                this.clear = true
                this.paymentItems = [30,60,"其他"]
            },

            showFiles() {
                this.showPurchaseFiles = true;
                this.loadPurchaseFiles();
            },

            loadPurchaseFiles() {
                purchaseContractApi.showPurchaseFiles({id: this.editedItem.id}).then(result => {
                    console.log(result)
                    this.purchaseFilesDesserts = result;
                })
            },

            purchaseFilesDelete(item) {
                purchaseContractApi.deletePurchaseFile(item).then(result => {
                    if (result != null) {
                        this.loadPurchaseFiles();
                    }
                })
            },

            downloadFile(item) {
                let a = document.createElement('a');
                a.href = `/api/files/downloadFile?filePath=` + item.fileUrl + `&downloadFile=` + item.fileName;
                a.target = "_blank";
                a.click();
            },

            //采购合同
            loadPurchaseContract() {
                purchaseContractApi.getPurchaseContract(this.options).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]
                            result.rows[x].contractCollectP = Math.floor(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }

                            result.rows[x].contractPaidP = Math.floor(item.paidMoney * 100 / item.agreementMoney);
                            var tempP = result.rows[x].contractPaidP;
                            if (tempP == 0 || (tempP > 0 && tempP < 25)) {
                                result.rows[x].percentColorP = 'red';
                            } else if (tempP == 25 || (tempP > 25 && tempP < 50)) {
                                result.rows[x].percentColorP = 'yellow';
                            } else if (tempP == 50 || (tempP > 50 && tempP < 75)) {
                                result.rows[x].percentColorP = 'blue';
                            } else {
                                result.rows[x].percentColorP = 'green';
                            }
                        } catch (e) {
                            console.log(e);
                        }
                        var dateYM = this.formatYearMonth(new Date())
                        var MM = dateYM.substr(5,2)
                        this.labelMonthTotalPaid = MM + '月已支出总金额'
                        this.labelMonthTotalCollected = MM + '月已收票总金额'
                        this.labelMonthTotalMoney = MM + '月合同总金额'
                        purchaseContractApi.monthPurchaseContract({dateSearch: dateYM}).then(result => {
                            this.monthData.monthTotalMoney = 0;
                            this.monthData.monthTotalCollected = 0;
                            this.monthData.monthTotalPaid = 0;
                            for (let x = 0; x < result.rows.length; x++) {
                                this.monthData.monthTotalMoney += result.rows[x].agreementMoney;
                            }
                            this.monthData.monthTotalMoney = this.formatNum(this.monthData.monthTotalMoney);
                            this.monthData.monthTotalCollected = this.formatNum(result.monthTotalCollected);
                            this.monthData.monthTotalPaid = this.formatNum(result.monthTotalPaid);
                        })
                    }

                    this.defaultItem.signDate = this.formatTimer(new Date());
                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;

                }).catch(e => {
                    console.log("异常信息", e);
                });
            },

            editItem(item) {
                this.clear = true
                this.showPurchase = true
                this.tempAgreementID = item.agreementID
                this.editedIndex = this.desserts.indexOf(item)
                item.files = []
                this.editedItem = Object.assign({}, item)
                this.editedItem.signDate = this.formatTimer(item.signDate)
                this.dialog = true
                this.paymentItems = [30,60,"其他"]

            },

            deleteItem(item) {
                this.editedIndex = this.desserts.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialogDelete = true
            },

            deleteItemConfirm() {
                this.desserts.splice(this.editedIndex, 1)
                purchaseContractApi.deletePurchaseContract(this.editedItem).then(result => {
                    if (result == 1) {
                        this.loadPurchaseContract()
                    }
                })
                this.closeDelete()
            },

            close() {
                this.dialog = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                    this.clear = false
                    this.showPurchase = false
                })
            },

            closeDelete() {
                this.dialogDelete = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                })
            },

            save() {
                if (this.editedIndex > -1) {
                    if (this.editedItem.agreementID == null || this.editedItem.agreementID == '' || this.editedItem.agreementName == '' || this.editedItem.signDate == '' || this.editedItem.companyName == '' || this.editedItem.agreementMoney == '' || this.editedItem.paymentDays == '') {
                        alert("请完成必填项！！")
                        return false;
                    } else {
                        if (this.editedItem.agreementID != this.tempAgreementID) {
                            purchaseContractApi.getPurchaseContractIsExist({agreementID: this.editedItem.agreementID}).then(result => {
                                if (result.result == "已存在") {
                                    alert("合同编号已存在！")
                                    return false;
                                } else {
                                    purchaseContractApi.updatePurchaseContract(this.editedItem).then(result => {
                                        if (result != null) {
                                            this.loadPurchaseContract()
                                            this.close()
                                            this.reset()
                                        }
                                    });
                                }
                            });
                        } else {
                            purchaseContractApi.updatePurchaseContract(this.editedItem).then(result => {
                                if (result != null) {
                                    this.loadPurchaseContract()
                                    this.close()
                                    this.reset()
                                }
                            });
                        }
                    }
                } else {
                    if (this.editedItem.agreementID == null || this.editedItem.agreementID == '' || this.editedItem.agreementName == '' || this.editedItem.signDate == '' || this.editedItem.companyName == '' || this.editedItem.agreementMoney == '' || this.editedItem.paymentDays == '') {
                        alert("请完成必填项！！")
                        return false;
                    } else {

                        purchaseContractApi.getPurchaseContractIsExist({agreementID: this.editedItem.agreementID}).then(result => {
                            if (result.result == "已存在") {
                                alert("合同编号已存在！")
                                return false;
                            } else {
                                purchaseContractApi.insertPurchaseContract(this.editedItem).then(result => {
                                    if (result != null) {
                                        this.loadPurchaseContract()
                                        this.close()
                                        this.reset()
                                        this.tempAgreementID = null
                                    }
                                });
                            }
                        })
                    }
                }
            },

            reset() {
                this.clear = false;
                this.SalesFiles = {
                    fileName: null,
                    fileUrl: null,
                    mark: null,
                }
                this.editedItem.files = [];
            },

            //收票
            loadCollectMSG(id) {

                purchaseContractApi.getPurchaseCollect({id: id}).then(result => {
                    if (result != null) {
                        this.collectDesserts = result.rows;
                    }
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },

            collectAction(item) {
                this.collectEditedItem.agreementName = item.agreementName;
                this.collectEditedItem.agreementID = item.agreementID;
                this.collectEditedItem.agreementMoney = item.agreementMoney;
                this.collectEditedItem.collectedMoney = item.collectedMoney;
                this.collectEditedItem.paymentDays = item.paymentDays;
                this.collectEditedItem.mark = item.id;
                var date = new Date();
                this.collectEditedItem.collectID = this.formatNowTime(date);
                this.collectEditedItem.collectDate = this.formatTimer(date);


                this.collectDefaultItem.agreementName = item.agreementName;
                this.collectDefaultItem.agreementID = item.agreementID;
                this.collectDefaultItem.agreementMoney = item.agreementMoney;
                this.collectDefaultItem.collectedMoney = item.collectedMoney;
                this.collectDefaultItem.paymentDays = item.paymentDays;
                this.collectDefaultItem.collectedPercent = item.contractCollectP;
                this.collectDefaultItem.mark = item.id;
                var date1 = new Date();
                this.collectDefaultItem.collectID = this.formatNowTime(date1)
                this.collectDefaultItem.collectDate = this.formatTimer(date1);
                this.collect = true;
                this.loadCollectMSG(item.id);

            },

            collectDeleteItem(item) {
                this.collectEditedIndex = this.collectDesserts.indexOf(item)
                this.collectEditedItem = Object.assign({}, item)
                this.collectDelete = true
            },

            collectDeleteItemConfirm() {
                this.collectDesserts.splice(this.collectEditedIndex, 1)
                purchaseContractApi.deletePurchaseCollect(this.collectEditedItem).then(result => {
                    if (result != null) {
                        this.loadCollectMSG(this.collectEditedItem.mark);
                        this.loadPurchaseContract();
                        this.collectCloseDelete();
                    }
                });
            },

            closeCollect() {
                this.collectDialog = false;
                this.$nextTick(() => {
                    this.collectEditedItem = Object.assign({}, this.collectDefaultItem)
                    this.collectEditedIndex = -1
                })
            },

            collectCloseDelete() {
                this.collectDelete = false
                this.$nextTick(() => {
                    this.collectEditedItem = Object.assign({}, this.collectDefaultItem)
                    this.collectEditedIndex = -1
                })
            },

            saveCollect() {
                if (this.collectEditedIndex > -1) {
                    if (this.collectEditedItem.collectMoney == '' || this.collectEditedItem.percent == '') {
                        alert("请完成必填项！！")
                        return false;
                    }
                    Object.assign(this.collectDesserts[this.collectEditedItem], this.collectEditedItem)
                } else {
                    if (this.collectEditedItem.collectMoney == '' || this.collectEditedItem.percent == '') {
                        alert("请完成必填项！！")
                        return false;
                    } else {
                        // this.invoiceEditedItem.pMark = this.formatMarkTime(new Date())
                        this.collectDesserts.push(this.collectEditedItem);
                        purchaseContractApi.insertPurchaseCollect(this.collectEditedItem).then(result => {
                            if (result == 1) {
                                if (this.monthData.dateSearch != '') {
                                    this.closeCollect();
                                    this.loadCollectMSG(this.collectEditedItem.mark);
                                    this.loadMonthPurchaseContract()
                                } else if (this.monthData.dateSearch == '') {
                                    this.closeCollect();
                                    this.loadCollectMSG(this.collectEditedItem.mark);
                                    this.loadPurchaseContract();
                                }
                            }
                        });
                    }


                }
            },

            percentOfCollectMoney() {
                this.collectEditedItem.collectMoney = this.formatNum(this.collectEditedItem.percent / 100 * this.collectEditedItem.agreementMoney);
            },

            collectMoneyOfPercent() {
                this.collectEditedItem.percent = this.formatNum(this.collectEditedItem.collectMoney / this.collectEditedItem.agreementMoney * 100);
            },

            //支付
            loadPayMSG(id) {

                purchaseContractApi.getPurchasePay({id: id}).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        if (result.rows[x].pDate != "" && result.rows[x].pDate != null) {
                            result.rows[x].pDate = this.formatTimer(result.rows[x].pDate)
                        } else if (result.rows[x].pDate == '' || result.rows[x].pDate == null) {
                            result.rows[x].pDate = '';
                        }
                        if (result.rows[x].payDate != "" && result.rows[x].payDate != null) {
                            result.rows[x].payDate = this.formatTimer(result.rows[x].payDate)
                        } else {
                            result.rows[x].payDate = '';
                        }
                        if (result.rows[x].status == '未审核') {
                            result.rows[x].statusCheck = false;
                        } else if (result.rows[x].status == '已审核') {
                            result.rows[x].statusCheck = true;
                        }
                    }
                    this.payDesserts = result.rows;
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },

            payAction(item) {
                this.payEditedItem.agreementName = item.agreementName;
                this.payEditedItem.agreementID = item.agreementID;
                this.payEditedItem.agreementMoney = item.agreementMoney;
                this.payEditedItem.paidMoney = item.paidMoney;
                this.payEditedItem.mark = item.mark;
                var date = new Date();
                this.payEditedItem.payID = this.formatNowTime(date);
                this.payEditedItem.payDate = this.formatTimer(date);

                this.payDefaultItem.agreementName = item.agreementName;
                this.payDefaultItem.agreementID = item.agreementID;
                this.payDefaultItem.agreementMoney = item.agreementMoney;
                this.payDefaultItem.paidMoney = item.paidMoney;
                this.payDefaultItem.paidPercent = item.contractPaidP;
                this.payEditedItem.mark = item.id;
                var date1 = new Date();
                this.payDefaultItem.payID = this.formatNowTime(date1);
                this.payDefaultItem.payDate = this.formatTimer(date1);
                this.pay = true;
                this.loadPayMSG(item.id);

            },

            payDeleteItem(item) {
                this.payEditedIndex = this.payDesserts.indexOf(item)
                this.payEditedItem = Object.assign({}, item)
                this.payDialogDelete = true
            },

            payDeleteItemConfirm() {
                this.payDesserts.splice(this.payEditedIndex, 1)
                purchaseContractApi.deletePurchasePay(this.payEditedItem).then(result => {
                    if (result != null) {
                        this.loadPayMSG(this.payEditedItem.mark);
                        this.loadPurchaseContract();
                        this.payCloseDelete();
                    }
                });
            },

            closePay() {
                this.payDialog = false;
                this.$nextTick(() => {
                    this.payEditedItem = Object.assign({}, this.payDefaultItem)
                    this.payEditedIndex = -1
                })
            },

            payCloseDelete() {
                this.payDialogDelete = false
                this.$nextTick(() => {
                    this.payEditedItem = Object.assign({}, this.payDefaultItem)
                    this.payEditedIndex = -1
                })
            },

            savePay() {
                if (this.payEditedIndex > -1) {
                    if (this.payEditedItem.collectMoney == '' || this.payEditedItem.percent == '') {
                        alert("请完成必填项！")
                        return false;
                    }
                    Object.assign(this.payDesserts[this.payEditedItem], this.payEditedItem)
                } else {
                    if (this.payEditedItem.payMoney == '' || this.payEditedItem.percent == '') {
                        alert("请完成必填项！")
                        return false;
                    }
                    this.payDesserts.push(this.payEditedItem);
                    purchaseContractApi.insertPurchasePay(this.payEditedItem).then(result => {
                        if (result != null) {
                            if (this.monthData.dateSearch != '') {
                                this.closePay();
                                this.loadPayMSG(this.payEditedItem.mark);
                                this.loadMonthPurchaseContract();
                            } else if (this.monthData.dateSearch == '') {
                                this.closePay();
                                this.loadPayMSG(this.payEditedItem.mark);
                                this.loadPurchaseContract();
                            }
                        }
                    });
                }
            },

            percentOfPayMoney() {
                this.payEditedItem.payMoney = this.formatNum(this.payEditedItem.percent / 100 * this.payEditedItem.agreementMoney);
            },

            payMoneyOfPercent() {
                this.payEditedItem.percent = this.formatNum(this.payEditedItem.collectMoney / this.payEditedItem.agreementMoney * 100);
            },

            Check(item) {
                if (item.status == '未审核') {
                    item.status = '已审核';
                    purchaseContractApi.checkStatus(item).then(result => {
                        if (result != null) {
                            if (this.monthData.dateSearch != '') {
                                this.loadPayMSG(item.mark);
                                this.loadMonthPurchaseContract();
                            } else if (this.monthData.dateSearch == '') {
                                this.loadPayMSG(item.mark);
                                this.loadPurchaseContract();
                            }
                        }
                    })
                    return item.status = '已审核';
                } else if (item.status == '已审核') {
                    item.status = '未审核';
                    purchaseContractApi.checkStatus(item).then(result => {
                        if (result != null) {
                            if (this.monthData.dateSearch != '') {
                                this.loadPayMSG(item.mark);
                                this.loadMonthPurchaseContract();
                            } else if (this.monthData.dateSearch == '') {
                                this.loadPayMSG(item.mark);
                                this.loadPurchaseContract();
                            }
                        }
                    })
                    return item.status = '未审核';
                }
            },

            //月采购合同
            loadMonthPurchaseContract() {
                purchaseContractApi.monthPurchaseContract({dateSearch: this.monthData.dateSearch}).then(result => {
                    this.monthData.monthTotalMoney = 0;
                    this.monthData.monthTotalCollected = 0;
                    this.monthData.monthTotalPaid = 0;
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]
                            result.rows[x].contractCollectP = Math.floor(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }

                            result.rows[x].contractPaidP = Math.floor(item.paidMoney * 100 / item.agreementMoney);
                            var tempP = result.rows[x].contractPaidP;
                            if (tempP == 0 || (tempP > 0 && tempP < 25)) {
                                result.rows[x].percentColorP = 'red';
                            } else if (tempP == 25 || (tempP > 25 && tempP < 50)) {
                                result.rows[x].percentColorP = 'yellow';
                            } else if (tempP == 50 || (tempP > 50 && tempP < 75)) {
                                result.rows[x].percentColorP = 'blue';
                            } else {
                                result.rows[x].percentColorP = 'green';
                            }

                            this.monthData.monthTotalMoney += result.rows[x].agreementMoney;
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    this.monthData.monthTotalMoney = this.formatNum(this.monthData.monthTotalMoney);
                    this.monthData.monthTotalCollected = this.formatNum(result.monthTotalCollected);
                    this.monthData.monthTotalPaid = this.formatNum(result.monthTotalPaid);
                    this.defaultItem.signDate = this.formatTimer(new Date());
                    this.desserts = result.rows;
                })
            },

            //搜索
            searchContract() {
                purchaseContractApi.getSearchContract({search: this.search}).then(result => {
                    for (let x = 0; x < result.rows.length; x++) {
                        try {
                            var item = result.rows[x]
                            result.rows[x].contractCollectP = Math.floor(item.collectedMoney * 100 / item.agreementMoney);
                            var tempC = result.rows[x].contractCollectP;
                            if (tempC == 0 || (tempC > 0 && tempC < 25)) {
                                result.rows[x].percentColorC = 'red';
                            } else if (tempC == 25 || (tempC > 25 && tempC < 50)) {
                                result.rows[x].percentColorC = 'yellow';
                            } else if (tempC == 50 || (tempC > 50 && tempC < 75)) {
                                result.rows[x].percentColorC = 'blue';
                            } else {
                                result.rows[x].percentColorC = 'green';
                            }

                            result.rows[x].contractPaidP = Math.floor(item.paidMoney * 100 / item.agreementMoney);
                            var tempP = result.rows[x].contractPaidP;
                            if (tempP == 0 || (tempP > 0 && tempP < 25)) {
                                result.rows[x].percentColorP = 'red';
                            } else if (tempP == 25 || (tempP > 25 && tempP < 50)) {
                                result.rows[x].percentColorP = 'yellow';
                            } else if (tempP == 50 || (tempP > 50 && tempP < 75)) {
                                result.rows[x].percentColorP = 'blue';
                            } else {
                                result.rows[x].percentColorP = 'green';
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    this.defaultItem.signDate = this.formatTimer(new Date());
                    this.desserts = result.rows;
                    this.totalDesserts = result.totalDesserts;
                }).catch(e => {
                    console.log("异常信息", e);
                });
            },
        }
    }
</script>