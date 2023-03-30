// import data from './广州ARTEASG各分店销售情况0323.json' assert { type: 'JSON' };

var myChart = echarts.init(document.getElementById('chart'));
let shopCups = document.querySelector('#shop-cups')
let shopOrders = document.querySelector('#shop-orders')
let avgOrder = document.querySelector('#avg-order')
let datas = []
let lastTarget = null
let currentId = ''
let currentShopId = '600535382'
let currentShopName = 'ARTEASG（广州市天河区棠东店）'
init()
setEventLister()

async function init(datekey) {
  await getData(datekey)
  setShopList(datas)
  refreshData()
}

async function getData(datekey = '0329') {
  await fetch(`./data/广州ARTEASG各分店销售情况${datekey}.json`).then(res => {
    return res.json()
  }).then(res => {
    datas = res
  }).catch(err => {
    console.error(err)
  })
}

function getCurrentDatekey() {
  let date = new Date()
  return fillZero(date.getMonth() + 1) + fillZero(date.getDate())
}

function filterData(id) {
  return datas.filter(item => item.id === id)
}

function refreshData(id = currentShopId, name = currentShopName) {
  currentShopId = id
  currentShopName = name
  document.querySelector('#shop-title').innerHTML = name
  let data = filterData(id)
  let options = getFullOptions(data)
  myChart.setOption(options);
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
      data: xData
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

function getShopData(data) {
  let shopMap = {}
  let shopList = []
  data.forEach(item => {
    if (!shopMap[item.name]) {
      shopMap[item.name] = {
        totalCups:item.cups || 0,
        lastCups:item.cups || 0,
        id:item.id,
        totalOrders:item.orders || 0,
        lastOrders:item.orders || 0
      }
    } else {
      let res_cup = item.cups > shopMap[item.name].lastCups ? item.cups - shopMap[item.name].lastCups : item.cups !== 0 && item.cups === shopMap[item.name].lastCups ? 2 : 0;
      let res_order = item.orders > shopMap[item.name].lastOrders ? item.orders - shopMap[item.name].lastOrders : 0;
      shopMap[item.name].totalCups += res_cup
      shopMap[item.name].totalOrders += res_order
      shopMap[item.name].lastCups = item.cups
      shopMap[item.name].lastOrders = item.orders
    }
  })
  for (let item of Object.keys(shopMap)) {
    shopList.push({
      name: item,
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
    }
  })

  shopitems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (lastTarget) {
        lastTarget.style.color = '#00000'
        lastTarget.style.fontWeight = '400'
      }
      findNUpdate(e.currentTarget)
      refreshData(e.currentTarget.dataset.shopid, e.currentTarget.dataset.shopName)
      // shopCups.innerHTML = e.currentTarget.dataset.shopCups + '杯'
      // e.currentTarget.style.color = '#106EBE'
      // e.currentTarget.style.fontWeight = '600'
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
  shopitem.style.fontWeight = '600'
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

