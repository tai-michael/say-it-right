<template>
  <!-- <transition name="fade" @enter="onEnter" @leave="onLeave"> -->
  <!-- <transition name="fade" @enter="onEnter" mode="out-in"> -->
  <transition name="fade" mode="out-in">
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
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
</style>
