<template>
  <div>
    <v-row>
      <v-col lg="2" sm="2">
        <v-btn v-if="type == null" small color="primary" @click="openDialog">新增</v-btn>
        <v-btn @click="downloadExcel" small :loading="loading" class="ml-1">导出</v-btn>
      </v-col>
      <v-col lg="8" md="8" sm="8">
        <v-select v-if="false" :item="['本年应收合计','财务已收','已收保证金','已退保证金','开票合计']"
                  multiple></v-select>
        <v-chip>{{ '本年应收合计：' + yearMoney }}</v-chip>
        <v-chip>{{ '财务已收：' + cwMoney }}</v-chip>
        <v-chip>{{ '开票合计：' + kpMoney }}</v-chip>
        <v-chip>{{ '已收保证金：' + bzjMoney }}</v-chip>
        <v-chip>{{ '当前欠租：' + earlyMoney }}</v-chip>
      </v-col>
      <v-col lg="2" sm="2">
        <v-text-field dense label="搜索" v-model="query.searchText" @change="list"></v-text-field>
      </v-col>
    </v-row>
    <v-data-table
        class="cursor"
        :items="items"
        :items-per-page="10"
        :loading="loading"
        :server-items-length="total"
        :options.sync="options"
        sort-by="series"
        @dblclick:row="detail"
        :headers="headers">


      <!--<template v-slot:item.djYsMoney="{item}">
          <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">{{item.djYsMoney}}</div>
              </template>
              <div>
                  <h3>“目前应收”金额计算公式如下</h3>
                  <p>年付方式:直接显示应收租金</p>
                  <p>季度方式:应收租金 / 4 * 当前季度</p>
                  <p>月付方式:应收租金 / 12 * 当前月份数</p>
              </div>
          </v-tooltip>
      </template>-->


      <template v-slot:item="{item}">
        <tr class="red--text text--lighten-1" v-if="isEnd(item.endDatetime)">
          <td class="text-start">
            {{ item.series }}
          </td>
          <td class="text-start">
            {{ item.brandCompany.name }}
          </td>
          <td class="text-start">
            {{ item.brand }}
          </td>
          <td class="text-start">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <div v-for="(h) in item.houses" :key="'houses'+h.id">
                    <span>{{ h.pwNumber }}</span>
                  </div>
                </div>
              </template>
              <div v-for="(h) in item.houses" :key="h.id">
                <span>{{ h.pwNumber + " 面积:" + h.acreage }}</span>
              </div>
            </v-tooltip>
          </td>

          <td class="text-start">
            {{ item.acreage }}
          </td>
          <td class="text-start">
            {{ item.yearRental }}
          </td>
          <td class="text-start">
            {{ item.ysMoney }}
          </td>
          <td class="text-start">
            {{ item.cwMoney }}
          </td>
          <td class="text-start">
            {{ item.kjType[0].series }}
          </td>
          <td class="text-start">
            {{ item.kjType[0].money }}
          </td>
          <td class="text-start">
            <v-btn x-small @click="detail($event,{item:item})">明细</v-btn>
            <v-btn v-if="showDelete" class="ml-1" color="error" x-small @click="deleteItem(item)">删除
            </v-btn>
          </td>
        </tr>

        <tr class="light-blue--text text--darken-1" v-else-if="isPay(item)">
          <td class="text-start">
            {{ item.series }}
          </td>
          <td class="text-start">
            {{ item.brandCompany.name }}
          </td>
          <td class="text-start">
            {{ item.brand }}
          </td>
          <td class="text-start">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <div v-for="(h) in item.houses" :key="'houses'+h.id">
                    <span>{{ h.pwNumber }}</span>
                  </div>
                </div>
              </template>
              <div v-for="(h) in item.houses" :key="h.id">
                <span>{{ h.pwNumber + " 面积:" + h.acreage }}</span>
              </div>
            </v-tooltip>
          </td>

          <td class="text-start">
            {{ item.acreage }}
          </td>
          <td class="text-start">
            {{ item.yearRental }}
          </td>
          <td class="text-start">
            {{ item.ysMoney }}
          </td>
          <td class="text-start">
            {{ item.cwMoney }}
          </td>
          <td class="text-start">
            {{ item.kjType[0].series }}
          </td>
          <td class="text-start">
            {{ item.kjType[0].money }}
          </td>
          <td class="text-start">
            <v-btn x-small @click="detail($event,{item:item})">明细</v-btn>
            <v-btn v-if="showDelete" class="ml-1" color="error" x-small @click="deleteItem(item)">
              删除
            </v-btn>
          </td>
        </tr>

        <tr v-else>
          <td class="text-start">
            {{ item.series }}
          </td>
          <td class="text-start">
            {{ item.brandCompany.name }}
          </td>
          <td class="text-start">
            {{ item.brand }}
          </td>
          <td class="text-start">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <div v-for="(h) in item.houses" :key="'houses'+h.id">
                    <span>{{ h.pwNumber }}</span>
                  </div>
                </div>
              </template>
              <div v-for="(h) in item.houses" :key="h.id">
                <span>{{ h.pwNumber + " 面积:" + h.acreage }}</span>
              </div>
            </v-tooltip>
          </td>

          <td class="text-start">
            {{ item.acreage }}
          </td>
          <td class="text-start">
            {{ item.yearRental }}
          </td>
          <td class="text-start">
            {{ item.ysMoney }}
          </td>
          <td class="text-start">
            {{ item.cwMoney }}
          </td>
          <td class="text-start">
            {{ item.kjType[0].series }}
          </td>
          <td class="text-start">
            {{ item.kjType[0].money }}
          </td>
          <td class="text-start">
            <v-btn x-small @click="detail($event,{item:item})">明细</v-btn>
            <v-btn v-if="showDelete" class="ml-1" color="error" x-small @click="deleteItem(item)">
              删除
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" @close="dialog = false" fullscreen>
      <v-card class="pa-5">
        <v-form ref="zujinForm" class="pt-5">
          <v-row dense class="mr-0">
            <v-col sm="1">
              <v-text-field :disabled="offEdit" dense label="合同编号" :rules="rules.series"
                            v-model="data.series"></v-text-field>
            </v-col>
            <v-col sm="3">
              <v-text-field :disabled="offEdit" dense label="租赁方" :rules="rules.company"
                            v-model="data.brandCompany.name"></v-text-field>
            </v-col>
            <v-col sm="1">
              <v-text-field :disabled="offEdit" dense label="品牌" :rules="rules.brand"
                            v-model="data.brand"></v-text-field>
            </v-col>
            <v-col sm="1">
              <v-text-field :disabled="offEdit" type="number" dense label="应收物业费"
                            :rules="rules.yearRental"
                            v-model="data.yearRental"></v-text-field>
            </v-col>
            <v-col sm="1">
              <v-select :disabled="offEdit" dense :items="payTypes" label="付费方式"
                        v-model="data.payType"></v-select>
            </v-col>
            <v-col sm="1">
              <v-menu v-model="menu4"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="data.endDatetime"
                                :rules="rules.endDatetime"
                                label="合同截止日期"
                                :disabled="offEdit"
                                dense
                                hide-details
                                readonly
                                v-bind="attrs"
                                v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="data.endDatetime" no-title scrollable></v-date-picker>
              </v-menu>
            </v-col>
            <v-col sm="2">
              <v-text-field :disabled="offEdit" dense label="租赁联系人"
                            v-model="data.zlPerson"></v-text-field>
            </v-col>
            <v-col sm="2">
              <v-text-field :disabled="offEdit" dense label="联系手机号"
                            v-model="data.zlPersonTel"></v-text-field>
            </v-col>
            <v-col sm="4"></v-col>
            <v-col sm="4" style="position:absolute;left: 0;top:75px">
              <v-textarea :disabled="offEdit" dense rows="4" label="备注"
                          v-model="data.remark"></v-textarea>
            </v-col>
            <v-col sm="2">
              <v-radio-group dense v-model="data.zlType" @change="houseSelect" row :disabled="offEdit">
                <v-radio :value="0" label="固定商铺"></v-radio>
                <v-radio :value="1" label="机动" @click="$refs.acreage.focus()"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col sm="2">
              <v-autocomplete :items="houseList"
                              dense
                              multiple
                              v-model="data.houses"
                              :search-input.sync="searchHouse"
                              :disabled="data.zlType === 1"
                              :error-messages="houseMessage"
                              @change="houseChange"
                              return-object
                              item-value="id"
                              item-text="temp"
                              auto-select-first
                              placeholder="请选择商铺位置"
                              title="支持多选，可输入商铺/楼层编号筛选"
                              append-icon="mdi-map-marker"
                              @click:append="openMap"
                              label="商铺位置">
              </v-autocomplete>

            </v-col>
            <v-col sm="2">
              <v-select :disabled="offEdit" dense label="业态" placeholder="请选择业态" v-model="data.yt"
                        :items="yitaiItems"
                        item-text="name" :rules="rules.yt"
                        return-object></v-select>
            </v-col>
            <v-col sm="2">
              <v-text-field type="number"
                            label="租赁面积"
                            :disabled="offEdit"
                            dense
                            ref="acreage"
                            :error-messages="acreageMessage"
                            @change="acreageMessage = null"
                            v-model="data.acreage"></v-text-field>
            </v-col>

            <v-col sm="2" offset="4">
              <v-checkbox dense label="有无孰商" v-model="data.sh" :disabled="offEdit"
                          style="position:absolute;margin-top: 30px"></v-checkbox>
              <v-checkbox label="有无递增" @change="dzNumberError = null" dense class="mt-0"
                          hide-details v-model="data.dz"></v-checkbox>

            </v-col>
            <v-col sm="1">
              <v-text-field :disabled="!data.dz"
                            label="递增比例"
                            v-model="data.dzNumber"
                            dense
                            :error-messages="dzNumberError"
                            append-icon="%"></v-text-field>
            </v-col>
            <v-col sm="1">
              <v-text-field dense label="招商经办人" v-model="data.staffName"></v-text-field>
            </v-col>
            <v-col sm="2" v-if="data.id != null">
              <v-menu v-model="menu5"
                      bottom
                      right
                      transition="scale-transition"
                      origin="top left">
                <template v-slot:activator="{ on }">
                  <v-chip pill v-on="on" :disabled="offEdit">
                    {{ '保证金:' + bzjMoneyCount }}
                    <v-avatar right @click.stop="bzjDialog = true">
                      <v-icon>mdi-plus</v-icon>
                    </v-avatar>
                  </v-chip>
                </template>
                <v-data-table :headers="bzjHeaders"
                              sort-by="datetime"
                              sort-desc
                              :items="bzjItems">
                  <template v-slot:item.datetime="{item}">
                    {{ dateFormat(new Date(item.datetime), 'YYYY-mm-dd') }}
                  </template>
                  <template v-slot:item.action="{item}">
                    <v-btn x-small color="error" @click.stop="deleteBzjHandler(item.id)">删除</v-btn>
                  </template>
                </v-data-table>
              </v-menu>
            </v-col>
            <v-col sm="2" v-if="data.id != null">
              <v-row key="row-sm-2" dense class="white">
                <v-col style="background-color: rgba(218, 150, 148, 1);" cols="6">期初未开票
                </v-col>
                <v-col class="cursor" cols="6" style="background-color: rgba(218, 150, 148, 1)">
                  <v-text-field @change="updateQcOweMoney(data.billOwe)" type="number"
                                :disabled="offEdit"
                                @focus="$event.target.select()" hide-details dense
                                v-model="data.billOwe.oweMoney"></v-text-field>
                </v-col>

                <v-col style="background-color: rgba(0, 176, 240, 1)" cols="6">期初欠物业费</v-col>
                <v-col class="cursor" cols="6" style="background-color: rgba(0, 176, 240, 1)">
                  <v-text-field @change="updateQcOweMoney(data.moneyOwe)" type="number"
                                :disabled="offEdit"
                                @focus="$event.target.select()" hide-details dense
                                v-model="data.moneyOwe.oweMoney"></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
        <v-row class="mr-0">
          <v-col cols="7" class="overflow-y-auto">
            <v-data-table :headers="headers2"
                          class="cursor"
                          :loading="detailLoading"
                          @click:row="editDetailItem"
                          hide-default-footer
                          dense
                          height="300"
                          :items-per-page="-1"
                          :items="ysMoneyItems">
              <template v-slot:top>
                <v-btn v-if="data.id != null" x-small color="primary" @click="newLine(ysMoneyItems)"
                       :disabled="offInsert">
                  收款登记
                </v-btn>
                <!--<v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip v-bind="attrs" v-on="on" x-small>目前应收:{{data.djYsMoney}}</v-chip>
                    </template>
                    <div>
                        <h3>“目前应收”金额计算公式如下</h3>
                        <p>年付方式:直接显示应收物业费</p>
                        <p>季度方式:应收物业费 / 4 * 当前季度</p>
                        <p>月付方式:应收物业费 / 12 * 当前月份数</p>
                    </div>
                </v-tooltip>-->
                <v-chip x-small>应收合计:{{ ysMoneyCount.toFixed(2) }}</v-chip>
                <v-chip x-small>实收合计:{{ sjMoneyCount.toFixed(2) }}</v-chip>
              </template>

              <template v-slot:item.index="{item}">
                <v-btn absolute style="left: 5px;margin-top: -10px" v-if="item.edit" x-small
                       color="primary" @click.stop="savePro()">保存
                </v-btn>
                <v-btn absolute style="left:55px;margin-top: -10px" v-if="item.edit" x-small
                       color="error" @click.stop="cancelInsert()">取消
                </v-btn>
                <div v-else>{{ item.index }}</div>
              </template>

              <template v-slot:item.proDate="{item}">
                <v-menu :ref="item.id"
                        v-if="item.edit"
                        v-model="menu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="item.proDate"
                                  class="pa-0"
                                  :ref="item.id+'proDate'"
                                  autofocus
                                  dense
                                  hide-details
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"></v-text-field>
                  </template>
                  <v-date-picker @input="dateChange(item,'proDate')" v-model="item.proDate" no-title
                                 scrollable></v-date-picker>
                </v-menu>
                <div v-else @click.stop="editDetailItem('proDate',item)">{{ item.proDate }}</div>
              </template>

              <template v-slot:item.proMoney="{item}">
                <v-text-field hide-details
                              :ref="item.id+'proMoney'"
                              type="number"
                              class="pa-0"
                              dense
                              @keydown.enter="savePro"
                              v-if="item.edit"
                              v-model="item.proMoney"></v-text-field>
                <div v-else @click.stop="editDetailItem('proMoney',item)">{{ item.proMoney }}</div>
              </template>

              <template v-slot:item.putDate="{item}">
                <v-menu :ref="item.id"
                        v-if="item.edit"
                        v-model="menu2"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="item.putDate"
                                  class="pa-0"
                                  :ref="item.id+'putDate'"
                                  autofocus
                                  dense
                                  hide-details
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"></v-text-field>
                  </template>
                  <v-date-picker @input="dateChange(item,'putDate')" v-model="item.putDate" no-title
                                 scrollable></v-date-picker>
                </v-menu>
                <div v-else @click.stop="editDetailItem('putDate',item)">{{ item.putDate }}</div>
              </template>

              <template v-slot:item.putMoney="{item}">
                <v-text-field hide-details :ref="item.id+'putMoney'" type="number" class="pa-0" dense
                              @keydown.enter="savePro"
                              v-if="item.edit"
                              v-model="item.putMoney"></v-text-field>
                <div v-else @click.stop="editDetailItem('putMoney',item)">{{ item.putMoney }}</div>
              </template>
              <template v-slot:item.remark="{item}">
                <v-text-field hide-details
                              @keydown.enter="savePro"
                              :ref="item.id+'remark'"
                              class="pa-0"
                              dense
                              v-if="item.edit"
                              v-model="item.remark"></v-text-field>
                <div v-else @click.stop="editDetailItem('remark',item)">{{ item.remark }}</div>
              </template>
            </v-data-table>
          </v-col>
          <v-col cols="5" class="overflow-y-auto">
            <v-data-table :loading="detailLoading2"
                          class="cursor"
                          @click:row="editDetailItem2"
                          calculate-widths
                          dense
                          hide-default-footer
                          height='300'
                          :items-per-page="-1"
                          :items="cwMoneyItems">
              <template v-slot:top>
                <v-btn v-if="data.id != null && !offEdit" x-small color="primary"
                       @click="newLine2(cwMoneyItems)"
                       :disabled="offInsert">
                  财务登记
                </v-btn>
                <v-btn x-small color="primary" @click="newLine2(cwMoneyItems)" :disabled="true"
                       title="未检测到T3帐套信息">
                  用友T3数据
                </v-btn>
                <v-btn v-if="data.id != null && !offEdit" x-small color="primary"
                       @click="newLine3(billItems)"
                       :disabled="offInsert">
                  会计科目
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn v-if="detailItem.edit && !offEdit" :disabled="!offInsert" :loading="saveLoading"
                       x-small
                       color="primary" @click.stop="savePay">保存
                </v-btn>
                <v-btn v-if="detailItem.edit && !offEdit" :disabled="!offInsert" :loading="saveLoading"
                       x-small
                       color="error" @click.stop="cancelInsert">取消
                </v-btn>
              </template>
              <template v-slot:body>
                <thead>
                <tr>
                  <template v-for="(headerItem1, idx1) in headers3">
                    <th :colspan="headerItem1.colspan"
                        :width="headerItem1.width"
                        class="text-center"
                        :key="'header1'+idx1" :style="{ textAlign: headerItem1.align }">
                      {{ headerItem1.text }}
                    </th>
                  </template>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item , idx) in cwMoneyItems" :key="'tbody'+idx">
                  <td @click="editDetailItem2('proDate',item)" width="30%">
                    <v-text-field v-model="item.billDate"
                                  title="开票日期"
                                  :ref="item.id+'proDate'"
                                  @keydown.enter="savePay"
                                  v-if="!offEdit && item.edit"
                                  class="pa-0 mt-0"
                                  autofocus
                                  dense
                                  hide-details></v-text-field>
                    <div v-if="!offEdit && !item.edit" @click.stop="editDetailItem('proDate',item)">
                      {{ item.billDate }}
                    </div>
                    <div v-if="offEdit">{{ item.billDate }}</div>

                  </td>
                  <td @click="editDetailItem('billMoney',item)" width="20%">
                    <v-text-field class="pa-0 mt-0"
                                  :ref="item.id+'billMoney'"
                                  @keydown.enter="savePay"
                                  hide-details
                                  v-if="!offEdit && item.edit"
                                  title="开票金额"
                                  type="number"
                                  v-model="item.billMoney"
                                  dense></v-text-field>
                    <div v-if="!offEdit && !item.edit">{{ item.billMoney }}</div>
                    <div v-if="offEdit">{{ item.billMoney }}</div>
                  </td>
                  <td @click="editDetailItem2('payDate',item)" width="30%">
                    <v-text-field v-model="item.payDate"
                                  v-if="!offEdit && item.edit"
                                  @keydown.enter="savePay"
                                  title="收款日期"
                                  :ref="item.id+'payDate'"
                                  class="pa-0 mt-0"
                                  autofocus
                                  dense
                                  hide-details></v-text-field>
                    <div v-if="!offEdit && !item.edit">{{ item.payDate }}</div>
                    <div v-if="offEdit">{{ item.payDate }}</div>
                  </td>
                  <td @click="editDetailItem('payMoney',item)" width="20%">
                    <v-text-field class="pa-0 mt-0"
                                  :ref="item.id+'payMoney'"
                                  @keydown.enter="savePay"
                                  hide-details
                                  title="收款金额"
                                  type="number"
                                  v-if="!offEdit && item.edit"
                                  v-model="item.payMoney"
                                  dense></v-text-field>
                    <div v-if="!offEdit && !item.edit">{{ item.payMoney }}</div>
                    <div v-if="offEdit">{{ item.payMoney }}</div>
                  </td>
                </tr>
                </tbody>
                <tfoot>
                <tr>
                  <td class="border-top">合计</td>
                  <td class="border-top">{{ billCount }}</td>
                  <td class="border-top"></td>
                  <td class="border-top">{{ payCount }}</td>
                </tr>
                <tr v-for="(billItem,idx) in billItems" :key="'tfoot'+idx"
                    :title="`第一条账面欠物业费（会计科目余额）金额计算公式：期初欠物业费${item.moneyOwe.oweMoney}-期初未开票${item.billOwe.oweMoney}+开票情况合计数${billCount}-收款情况合计${payCount}`">
                  <td class="border-top">
                    <div>账面欠费</div>
                  </td>
                  <td class="border-top" colspan="2" @click="editDetailItem2('series',billItem)">
                    <v-text-field v-if="!offEdit && billItem.edit" hide-details dense
                                  :ref="billItem.id+'series'"
                                  autofocus placeholder="请输入科目名称"
                                  v-model="billItem.series"></v-text-field>
                    <div v-if="!offEdit && !billItem.edit">{{ billItem.series }}</div>
                    <div v-if="offEdit">{{ billItem.series }}</div>
                  </td>
                  <td class="border-top" style="background-color: rgba(190,160,199,1)"
                      @click="editDetailItem2('money',billItem)">
                    <v-text-field v-if="!offEdit && billItem.edit" hide-details dense
                                  :ref="billItem.id+'money'"
                                  v-model="billItem.money"></v-text-field>
                    <div v-if="!offEdit && !billItem.edit">{{ getZmMoney(billItem) }}</div>
                    <div v-if="offEdit">{{ getZmMoney(billItem) }}</div>
                  </td>
                </tr>
                <!--                                V1版本:title="`计算公式：期初欠物业费${data.moneyOwe.oweMoney}+实收合计${sjMoneyCount.toFixed(2)}-财务收款合计${payCount}`"-->
                <!--                                V2版本：:title="`计算公式：第一个账面欠款（会计科目）${data.kjType[0].money}>0，则显示该账面欠款（会计科目）金额：${data.kjType[0].money}`"-->
                <tr :title="`计算公式：第一个账面欠物业费（会计科目）${item.kjType[0].money}>0，则显示该账面欠物业费（会计科目）金额：${item.kjType[0].money}`">
                  <td class="border-top">
                    <div>实际欠费</div>
                  </td>
                  <td class="border-top" colspan="2">
                  </td>
                  <td class="border-top">
                    <div>{{ getSjQMoney() }}</div>
                  </td>
                </tr>
                <!--                                V1版本:title="`计算公式：期初未开票${data.billOwe.oweMoney}+实收合计${sjMoneyCount.toFixed(2)}-财务开票合计${billCount}`"-->
                <tr :title="`计算公式：第一个账面欠物业费（会计科目）${item.kjType[0].money}<=0，则显示该账面欠物业费（会计科目）金额：${item.kjType[0].money}`">
                  <td class="border-top">
                    <div>未开发票</div>
                  </td>
                  <td class="border-top" colspan="2">
                  </td>
                  <td class="border-top">
                    <div>{{ getNoBillMoney() }}</div>
                  </td>
                </tr>
                </tfoot>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="insertZujin" color="primary">确定</v-btn>
          <v-btn @click="dialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteDialog" @close="deleteDialog = false" width="30%">
      <v-card>
        <v-card-actions>
          <v-card-title>确定删除:{{ item.series }}？</v-card-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="deleteZujin" autofocus>确定</v-btn>
          <v-btn @click="deleteDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="bzjDialog" @click="bzjDialog = false" width="30%">
      <v-card class="pa-5">
        <v-card-title>保证金登记</v-card-title>
        <v-form ref="bzjForm">
          <v-text-field :rules="bzjRules.money" label="保证金金额" type="number"
                        v-model="bzj.money"></v-text-field>
          <v-autocomplete label="类型"
                          :rules="bzjRules.type"
                          :items="bzjTypeItems"
                          :search-input.sync="searchBzjType"
                          auto-select-first
                          v-model="bzj.type"></v-autocomplete>
          <v-menu
              v-model="bzjMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="bzj.datetime"
                            :rules="bzjRules.datetime"
                            label="日期"
                            readonly
                            v-bind="attrs"
                            v-on="on"></v-text-field>
            </template>
            <v-date-picker @change="bzjMenu = false" v-model="bzj.datetime" no-title
                           scrollable></v-date-picker>
          </v-menu>
          <v-text-field label="备注" v-model="bzj.remark"></v-text-field>
        </v-form>
        <v-card-actions>
          <v-btn @click="bzjDialog = false">取消</v-btn>
          <v-btn color="primary" @click="insertBzjEvent" :disabled="bzj.money == 0 || bzj.money == ''">提交
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="msgShow">{{ msg }}</v-snackbar>
    <v-dialog v-model="mapDialog">
      <v-card class="pa-5 pb-0">
        <house-map :loadFloor="mapFloor" @clickHouse="houseHandler"></house-map>
        <v-btn @click="mapDialog = false" absolute right bottom>返回</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  bzjList,
  bzjMoneyList,
  cwMoneyEarlyList,
  deleteBzj,
  deleteZujin,
  expireEarlyList,
  expireList,
  exportZujinExcel,
  getByHouseId,
  insertBzj,
  insertZujin,
  moneyTotal,
  rageMoneyList,
  updateMoney,
  updateZujin,
  zujinList
} from '@/api/zujin'
import {
  addPayDetail,
  getById,
  getPayDetails,
  getPutDetailByMain,
  insertProPutDetail,
  updateProPutDetail,
} from '@/api/proPutDetail'
import {updatePay} from '@/api/proDetailPay'
import {insertOwe, updateOwe, updateQcOwe} from '@/api/proOwe'
import {list} from '@/api/yetai'
import {houseList} from '@/api/house'
import houseMap from '@/views/zj/house/map'

