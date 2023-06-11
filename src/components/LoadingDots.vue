<template>
  <div class="dot-flashing"></div>
</template>

<style lang="scss" scoped>
.dot-flashing {
  position: relative;
  padding: 3rem auto;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  // background-color: #6eaffa;
  background-color: #25c7b1;
  color: #25c7b1;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}
.dot-flashing::before,
.dot-flashing::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
}
.dot-flashing::before {
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #25c7b1;
  color: #25c7b1;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 0s;
}
.dot-flashing::after {
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #25c7b1;
  color: #25c7b1;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% {
    background-color: #25c7b1;
  }
  50%,
  100% {
    background-color: rgba(153, 193, 253, 0.2);
  }
}
</style>
