export default async function useConvertTextToSpeech(text: string, gender = 'female') {
  try {
    // Use this particular female voice ('Bella') for sentence/paragraph playback, as it sounds more natural than the others
    let voiceId = ''
    if (gender === 'male') voiceId = 'pNInz6obpgDQGcFmaJgB'
    else if (gender === 'female') voiceId = 'EXAVITQu4vr4xnSDxMaL'

    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
    // These are the recommended settings by Eleven Labs
    const voiceSettings = {
      // Increasing stability will make the voice more consistent between regenerations, but it can also make it sounds a bit monotone. On longer text fragments they recommend lowering this value.
      stability: 0.75,
      // High enhancement boosts overall voice clarity and target speaker similarity. Very high values can cause artifacts, so adjusting this setting to find the optimal value is encouraged.
      similarity_boost: 0.75
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        voice_settings: voiceSettings
      })
    })

    if (!response.ok) throw new Error(`Failed to generate audio for '${text}'.`)

    const stream = response.body
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
