<template>
    <NuxtLayout>
        <template #side-bar>
            <v-divider />
            <v-list density="compact" nav>
                <v-menu :close-on-content-click="false" persistent>
                    <template v-slot:activator="{ props }">
                        <v-list-item prepend-icon="mdi-calendar" v-bind="props" title="Choose Date"
                            value="account"></v-list-item>
                    </template>

                    <v-date-picker v-model="date" show-adjacent-months elevation="24"></v-date-picker>
                </v-menu>
            </v-list>

            <v-list>
                <v-list-item prepend-icon="mdi-bookmark" title="Bookmark Current Locations" />
                <v-divider />
                <v-list-item>
                    <v-col>
                    </v-col>
                </v-list-item>
                <v-divider />

                <v-list-group value="Admin">
                    <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props" title="Distance Finding Helper"></v-list-item>
                    </template>

                    <v-list-item>
                        <v-text-field variant="solo" density="compact" label="Object Height"></v-text-field>
                    </v-list-item>
                    <v-list-item>
                        <v-text-field variant="solo" density="compact" label="View Spot Height"></v-text-field>
                    </v-list-item>


                </v-list-group>
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-title v-slot="{ expanded }">
                            Range Helper
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-row no-gutters>

                                <v-switch v-model="showRange" label="All year Range (green triangle)"></v-switch>
                            </v-row>
                            <v-row>
                                <v-text-field v-model="distance" density="compact" variant="solo"
                                    label="Distance from target in meters" type="number"
                                    append-inner-icon="mid-distance" />
                            </v-row>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-list>
        </template>

        <div style="height: 100%;">
            <l-map ref="map" v-model:zoom="zoom" v-model:center="center">
                <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
                    name="OpenStreetMap"></l-tile-layer>

                <l-polygon v-if="showRange" :lat-lngs="triangle" color="#41b782" />
                <l-polygon v-if="showToday" :lat-lngs="sunsetBox" color="blue" :weight="1" fill-color="red" />
                <l-marker v-if="showRange || findTime" :lat-lng="[a.lat, a.lng]" draggable @move="e => a = e.latlng">
                    <l-popup>Marker A</l-popup>
                </l-marker>
                <template v-if="findTime">
                    <l-marker :lat-lng="[b.lat, b.lng]" draggable @move="e => b = e.latlng">
                        <l-popup>Marker B:
                            {{ message }}
                        </l-popup>
                    </l-marker>
                </template>
            </l-map>
        </div>
    </NuxtLayout>
</template>

<script setup>
import { boundingBox, findAlignmentTime, sunsetTriangle } from '@/src/find-sun.js'
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LPolygon, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";

const router = useRouter()
const route = useRoute()

// const a = ref()

const a = queryBackedProp('a', parseQuery, mapToQuery)
const b = queryBackedProp('b', parseQuery, mapToQuery)
const date = queryBackedProp('date', (num) => !!num ? new Date(parseInt(num)) : new Date(), (date) => date.getTime())

const zoom = queryBackedProp('zoom', (num) => !!num ? parseInt(num) : 10)
const center = ref(a.value)
const distance = ref(10000)
const showRange = ref(true)
const showToday = ref(true)
const sunsetBox = computed(() => sunsetTriangle(a.value, date.value, distance.value))

const triangle = computed(() => boundingBox(a.value, distance.value))
const findTime = ref(true)

const defaultMessage = `Move the A and Markers to chose a line.
            Has a triangle that shows you which area can align some time in the year.
            
            You can for example use it to find out a place where the sun sets behind an object.
            You should put marker A on the target object. 

            When you move object B, you will then get date an time where these two points will align with where the sun sets. 
        `

const message = computed(() => {
    if (a.value.lat === b.value.lat
        && a.value.lng === b.value.lng) {
        return defaultMessage
    }

    const times = findAlignmentTime(a.value, b.value)
    console.log("Checkout the location at Marker B during", times)
    return `Standing On Marker B, you will see the sun set behind Marker A on these dates:
   
    ${times.join("\n\n")}
    `

})

function parseQuery(q) {
    if (!!q) {
        try {
            return JSON.parse(q.replace(/lat/g, '"lat"').replace(/lng/g, '"lng"'))
        } catch (e) {
            console.log("Error", e)
        }
    }
    return { lat: 52.5209554, lng: 13.4094429 }
}

function mapToQuery({ lat, lng }) {
    return `{lat:${lat},lng:${lng}}`
}
function queryBackedProp(param, parser = (x) => x, mapper = (x) => x) {
    return computed({
        get() {
            console.log(`Parsed ${param}`, parser(route.query[param]));
            return parser(route.query[param])
        },
        set(value) {
            const query = { ...route.query }
            query[param] = mapper(value)
            router.replace({ query })
        }
    })

}
</script>