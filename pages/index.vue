<template>
    <NuxtLayout>
        <template #header>
            <v-menu :close-on-content-click="false" persistent>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" text="Choose Date" prepend-icon="mdi-calendar" variant="text"></v-btn>
                </template>

                <v-date-picker v-model="date" show-adjacent-months elevation="24"></v-date-picker>
            </v-menu>

            <v-btn prepend-icon="mdi-pin" text="Home" color="green"
                to="/?a={lat:52.5209554,lng:13.4094429}&b={lat:52.5209554,lng:13.4094429}"></v-btn>

            <v-menu :close-on-content-click="false" persistent>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" text="Configurations" prepend-icon="mdi-wrench" variant="text"></v-btn>
                </template>

                <v-card class="mx-auto" max-width="344">

                    <v-card-title>
                        Configurations
                    </v-card-title>


                    <v-divider />

                    <v-card-text>
                        <v-list>
                            <!-- <v-list-item prepend-icon="mdi-bookmark" title="Bookmark Current Locations" />
                            <v-divider />

                            <v-list-group>
                                <template v-slot:activator="{ props }">
                                    <v-list-item v-bind="props" title="Distance Finding Helper"></v-list-item>
                                </template>

                                <v-list>

                                    <v-text-field variant="underlined" density="compact" label="Object Height"></v-text-field>
                                    <v-text-field variant="underlined" density="compact"
                                        label="View Spot Height"></v-text-field>

                                </v-list>
                            </v-list-group> -->

                            <v-list-group :value="true">
                                <template v-slot:activator="{ props }">
                                    <v-list-item v-bind="props" title="Range Highlighting"></v-list-item>
                                </template>

                                <v-switch v-model="showRange" label="All year Range (green triangle)"></v-switch>

                                <v-text-field v-model="distance" density="compact" variant="underlined"
                                    label="Distance from target in meters" type="number"
                                    append-inner-icon="mid-distance" />



                            </v-list-group>
                        </v-list>
                    </v-card-text>
                </v-card>

            </v-menu>

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