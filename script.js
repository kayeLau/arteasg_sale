// import data from './广州ARTEASG各分店销售情况0323.json' assert { type: 'JSON' };

var myChart = echarts.init(document.getElementById('chart'));
let shopCups = document.querySelector('#shop-cups')
let datas = []
let shopList = []
let lastTarget = null
let currentId = ''
init()
setEventLister()

async function init(datekey) {
  console.log(datekey)
  await getData(datekey)
  setShopList(datas)
  refreshData()
}

async function getData(datekey = '0324') {
  await fetch(`./data/广州ARTEASG各分店销售情况${datekey}.json`).then(res => {
    return res.json()
  }).then(res => {
    datas = res
  }).catch(err => {
    console.error(err)
  })
}

function filterData(id) {
  return datas.filter(item => item.id === id)
}

function refreshData(id = "600535382",name = 'ARTEASG（广州市天河区棠东店）'){
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
      shopMap[item.name] = []
      shopMap[item.name][0] = item.cups || 0
      shopMap[item.name][1] = item.cups || 0
      shopMap[item.name][2] = item.id
    } else {
      let res = item.cups > shopMap[item.name][1] ? item.cups - shopMap[item.name][1] : item.cups !== 0 && item.cups === shopMap[item.name][1] ? 2 : 0
      shopMap[item.name][0] += res
      shopMap[item.name][1] = item.cups
    }
  })
  for (let item of Object.keys(shopMap)) {
    shopList.push({
      name: item,
      value: shopMap[item][0],
      id: shopMap[item][2]
    })
  }
  return shopList
}
function setShopList(data) {
  let shopList = getShopData(data)
  shopList.sort((a, b) => b.value - a.value)
  let shopListDom = document.querySelector('#shop-list')
  shopListDom.innerHTML = ''
  const fragment = new DocumentFragment();
  for (let item of shopList) {
    const li = document.createElement("li");
    const key = document.createElement('span')
    const value = document.createElement('span')
    key.textContent = item.name.replace('ARTEASG', '');
    value.textContent = item.value;
    li.dataset.shopid = item.id
    li.dataset.shopName = item.name
    li.dataset.shopCups = item.value
    li.append(key)
    li.append(value)
    fragment.append(li);
  }
  shopListDom.append(fragment)

  let shopitems = document.querySelectorAll('#shop-list > li')
  shopitems.forEach(item => {
    item.addEventListener('click', (e) => {
      if(lastTarget){
        lastTarget.style.color = '#00000'
        lastTarget.style.fontWeight = '400'
      }
      shopCups.innerHTML = e.currentTarget.dataset.shopCups + '杯'
      refreshData(e.currentTarget.dataset.shopid,e.currentTarget.dataset.shopName)
      e.currentTarget.style.color = '#106EBE'
      e.currentTarget.style.fontWeight = '600'
      lastTarget = e.currentTarget
    })
  })
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

