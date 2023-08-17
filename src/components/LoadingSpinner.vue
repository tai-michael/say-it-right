<template>
  <div class="flex h-full items-center justify-center max-h-[100vh]">
    <div class="spinner">
      <span class="spinner material"></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.spinner {
  // margin: 2rem;
  // text-align: center;
  display: block;
  height: 40px;
  position: relative;
  letter-spacing: 0.5px;

  .spinner::after {
    content: '';
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    position: absolute;
    top: calc(50% - 20px);
    left: calc(50% - 20px);
    border-radius: 50%;
  }
  .spinner.material::after {
    // border-top: 3px solid #298eec;
    border-top: 3px solid #25c7b1;
    border-left: 3px solid #25c7b1;
    border-bottom: 3px solid #25c7b1;
    border-right: 3px solid rgba(255, 255, 255, 0);
    animation: spinner 0.6s linear infinite;
  }

  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
