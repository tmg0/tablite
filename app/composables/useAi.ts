import { type CoreMessage, streamText } from 'ai'

export interface UseStreamTextOptions {
  onFinish?: () => void
}

export function useAiProvider() {
  const { model: modelKey, googleAPIKey, deepseekApiKey, openrouterApiKey } = storeToRefs(useSettingsStore())

  const providerKey = computed(() => {
    const { provider } = MODULES.find(m => m.model === modelKey.value) ?? {}
    return provider
  })

  const apiKey = computed(() => {
    if (providerKey.value === 'google')
      return googleAPIKey.value
    if (providerKey.value === 'deepseek')
      return deepseekApiKey.value
    if (providerKey.value === 'openrouter')
      return openrouterApiKey.value
  })

  const provider = computed(() => {
    if (providerKey.value && apiKey.value) {
      return AI_PROVIDER_CREATOR[providerKey.value]?.({
        apiKey: apiKey.value,
      })
    }
  })

  const model = computed(() => {
    if (!provider.value)
      return
    return provider.value(modelKey.value)
  })

  return {
    provider,
    model,
  }
}

export function useStreamText(options: UseStreamTextOptions = {}) {
  const data = ref('')
  const system = ref('')
  const prompt = ref('')
  const messages = ref<CoreMessage[]>([])
  const { model } = useAiProvider()
  const isFetching = ref(false)

  function onFinish() {
    isFetching.value = false
    options.onFinish?.()
  }

  async function execute() {
    if (!model.value)
      return

    isFetching.value = true
    const result = streamText({
      model: model.value,
      messages: [
        system.value ? { role: 'system', content: system.value } : undefined,
        ...messages.value,
      ].filter(Boolean) as CoreMessage[],
      onFinish,
    })

    prompt.value = ''

    for await (const textPart of result.textStream) {
      data.value += textPart
    }
  }

  return {
    data,
    system,
    prompt,
    messages,
    execute,
  }
}
