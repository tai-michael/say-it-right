import axios from 'axios'

export default async function (text: string, gender = 'female', stability = 0.75) {
  try {
    const url = import.meta.env.VITE_TEXT_TO_SPEECH_GENERATOR_ENDPOINT
    const params = {
      text,
      gender,
      stability
    }
    const response = await axios.get(url, { params, responseType: 'blob' })
    const stream = response.data.stream()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const reader = stream!.getReader()
    const audioChunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      audioChunks.push(value)
    }

    // Combine the audio chunks into a single Blob
    const audioBlob = new Blob(audioChunks)

    // Create an AudioContext and decode the audio data
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer())

    // Play the audio
    const audioSource = audioContext.createBufferSource()
    audioSource.buffer = audioBuffer
    audioSource.connect(audioContext.destination)
    audioSource.start(0)

    await reader.closed
    console.log('Audio stream has ended')
  } catch (error) {
    console.log(error)
  }
}
