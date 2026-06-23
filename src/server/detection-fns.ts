import { createServerFn } from '@tanstack/react-start'

const HF_SPACE_URL = 'https://medevargane-olive-disease-detector.hf.space/predict'

export type Detection = {
  bbox: [number, number, number, number]
  class: string
  confidence: number
}

export type DetectionResult = {
  detections: Detection[]
  error?: string
}

export const runDetection = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: FormData }) => {
    const modelName = data.get('model_name') as string
    const file = data.get('file') as File

    if (!file) throw new Error('No file provided')
    if (!modelName) throw new Error('No model selected')

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(
      `${HF_SPACE_URL}?model_name=${encodeURIComponent(modelName)}`,
      {
        method: 'POST',
        body: formData,
      },
    )

    if (!response.ok) {
      throw new Error(`HF Space error: ${response.status} ${response.statusText}`)
    }

    const result = (await response.json()) as DetectionResult
    return result
  },
)