import { BrowserClient, BrowserMicrophone } from '@speechly/browser-client'
// NOTE maybe put in App.js instead
import '@speechly/browser-ui/core/push-to-talk-button'
import '@speechly/browser-ui/core/big-transcript'
import '@speechly/browser-ui/core/intro-popup'

export const microphone = new BrowserMicrophone()
export const client = new BrowserClient({
  appId: '20b0ff74-506d-4327-8970-73b671c98193',
  logSegments: false,
  debug: false
  // NOTE Voice Activity Detection (VAD) reduces the CPU load of the decoder, as it prevents the decoder from processing silent parts of the audio. However, it may also introduce some errors in the resulting transcript. For the purposes of this app, VAD should probably be disabled.
  // vad: { enabled: isVadEnabled },
})