export default {
  name: "zj-list",
  components: {
    houseMap
  },
  props: {
    type: null,
    loadDetailByHouse: null
  },
  data: () => ({
    mapDialog: false,
    mapFloor: null,
    showDelete: false,
    yearMoney: 0,
    cwMoney: 0,
    bzjMoney: 0,
    returnMoney: 0,
    kpMoney: 0,
    earlyMoney: 0,
    downloadExcelUrl: "list/export",
    loading: false,
    bzjRules: {
      money: [v => !!v || '请输入金额', v => (!!v && v.length < 11) || '金额字符太长'],
      type: [v => !!v || '请选择或手动输入类型', v => (!!v && v.length < 5) || '金额类型过长'],
      datetime: [v => !!v || '请选择时间'],
    },
    bzjTypeItems: ['质保', '履约'],
    searchBzjType: null,
    bzjMenu: false,
    msgShow: false,
    msg: null,
    menu5: false,
    menu4: false,
    bzjDialog: false,
    bzjMoneyCount: 0,
    bzj: {money: "", remark: "", datetime: '', type: ''},
    bzjHeaders: [
      {text: '金额', value: 'money'},
      {text: '类型', value: 'type'},
      {text: '收取时间', value: 'datetime'},
      {text: '备注', value: 'remark'},
      {text: '操作', value: 'action'},
    ],
    bzjItems: [],
    year: '2021',
    headers: [
      {text: '合同编号', value: 'series'},
      {text: '租赁方', value: 'brandCompany.name'},
      {text: '品牌', value: 'brand'},
      // {text: '付租方式', value: 'payType'},
      {text: '商铺位置', value: 'houses'},
      {text: '面积²', value: 'acreage'},
      {text: '应收物业费', value: 'yearRental'},
      {text: '目前应收', value: 'ysMoney'},
      {text: '财务已收', value: 'cwMoney'},
      // {text: '期初欠款', value: 'moneyOwe.oweMoney'},
      // {text: '期初欠票', value: 'billOwe.oweMoney'},
      {text: '会计科目', value: 'kjType[0].series'},
      {text: '科目余额', value: 'kjType[0].money'},
      {text: '操作', value: 'action'},
    ],
    items: [],
    options: {},
    query: {
      searchText: null,
      page: 1,
      itemsPerPage: 10,
    },
    total: 0,

    dialog: false,
    data: null,
    payTypes: [
      {text: '年付方式', value: 0},
      {text: '季度方式', value: 1},
      {text: '月付方式', value: 2},
    ],
    houseList: [],
    searchHouse: null,

    rules: {
      series: [v => !!v || '请输入合同编号', v => (!!v && v.length < 100) || '合同编号不能超过10个字符'],
      company: [v => !!v || '请输入租赁方', v => (!!v && v.length < 100) || '租赁方不能超过10个字符'],
      brand: [v => !!v || '请输入品牌', v => (!!v && v.length < 100) || '品牌不能超过10个字符'],
      yt: [v => !!v || '请选择业态'],
      yearRental: [v => !!v || '请输入应收物业费'],
      endDatetime: [v => !!v || '请选择合同截止日期'],
    },
    yitaiItems: [],

    houseMessage: null,
    acreageMessage: null,
    dzNumberError: null,
    deleteDialog: false,
    item: {
      series: ''
    },
    /*应收/实收表（物业费明细表）*/
    headers2: [
      {text: '序号', value: 'index', width: '15%'},
      {text: '应收时间', value: 'proDate', width: '15%'},
      {text: '金额', value: 'proMoney', width: '20%'},
      {text: '实收时间', value: 'putDate', width: '15%'},
      {text: '金额', value: 'putMoney', width: '20%'},
      {text: '备注', value: 'remark', width: '15%'},
    ],
    ysMoneyItems: [],
    ysMoneyCount: 0,
    sjMoneyCount: 0,
    offInsert: false,
    detailItem: {
      id: null,
      proDate: null,
      proMoney: null,
      putDate: null,
      putMoney: null,
      remark: null,
      edit: false
    },
    detailLoading: false,

    menu: false,
    menu2: false,
    date: null,
    date2: null,

    headers3: [
      {text: '开票情况', value: 'billMoney', colspan: 2, width: '50%'},
      {text: '收款情况', value: 'payMoney', colspan: 2, width: '50%'},
    ],
    cwMoneyItems: [],
    detailLoading2: false,
    saveLoading: false,
    payCount: 0,
    billCount: 0,

    //会计科目相关
    billItems: [],
    billDialog: false,
    offEdit: true
  }),
  watch: {
    searchBzjType(value) {
      if (value == "" || value == null) {
        this.bzjTypeItems = ['质保', '履约']
      } else {
        this.bzjTypeItems = [value]
      }

    },
    searchHouse(value) {
      if (value != null) {
        console.log("搜索商铺", value)
        this.loadHouses(value);
      }
    },
    options: {
      handler() {
        this.list()
      },
      deep: true
    },
    loadDetailByHouse: {
      handler() {
        this.houseHandler(this.loadDetailByHouse)
      },
      deep: true
    }
  },
  created() {
    if (this.$store.getters.roles.indexOf("维护") !== -1) {
      this.showDelete = true
      this.offEdit = false
    } else if (this.$store.getters.roles.indexOf('财务') !== -1 || this.$store.getters.roles.indexOf('会计') !== -1) {
      this.offEdit = false
    }
    list().then(items => {
      this.yitaiItems = items
    }).finally(() => {
      if (this.loadDetailByHouse != null) {
        this.houseHandler(this.loadDetailByHouse)
      }
    })
    this.reset()
  },
  methods: {
    isEnd(datetime) {
      var d = this.dateDiffDay(datetime);
      if (d <= 0) {
        console.log("已过期", datetime)
        //已过期
        return false;
      } else if (d <= 30) {
        //快过期
        console.log("快过期", datetime)
        return true;
      } else {
        //正常
        return false;
      }
    },
    isPay(item) {
      return item.ysMoneyEarly
    },
    houseHandler(house) {
      if (house != undefined) {
        //根据商铺信息获取对账单
        getByHouseId(house.id).then(data => {
          this.detail(null, {item: data});
          this.mapDialog = false
        }).catch((e) => {
          this.msg = e
          this.msgShow = true
        })
      } else {
        this.msg = "该商铺未登记合同"
        this.msgShow = true
      }

    },
    openMap() {
      if (this.item.houses != null && this.item.houses.length > 0 && this.loadDetailByHouse == null) {
        this.mapFloor = this.item.houses[0].floor
        this.mapDialog = true
      }
    },
    downloadExcel() {
      this.loading = true
      let {page, itemsPerPage, sortBy, sortDesc} = this.options
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      this.query.sortBy = sortBy.join(',')
      this.query.sortDesc = sortDesc.join(',')
      if (this.type == null) {
        this.downloadExcelUrl = 'list/export'
      } else if (this.type == "expire") {
        this.downloadExcelUrl = 'expire/export'
      } else if (this.type == "rage") {
        this.downloadExcelUrl = 'rageMoney/export'
      } else if (this.type == "expireEarly") {
        this.downloadExcelUrl = "expireEarly/export"
      } else if (this.type == "cwEarly") {
        this.downloadExcelUrl = "cwMoneyEarly/export"
      } else {
        this.downloadExcelUrl = "bzjMoney/export"
      }
      exportZujinExcel(this.downloadExcelUrl, this.query).then(data => {
        try {
          let a = document.createElement("a");
          a.target = "_blank"
          a.href = data
          a.click()
        } catch (e) {
          console.log(e)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    loadMoneyTotal() {
      moneyTotal().then(result => {
        this.yearMoney = !result.yearRental ? 0.0 : result.yearRental
        this.cwMoney = !result.cwMoney ? 0.0 : result.cwMoney
        this.bzjMoney = !result.bzjMoney ? 0.0 : result.bzjMoney
        this.returnMoney = !result.returnMoney ? 0.0 : result.returnMoney
        this.kpMoney = !result.kpMoney ? 0.0 : result.kpMoney
        this.earlyMoney = !result.earlyMoney ? 0.0 : result.earlyMoney
      })
    },
    deleteBzjHandler(id) {
      deleteBzj(id).then(() => {
        this.loadBzj();
        if (this.type == "bzj") {
          this.list()
        }
      })
    },
    getSjQMoney() {
      /*let m = parseFloat(this.data.moneyOwe.oweMoney)
      if (isNaN(m)) {
          m = 0
      }
      return m + this.data.sjMoney - this.data.cwMoney*/
      if (this.item.kjType[0].money > 0) {
        return this.item.kjType[0].money.toFixed(2)
      } else {
        return "0";
      }
    },
    getZmMoney(billItem) {
      try {
        return billItem.money.toFixed(2)
      } catch (e) {
        return 0;
      }
    },
    getNoBillMoney() {
      /*let m = parseFloat(this.data.billOwe.oweMoney)
      if (isNaN(m)) {
          m = 0
      }
      return m + this.data.sjMoney - this.data.kpMoney*/
      if (this.item.kjType[0].money <= 0) {
        return this.item.kjType[0].money.toFixed(2)
      } else {
        return "0";
      }
    },
    updateQcOweMoney(data) {
      updateQcOwe(data).then(() => {
        this.list()
      })
      this.setKjMoney()
    },
    newLine3(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        money: 0,
        remark: '系统备注',
        series: ''
      }
      data.push(this.detailItem)
      this.offInsert = true
    },

    savePay() {
      this.saveLoading = true
      /*
      收票、收款保存
       */
      let size = this.cwMoneyItems.length
      let than = this
      let count = 0
      for (let i = 0; i < size; i++) {
        let detailItem = than.cwMoneyItems[i]
        if (detailItem.id != null) {
          updatePay(detailItem).finally(() => {
            count++
          })
        } else {
          addPayDetail(detailItem).finally(() => {
            count++
          })
        }
      }
      /*
      会计科目保存
       */
      size += this.billItems.length
      for (let x = 0; x < this.billItems.length; x++) {
        let item = this.billItems[x]
        item.remark = ""
        if (item.id != null) {
          updateOwe(item).finally(() => {
            count++
          })
        } else {
          insertOwe(item).finally(() => {
            count++
          })
        }
      }

      let timeout = window.setInterval(() => {
        console.log("count%1 size%2", count, size)
        if (count === size) {
          than.saveLoading = false
          than.offInsert = false
          than.loadProDetail()
          window.clearInterval(timeout)
        }
      }, 1000);
    },
    editDetailItem2(event, item) {
      this.editDetailItem(event, item)
    },

    dateChange(item, prop) {
      if (prop == "putDate") {
        // this.$refs[prop].save()
        this.menu2 = false
      } else {
        this.menu = false
      }
    },
    editDetailItem(event, param) {
      if (this.offInsert) {
        let isRequest = true
        if (this.detailItem.id === (event.id || param.id)) {
          isRequest = false
        }
        if (this.detailItem.id != null && isRequest) {
          this.detailItem.edit = false
          getById(this.detailItem.id).then(detail => {
            detail.edit = false
            this.detailItem.proDate = detail.proDate
            this.detailItem.proMoney = detail.proMoney
            this.detailItem.putMoney = detail.putMoney
            this.detailItem.putDate = detail.putDate
            this.detailItem.remark = detail.remark
          }).finally(() => {
            this.openEdit(event, param)
          })
        } else if (isRequest) {
          this.ysMoneyItems.splice(this.detailItem.index, 1)
          this.openEdit(event, param)
        }

      } else {
        this.openEdit(event, param)
      }

    },
    openEdit(event, param) {
      if (event.id == null) {
        window.setTimeout(() => {
          let temp
          if (this.$refs[param.id + event] instanceof Array) {
            temp = this.$refs[param.id + event][0]
          } else {
            temp = this.$refs[param.id + event]
          }
          temp.focus()
          temp.$refs.input.select()
        }, 100)
        this.detailItem = param
      } else {
        this.detailItem = param.item
      }
      if (event == "proDate") {
        this.menu = true
      } else if (event == "putDate") {
        this.menu2 = true
      } else {
        this.menu = false
        this.menu2 = false
      }
      this.detailItem.edit = true
      this.offInsert = true
    },
    cancelInsert() {
      if (this.detailItem.id == null) {
        this.ysMoneyItems.splice(this.detailItem.index, 1)
      }
      this.offInsert = false
      this.loadProDetail()
    },
    savePro() {
      if (this.detailItem.proMoney < 0 && (this.detailItem.remark == "" || this.detailItem.remark == null)) {
        this.msg = "填写抵扣金额时必须填写抵扣备注信息"
        this.msgShow = true
        return;
      }
      this.detailItem.projectName = ""
      if (this.detailItem.id != null) {
        updateProPutDetail(this.detailItem).then(() => {
          this.loadProDetail()
        }).finally(() => {
          this.offInsert = false
        })
      } else {
        insertProPutDetail(this.detailItem).then(() => {
          this.loadProDetail()
        }).finally(() => {
          this.offInsert = false
        })
      }

    },
    setItemMoneys() {
      this.item.ysMoney = this.ysMoneyCount
      this.item.sjMoney = this.sjMoneyCount
      this.item.cwMoney = this.payCount
      this.item.kpMoney = this.billCount
      this.item.yearRental = this.ysMoneyCount
    },
    loadProDetail() {
      let loadCount = 0
      this.detailLoading = true
      this.ysMoneyCount = 0
      this.sjMoneyCount = 0
      //应收/实收
      getPutDetailByMain(this.item.id).then(data => {
        if (data != null) {
          data.forEach((item, idx) => {
            item.edit = false
            item.index = idx + 1
            if (item.proMoney != null) {
              this.ysMoneyCount += item.proMoney
            }
            if (item.putMoney != null) {
              this.sjMoneyCount += item.putMoney
            }
          })
          if (loadCount == 1) {
            this.setItemMoneys()
            this.setKjMoney();
            updateMoney({
              id: this.item.id,
              ysMoney: this.ysMoneyCount,
              sjMoney: this.sjMoneyCount,
              cwMoney: this.payCount,
              kpMoney: this.billCount,
              moneyOwe: this.item.moneyOwe,
              billOwe: this.item.billOwe,
              kjType: this.item.kjType,
              yearRental: this.ysMoneyCount
            }).then(() => {
              this.list()
            })
          } else {
            loadCount++
          }

          this.ysMoneyItems = data
        }
      }).catch(() => {
        this.ysMoneyItems = []
      }).finally(() => {
        this.detailLoading = false
      })

      //财务实收/开票
      this.detailLoading2 = true
      getPayDetails(this.item.id).then(data => {
        this.payCount = 0
        this.billCount = 0
        if (data != null) {
          data.forEach(item => {
            item.edit = false
            if (item.payMoney != null) {
              this.payCount += item.payMoney
            }
            if (item.billMoney != null) {
              this.billCount += item.billMoney
            }
          })
          if (loadCount == 1) {
            this.setItemMoneys()
            this.setKjMoney();
            updateMoney({
              id: this.item.id,
              ysMoney: this.ysMoneyCount,
              sjMoney: this.sjMoneyCount,
              cwMoney: this.payCount,
              kpMoney: this.billCount,
              moneyOwe: this.item.moneyOwe,
              billOwe: this.item.billOwe,
              kjType: this.item.kjType,
              yearRental: this.ysMoneyCount
            }).then(() => {
              this.list()
            })
          } else {
            loadCount++
          }
          this.cwMoneyItems = data

        }
      }).catch((() => this.cwMoneyItems = [])).finally(() => {
        this.detailLoading2 = false
      })

      //财务会计科目
      this.item.kjType.forEach(item => {
        item.edit = false
      })
      this.billItems = this.item.kjType
      // getOweList(this.item.id).then(data => {
      //     data.forEach(item => {
      //         item.edit = false
      //     })
      //     this.billItems = data
      // }).catch(() => this.billItems = [])
    },
    setKjMoney() {
      this.item.kjType[0].money = this.item.moneyOwe.oweMoney - this.item.billOwe.oweMoney + this.billCount - this.payCount
    },
    newLine(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        index: data.length + 1,
        proDate: "",
        proMoney: 0,
        putDate: "",
        putMoney: 0,
      }
      data.push(this.detailItem)
      this.offInsert = true
    },
    newLine2(data) {
      this.detailItem = {
        edit: true,
        mainId: this.item.id,
        index: data.length + 1,
        billDate: "",
        billMoney: 0,
        payDate: "",
        payMoney: 0,
      }
      data.push(this.detailItem)
      this.offInsert = true
    },

    detail(event, row) {
      this.item = row.item

      if (this.item.houses.length > 0) {
        this.item.houses.forEach(item => {
          item.temp = item.pwNumber + ":" + item.acreage
          this.houseList.push(item)
        })
      }
      this.data = row.item
      this.loadBzj();
      this.cancelInsert()
      this.dialog = true
    },
    loadBzj() {
      this.bzjMoneyCount = 0;
      bzjList(this.data.id).then(result => {
        result.forEach(item => {
          if (item.money != null) {
            this.bzjMoneyCount += item.money;
          }
        })
        this.bzjMoneyCount = this.bzjMoneyCount.toFixed(2);
        this.bzjItems = result
      })
    },
    insertBzjEvent() {
      let valid = this.$refs['bzjForm'].validate();
      if (valid) {
        this.bzj.proDetailId = this.data.id
        insertBzj(this.bzj).then(() => {
          this.$refs['bzjForm'].reset()
          this.bzjDialog = false
          this.loadBzj()
          if (this.type == "bzj") {
            this.list()
          }
        }).catch(e => {
          console.log("登记失败", e)
        })
      }
    },
    formatHouse(houses) {
      if (houses.length > 0) {
        return houses[0].pwNumber
      } else {
        return ""
      }
    },
    deleteZujin() {
      deleteZujin(this.item.id).then(() => {
        this.list()
        this.deleteDialog = false
      }).catch(e => {
        console.log(e)
      })
    },
    deleteItem(item) {
      this.item = item
      this.deleteDialog = true
    },
    formatDjYsMoney(item) {

      /*
       *   {text: '年付方式', value: 0},
           {text: '季度方式', value: 1},
           {text: '月付方式', value: 2},
       */
      if (item.payType == 0) {
        return item.yearRental
      } else if (item.payType == 1) {
        let num = this.getQuarter()
        // console.log("每季度金额：", item.yearRental / 4, "当前季度", num)
        return (item.yearRental / 4 * num).toFixed(2)
      } else {
        return (item.yearRental / 12 * new Date().getMonth() + 1).toFixed(2)
      }

    },
    formatPay(item) {
      let result = null;
      for (let x = 0; x < this.payTypes.length; x++) {
        if (this.payTypes[x].value === item.payType) {
          result = this.payTypes[x].text
          break
        }
      }
      return result
    },
    loadHouses(value) {
      houseList({searchText: value, page: 1, itemsPerPage: 50, flag: 0}).then(data => {
        data.rows.forEach(item => {
          item.temp = item.pwNumber + ":" + item.acreage
        })
        this.houseList = data.rows
      })
    },
    openDialog() {
      this.reset()
      this.dialog = true
    },
    houseChange() {
      console.log("houseChange")
      this.data.acreage = 0
      this.data.houses.forEach(item => {
        let acreage = parseFloat(item.acreage);
        if (isNaN(acreage)) {
          acreage = 0
        }
        this.data.acreage += acreage
      })
      this.data.acreage = this.data.acreage.toFixed(2)
      let last = 0;
      if ((last = this.data.houses.length) > 0) {
        last = this.data.houses[last - 1]
        if (last.yetaiId != null) {
          this.data.yt = {id: last.yetaiId, name: ''}
          for (let x = 0; x < this.yitaiItems.length; x++) {
            let item = this.yitaiItems[x]
            if (item.id == last.yetaiId) {
              this.data.yt.name = item.name
              break
            }
          }
        }
        this.houseMessage = null
        this.acreageMessage = null
      }
    },
    houseSelect() {
      if (this.data.zlType != 0) {
        this.data.houses = []
        this.data.acreage = 0
      }
    },
    reset() {
      this.data = {
        series: null,
        company: null,
        brandCompany: {name: null},
        brand: null,
        payType: 0,
        acreage: 0,
        zl_person: null,
        zl_person_tel: null,
        yt: {id: null, name: null},
        staffName: this.$store.state.user.name,
        dz: null,
        sh: null,
        remark: null,
        houses: [],
        zlType: 0,
        dzNumber: 0,
        zlPerson: null,
        zlPersonTel: null,
        billOwe: {oweMoney: 0},
        moneyOwe: {oweMoney: 0},
        djYsMoney: 0,
        yearRental: null,
        endDatetime: null,
        kjType: [{money: 0}]
      }
      this.item = this.data
      this.ysMoneyItems = []
      this.cwMoneyItems = []
      this.payCount = 0
      this.billCount = 0
      this.ysMoneyCount = 0
      this.sjMoneyCount = 0
      this.billItems = []
      this.loadHouses();
      this.offInsert = false
    },
    insertZujin() {
      if (!this.offEdit) {
        let valid = this.$refs['zujinForm'].validate();
        if (valid) {
          if (this.data.zlType == 0) {
            if (this.data.houses.length <= 0) {
              this.houseMessage = "请选择租赁商铺"
              return;
            }
          }
          if (this.data.acreage <= 0) {
            this.acreageMessage = "请输入租赁面积"
            return;
          }
          if (this.data.dz) {
            if (this.data.dzNumber <= 0) {
              this.dzNumberError = "请输入递增比例"
              return;
            }
          }
          this.data.companyTypeId = this.data.yt.id
          if (this.data.id != null) {
            updateZujin(this.data).then(() => {
              this.list()
              this.dialog = false
            })
          } else {
            insertZujin(this.data).then(() => {
              this.list()
              this.dialog = false
            })
          }
        }
      } else {
        this.dialog = false
      }
    },
    list() {
      this.loading = true
      let {page, itemsPerPage, sortBy, sortDesc} = this.options
      this.query.page = page
      this.query.itemsPerPage = itemsPerPage
      this.query.sortBy = sortBy.join(',')
      this.query.sortDesc = sortDesc.join(',')
      let request;
      if (this.type == null) {
        request = zujinList(this.query)
      } else if (this.type == "expire") {
        request = expireList(this.query)
      } else if (this.type == "rage") {
        request = rageMoneyList(this.query)
      } else if (this.type == 'expireEarly') {
        request = expireEarlyList(this.query)
      } else if (this.type == "cwEarly") {
        request = cwMoneyEarlyList(this.query)
      } else {
        this.headers = [
          {text: '合同编号', value: 'series'},
          {text: '租赁方', value: 'company'},
          {text: '品牌', value: 'brand'},
          {text: '类型', value: 'bzjType'},
          {text: '商铺位置', value: 'houses'},
          {text: '已缴保证金', value: 'bzjMoney'},
          {text: '已退保证金', value: 'returnBzjMoney'},
          {text: '目前应收', value: 'ysMoney'},
          {text: '财务已收', value: 'cwMoney'},
          {text: '期初欠款', value: 'moneyOwe.oweMoney'},
          {text: '期初欠票', value: 'billOwe.oweMoney'},
          {text: '操作', value: 'action'},

        ],
            request = bzjMoneyList(this.query)
      }
      request.then(data => {
        data.rows.forEach(item => {
          item.djYsMoney = this.formatDjYsMoney(item)
        })
        this.items = data.rows
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
      this.loadMoneyTotal()
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: pointer;
}

.border-top {
  border-top: thin solid rgba(0, 0, 0, 0.12)
}
</style>