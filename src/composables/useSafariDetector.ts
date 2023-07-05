import { ref } from 'vue'

export default function () {
  const isSafari = ref(
    navigator.vendor.match(/apple/i) &&
      !navigator.userAgent.match(/crios/i) &&
      !navigator.userAgent.match(/fxios/i) &&
      !navigator.userAgent.match(/Opera|OPT\//)
  )

  return { isSafari }
}
