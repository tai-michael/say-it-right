import { createAnimation } from '@ionic/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customEnterAnimation = (baseEl: HTMLElement, opts?: any) => {
  const enteringEl = opts?.enteringEl
  const leavingEl = opts?.leavingEl

  const enteringAnimation = createAnimation()
    .addElement(enteringEl)
    .duration(250)
    .fromTo('transform', 'translateX(-100%)', 'translateX(0%)')
    .fromTo('opacity', '0', '1')

  const leavingAnimation = createAnimation()
    .addElement(leavingEl)
    .duration(250)
    .fromTo('transform', 'translateX(0%)', 'translateX(100%)')
    .fromTo('opacity', '1', '0')

  return createAnimation().addAnimation([enteringAnimation, leavingAnimation])
}
