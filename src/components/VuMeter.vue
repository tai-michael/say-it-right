<template>
  <!-- <canvas ref="canvas" :style="{ color: color }" class="canvas-class" /> -->
  <canvas ref="canvas" class="canvas-class" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// const color = '#60e0ff'
const canvas = ref(null)
let VUTarget = 0
let VUUpdateTimeStamp = 0
const VULevels: number[] = [0, 0]
// const VULevels: number[] = [0, 0, 0] // increase to add more bars

const updateVU = (level: number, seekTimeMs: number) => {
  if (Date.now() > VUUpdateTimeStamp) {
    VUTarget = level
  } else {
    VUTarget = Math.max(VUTarget, level)
  }
  VUUpdateTimeStamp = Date.now() + seekTimeMs
}

defineExpose({
  updateVU
})

const getPixelRatio = (context: any) => {
  const backingStore: number =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1

  return (window.devicePixelRatio || 1) / backingStore
}

// const roundRect = (
//   ctx: CanvasRenderingContext2D,
//   x: number,
//   y: number,
//   width: number,
//   height: number,
//   radius: number
// ) => {
//   if (width < 2 * radius) radius = width / 2
//   if (height < 2 * radius) radius = height / 2
//   ctx.beginPath()
//   ctx.moveTo(x + radius, y)
//   ctx.arcTo(x + width, y, x + width, y + height, radius)
//   ctx.arcTo(x + width, y + height, x, y + height, radius)
//   ctx.arcTo(x, y + height, x, y, radius)
//   ctx.arcTo(x, y, x + width, y, radius)
//   ctx.closePath()
// }

onMounted(() => {
  let requestId: any
  const numVUs = (VULevels.length - 1) * 2 + 1
  const vuWidthWeight = 3
  const vuGapWeight = 1
  const totalWeight = vuWidthWeight * numVUs + vuGapWeight * (numVUs - 1)

  const SeekRatio = 0.15
  const DecayRatio = 0.25
  const AdoptRatio = 0.25
  const VUMinLevel = 0.25

  const render = () => {
    requestId = requestAnimationFrame(render)
    if (!canvas.value) return
    const context = canvas.value.getContext('2d')
    if (!context) return

    const ratio = getPixelRatio(context)
    const width = Number.parseInt(
      getComputedStyle(canvas.value).getPropertyValue('width').slice(0, -2)
    )
    const height = Number.parseInt(
      getComputedStyle(canvas.value).getPropertyValue('height').slice(0, -2)
    )
    canvas.value.width = width * ratio
    canvas.value.height = height * ratio

    if (Date.now() < VUUpdateTimeStamp) {
      VULevels[0] = VUTarget * SeekRatio + VULevels[0] * (1.0 - SeekRatio)
    } else {
      VULevels[0] = VUMinLevel * DecayRatio + VULevels[0] * (1.0 - DecayRatio)
    }

    let i = 1
    while (i < VULevels.length) {
      VULevels[i] =
        VULevels[i - 1] * AdoptRatio +
        VULevels[i] * (1.0 - DecayRatio - AdoptRatio) +
        VUMinLevel * DecayRatio
      i++
    }

    context.clearRect(0, 0, canvas.value.width, canvas.value.height)
    // canvas.value.style.width = `${width}px`;
    // canvas.value.style.height = `${height}px`;

    const rad = (vuWidthWeight / totalWeight) * canvas.value.width * 0.5
    const spacing = ((vuGapWeight + vuWidthWeight) / totalWeight) * canvas.value.width
    context.fillStyle = window.getComputedStyle(canvas.value).color || '#000000'

    for (i = 0; i < VULevels.length; i++) {
      const l = VULevels[i] * canvas.value.height
      // Right symmetrical VU
      context.fillRect(
        canvas.value.width * 0.5 + i * spacing - rad,
        (canvas.value.height - l) * 0.5,
        rad * 2,
        l
      )
      context.fill()
      // Left symmetrical VU
      if (i > 0) {
        context.fillRect(
          canvas.value.width * 0.5 - i * spacing - rad,
          (canvas.value.height - l) * 0.5,
          rad * 2,
          l
        )
        context.fill()
      }

      // NOTE Dots / cylindrical bars
      // const l = VULevels[i] * canvas.value.height
      // // Right symmetrical VU
      // if (l * canvas.value.height > 2 * rad) {
      //   roundRect(
      //     context,
      //     canvas.value.width * 0.5 - rad + i * spacing,
      //     (canvas.value.height - l) * 0.5,
      //     rad * 2,
      //     l,
      //     rad
      //   )
      // } else {
      //   context.beginPath()
      //   context.arc(
      //     canvas.value.width * 0.5 + i * spacing,
      //     canvas.value.height * 0.5,
      //     l * canvas.value.height * 0.5,
      //     0,
      //     Math.PI * 2
      //   )
      // }
      // context.fill()
      // // Left symmetrical VU
      // if (i > 0) {
      //   if (l * canvas.value.height > 2 * rad) {
      //     roundRect(
      //       context,
      //       canvas.value.width * 0.5 - rad - i * spacing,
      //       (canvas.value.height - l) * 0.5,
      //       rad * 2,
      //       l,
      //       rad
      //     )
      //   } else {
      //     context.beginPath()
      //     context.arc(
      //       canvas.value.width * 0.5 - i * spacing,
      //       canvas.value.height * 0.5,
      //       l * canvas.value.height * 0.5,
      //       0,
      //       Math.PI * 2
      //     )
      //   }
      //   context.fill()
      // }
    }
  }

  render()

  // updateVU(1.0, 500)
  updateVU(0.65, 500)

  return () => {
    cancelAnimationFrame(requestId)
  }
})
</script>

<style lang="scss" scoped>
.canvas-class {
  color: rgb(56, 128, 255);
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 1.35rem;
  display: block;
  width: 2.25rem;
  height: 2.25rem;
  margin: 0;
  // width: 2.5rem; // For dotted/cylindrical bars
  // height: 2.65rem; // For dotted/cylindrical bars
  // width: 1.35rem;
  // height: 1.5rem;
  // padding: 0 0.8rem 0 0rem;
}
</style>
