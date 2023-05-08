<template>
  <!-- <transition name="appear" @enter="onEnter" @leave="onLeave"> -->
  <!-- <transition name="appear" @enter="onEnter" mode="out-in"> -->
  <transition name="appear" appear>
    <slot></slot>
  </transition>
</template>

<script setup>
// const onEnter = (el, done) => {
//   const delay = 2000 // Delay in milliseconds
//   setTimeout(() => {
//     el.style.opacity = 1
//     done()
//   }, delay)
// }

// onLeave()
</script>

<style>
.appear-appear-from,
.appear-appear-to {
  opacity: 0;
}
.appear-appear-active {
  transition: opacity 0.3s;
}
</style>
