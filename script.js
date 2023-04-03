// import data from './广州ARTEASG各分店销售情况0323.json' assert { type: 'JSON' };

var timeSaleChart = echarts.init(document.getElementById('chart'));
var dateSaleChart = echarts.init(document.getElementById('date-sale-chart'));
let dateSaleChartFilterList = ['600535382']
let shopCups = document.querySelector('#shop-cups')
let shopOrders = document.querySelector('#shop-orders')
let avgOrder = document.querySelector('#avg-order')
let timeDatas = []
let dateDatas = []
let lastTarget = null
let currentId = ''
let currentShopId = '600535382'
let currentShopName = 'ARTEASG（广州市天河区棠东店）'

init()
setEventLister()

async function init(datekey) {
  await getData(datekey)
  setShopList(timeDatas)
  refreshData()
}

async function getData(datekey = '0401') {
  await fetch(`./data/广州ARTEASG各分店销售情况${datekey}.json`).then(res => {
    return res.json()
  }).then(res => {
    timeDatas = res
  }).catch(err => {
    console.error(err)
  })
  await fetch(`./data/广州ARTEASG各分店销售情况日度.json`).then(res => {
    return res.json()
  }).then(res => {
    dateDatas = res
  }).catch(err => {
    console.error(err)
  })
}

function getCurrentDatekey() {
  let date = new Date()
  return fillZero(date.getMonth() + 1) + fillZero(date.getDate())
}

function filterData(id) {
  return timeDatas.filter(item => item.id === id)
}

function refreshData(id = currentShopId, name = currentShopName) {
  currentShopId = id
  currentShopName = name
  dateSaleChartFilterList = [currentShopId]
  document.querySelector('#shop-title').innerHTML = name
  let data = filterData(id)
  setTimeSaleChartOptions(data)
  setDateSaleChartOptions(dateDatas)
}

function setTimeSaleChartOptions(data){
  let options = getFullOptions(data)
  timeSaleChart.setOption(options);
}

function setDateSaleChartOptions(data){
  let options = getFullOptions2(data)
  dateSaleChart.setOption(options);
}

// 指定图表的配置项和数据
function getFullOptions(data) {
  let xData = []
  let cups = []
  let orders = []
  data.forEach(item => {
    xData.push(item.time)
    cups.push(item.cups)
    orders.push(item.orders)
  })
  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '8%',
      top: '5%',
      bottom: '8%',
      right: '5%',
    },
    xAxis: {
      type: 'category',
      data: xData.map(item => item.split(' ')[1])
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '杯数',
        data: cups,
        type: 'line',
        smooth: true
      },
      {
        name: '单数',
        data: orders,
        type: 'line',
        smooth: true
      }
    ]
  };
}
// 指定图表的配置项和数据
function getFullOptions2(data){
  let xData = []
  let dataMap = {}
  data.forEach(day => {
    xData.push(day['600535382'].time)
    dateSaleChartFilterList.forEach(shopId => {
      if(!dataMap[shopId]){
        dataMap[shopId] = {
          data:[day[shopId].totalCups],
          name:day[shopId].name,
          type: 'line',
          smooth: true
        }
      }else{
        dataMap[shopId].data.push(day[shopId].totalCups)
      }
    })
  })
  
  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '8%',
      top: '5%',
      bottom: '8%',
      right: '5%',
    },
    xAxis: {
      type: 'category',
      data: xData
    },
    yAxis: {
      type: 'value'
    },
    series: Object.values(dataMap)
  };
}

function getShopData(data) {
  let shopMap = {}
  let shopList = []
  data.forEach(item => {
    if (!shopMap[item.id]) {
      shopMap[item.id] = {
        totalCups:item.cups || 0,
        lastCups:item.cups || 0,
        id:item.id,
        name:item.name,
        totalOrders:item.orders || 0,
        lastOrders:item.orders || 0
      }
    } else {
      let res_cup = item.cups > shopMap[item.id].lastCups ? item.cups - shopMap[item.id].lastCups : item.cups !== 0 && item.cups === shopMap[item.id].lastCups ? 2 : 0;
      let res_order = item.orders > shopMap[item.id].lastOrders ? item.orders - shopMap[item.id].lastOrders : 0;
      shopMap[item.id].totalCups += res_cup
      shopMap[item.id].totalOrders += res_order
      shopMap[item.id].lastCups = item.cups
      shopMap[item.id].lastOrders = item.orders
    }
  })
  for (let item of Object.keys(shopMap)) {
    shopList.push({
      name: shopMap[item].name,
      totalCups: shopMap[item].totalCups,
      totalOrders:shopMap[item].totalOrders,
      id: shopMap[item].id,
    })
  }
  return shopList
}
function setShopList(data) {
  let shopList = getShopData(data)
  shopList.sort((a, b) => b.totalCups - a.totalCups)
  let shopListDom = document.querySelector('#shop-list')
  shopListDom.innerHTML = ''
  const fragment = new DocumentFragment();
  for (let item of shopList) {
    const li = document.createElement("li");
    const key = document.createElement('span')
    const value = document.createElement('span')
    key.textContent = item.name.replace('ARTEASG', '');
    value.textContent = item.totalCups;
    li.dataset.shopid = item.id
    li.dataset.shopName = item.name
    li.dataset.shopCups = item.totalCups
    li.dataset.shopOrders = item.totalOrders
    li.append(key)
    li.append(value)
    fragment.append(li);
  }
  shopListDom.append(fragment)

  let shopitems = document.querySelectorAll('#shop-list > li')
  shopitems.forEach(item => {
    if (item.dataset.shopid === currentShopId) {
      findNUpdate(item)
      lastTarget = item
    }
  })

  shopitems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (lastTarget) {
        lastTarget.style.color = '#000000'
        lastTarget.style.fontWeight = '400'
      }
      findNUpdate(e.currentTarget)
      refreshData(e.currentTarget.dataset.shopid, e.currentTarget.dataset.shopName)
      lastTarget = e.currentTarget
    })
  })
}

function findNUpdate(shopitem) {
  let shopCupsValue = shopitem.dataset.shopCups
  let shopOrdersValue = shopitem.dataset.shopOrders
  shopCups.innerHTML = shopCupsValue + '杯'
  shopOrders.innerHTML = shopOrdersValue + '单'
  avgOrder.innerHTML = (shopCupsValue / shopOrdersValue).toFixed(2) + '杯'
  shopitem.style.color = '#106EBE'
  shopitem.style.fontWeight = '700'
}

function setEventLister() {
  let date = new Date()
  let datePicker = document.querySelector('#date-picker')
  let today = date.getFullYear() + '-' + fillZero(date.getMonth() + 1) + '-' + fillZero(date.getDate());
  datePicker.setAttribute('max', today)
  datePicker.addEventListener('change', (e) => {
    let datekey = String(datePicker.value.split('-')[1]) + String(datePicker.value.split('-')[2])
    init(datekey)
  })
}

function fillZero(val) {
  return val > 9 ? val : '0' + val
}

