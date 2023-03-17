<script setup lang="ts">
import * as mars2d from 'mars2d'
import { onMounted, onUnmounted } from 'vue'
import coordtransform from 'coordtransform'

let map
let graphicLayer
function initMap(): mars2d.Map {
    // 创建三维地球场景
    const map = new mars2d.Map('mars2dContainer', {
        zoom: 13,
        center: { lng: 120.504661, lat: 27.85194 },
        minZoom: 3,
        maxZoom: 18,
        ChinaCRS: 'WGS84',
        control: {
            scale: true,
            locationBar: {
                crs: 'CGCS2000_GK_Zone_3',
                template:
                    '<div>经度:{lng}</div> <div>纬度:{lat}</div> <div>横{crsx}  纵{crsy}</div> <div>层级:{level}</div>'
            },
            zoom: { position: 'bottomright' },
            toolBar: { position: 'bottomright' },
            layers: { position: 'topleft' }
        },
        basemaps: [
            {
                name: '天地图电子',
                type: 'group',
                layers: [
                    { name: '底图', type: 'tdt', layer: 'vec_d' },
                    { name: '注记', type: 'tdt', layer: 'vec_z' }
                ],
                show: true
            },
            { name: '天地图卫星', type: 'tdt', layer: 'img' },
            {
                name: 'OSM地图',
                type: 'xyz',
                url: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
            },
            { name: '高德地图', type: 'gaode', layer: 'vec' },
            { name: '百度地图', type: 'baidu', layer: 'vec' }
        ],
        operationallayers: [{ name: '经纬网', type: 'graticule' }]
    })

    // 创建矢量数据图层
    graphicLayer = new mars2d.layer.GraphicLayer()
    map.addLayer(graphicLayer)
    // 加一些演示数据
    addDemoGraphic1()
    return map
}
function addDemoGraphic1(): void {
    const gcj02 = coordtransform.bd09togcj02(27.83506, 120.54997)
    const wgs = coordtransform.gcj02towgs84(gcj02[0], gcj02[1])
    console.log(wgs)
    const graphic = new mars2d.graphic.Marker({
        latlng: [27.832751142073597, 120.53940562314315],
        style: {
            image: 'img/marker/mark1.png',
            width: 32,
            height: 44,
            horizontalOrigin: mars2d.HorizontalOrigin.CENTER,
            verticalOrigin: mars2d.VerticalOrigin.BOTTOM
        },
        attr: { remark: '示例1' }
    })
    graphicLayer.addGraphic(graphic)
}

onMounted(() => {
    map = initMap()
})
onUnmounted(() => {
    map = null
})
</script>

<template>
    <div id="mars2dContainer" style="width: 800px; height: 600px"></div>
</template>

<style lang="less"></style>
