import axios from 'axios'

export default async function (text: string, gender = 'female', stability = 0.75) {
  try {
    const url = import.meta.env.VITE_TEXT_TO_SPEECH_GENERATOR_ENDPOINT
    // Default official 'stability' is 0.75, maximum is 1. Increasing stability makes the voice more consistent between regenerations, but it can also make it sounds a bit monotone. On longer text fragments elevenlabs recommends lowering this value.
    // To change voices for gender, modify voiceId in cloud function, or modify this composable and the cloud function so that 'gender' in this composable points to a voiceId, and use 'voiceId' rather than 'gender' as a parameter
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
    // Closing the reader is not strictly necessary, as it should be automatically closed after the while loop finishes reading the data
    await reader.closed

    // Combine the audio chunks into a single Blob
    const audioBlob = new Blob(audioChunks)
    return audioBlob
  } catch (error) {
    console.log(error)
  }
}
