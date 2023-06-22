import useTextToSpeechConverter from '@/composables/useTextToSpeechConverter'
import { db } from '@/firebaseInit'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default async function (text: string, gender: string, stability: number) {
  // e.g. changes 'Details.' to 'details'
  const normalizedWord = text.toLocaleLowerCase().slice(0, -1)

  const documentRef = doc(db, 'audio_for_words', normalizedWord)
  const documentSnapshot = await getDoc(documentRef)

  let audioBlob
  if (documentSnapshot.exists()) {
    const base64Audio = documentSnapshot.data().audioBlob
    audioBlob = await (await fetch(base64Audio)).blob()
    console.log('existing audio blob retrieved')
  } else {
    audioBlob = await useTextToSpeechConverter(text, gender, stability)
    console.log('new audio blob generated')

    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    const base64Audio = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result)
    })

    setDoc(documentRef, { audioBlob: base64Audio })
  }

  try {
    // Create an AudioContext and decode the audio data
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer())

    // Play the audio
    const audioSource = audioContext.createBufferSource()
    audioSource.buffer = audioBuffer
    audioSource.connect(audioContext.destination)
    audioSource.start(0)

    // console.log('Audio stream has ended')
  } catch (error) {
    console.error('Error during audio playback:', error)
  }
}
