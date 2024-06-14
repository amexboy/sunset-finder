import SunCalc from 'suncalc'
import pkg from '../node_modules/geolib/lib/index.js';
const { computeDestinationPoint, getRhumbLineBearing } = pkg;
// import { computeDestinationPoint, getRhumbLineBearing } from 'geolib';

export const findSun = (lat, long, date) => {

  const times = SunCalc.getTimes(date, lat, long)

  const sunsetPos = SunCalc.getPosition(times.sunset, lat, long)
  const sunsetStartPos = SunCalc.getPosition(times.sunsetStart, lat, long)

  console.log("Sunset", sunsetPos)


  return {
    start: {
      azimuth: sunsetStartPos.azimuth * 180 / Math.PI,
      altitude: sunsetStartPos.altitude * 180 / Math.PI
    },
    end: {
      azimuth: sunsetPos.azimuth * 180 / Math.PI,
      altitude: sunsetPos.altitude * 180 / Math.PI
    }
  }

}


export const sunsetTriangle = (point, date = new Date(), distance = 10000) => {
  console.log("Target", point)
  const pos = findSun(point.lat, point.lng, date)
  //relative to the target point, we find where the sun sets. 
  //we then draw a line to extend the path

  const start = computeDestinationPoint(
    { latitude: point.lat, longitude: point.lng },
    distance,
    pos.start.azimuth
  )

  const end = computeDestinationPoint(
    { latitude: point.lat, longitude: point.lng },
    distance,
    pos.end.azimuth
  )


  const res = [
    [point.lat, point.lng],
    [start.latitude, start.longitude],
    [end.latitude, end.longitude],
  ]

  // console.log("Result", res)

  return res;
}

export const minMax = (lat, long) => {
  let year = new Date().getFullYear()

  const maxDate = new Date(year, 5, 21) //Jun 21: will be min date for the southern hemisphare
  const minDate = new Date(year, 11, 22) //Dec 22 


  function azimuth(date) {
    return SunCalc.getPosition(SunCalc.getTimes(date, lat, long).sunset, lat, long).azimuth
  }

  console.log("Max", azimuth(maxDate))

  //this doesn't change, why calculate all the time? 
  return { min: azimuth(minDate) * 180 / Math.PI, max: azimuth(maxDate) * 180 / Math.PI }
}

export const boundingBox = (point, distnace = 10000) => {
  const { min, max } = minMax(point.lat, point.lng)
  const lowerMost = computeDestinationPoint(
    { latitude: point.lat, longitude: point.lng },
    distnace,
    max
  );

  const topMost = computeDestinationPoint(
    { latitude: point.lat, longitude: point.lng },
    //   {latitude: 52.5209554, longitude: 13.4094429 },
    distnace,
    min
  );


  return [[point.lat, point.lng],
  [topMost.latitude, topMost.longitude],
  [lowerMost.latitude, lowerMost.longitude]]
}

export const findAlignmentTime = (a, b) => {

  const angle = getRhumbLineBearing(
    { latitude: a.lat, longitude: a.lng },
    { latitude: b.lat, longitude: b.lng }
  )

  console.log("Angle between markers", angle)
  const maxDivergence = 0.5

  const res = []
  for (let date = new Date(), i = 0; i < 365; date.setDate(date.getDate() + 1), i++) {

    const times = SunCalc.getTimes(date, a.lat, a.lng)
    const sunsetPos = SunCalc.getPosition(times.sunsetStart, a.lat, a.lng)

    const sunsetAngle = sunsetPos.azimuth * 180 / Math.PI

    if (Math.abs(sunsetAngle - angle) < maxDivergence) {
      res.push(times.sunsetStart)
    }

  }

  return res
}