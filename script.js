// import data from './广州ARTEASG各分店销售情况0323.json' assert { type: 'JSON' };

var myChart = echarts.init(document.getElementById('chart'));
let datas = []

async function getData(){
    await fetch('./data/广州ARTEASG各分店销售情况0324.json').then(res => {
        return res.json()
    }).then(res => {
        datas = res
    })
}

function filterData(id){
    return datas.filter(item => item.id === id)
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
    console.log(data)
    return {
        tooltip: {
            trigger: 'axis',
          },
        xAxis: {
            type: 'category',
            data:xData
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

async function setChart() {
    await getData()
    let data = filterData("600535382")
    let options = getFullOptions(data)
    myChart.setOption(options);
}

setChart()

