import { describe, it, expect, beforeEach } from 'vitest'
import { useConvertStore } from '@/stores/useConvertStore'
import { useAppStore } from '@/stores/useAppStore'

describe('useConvertStore', () => {
  beforeEach(() => {
    useConvertStore.setState(useConvertStore.getInitialState())
  })

  it('has correct initial state', () => {
    const state = useConvertStore.getState()
    expect(state.sourceFile).toBeNull()
    expect(state.sourcePreview).toBeNull()
    expect(state.resultSvg).toBeNull()
    expect(state.analysis).toBeNull()
    expect(state.isAnalyzing).toBe(false)
    expect(state.isConverting).toBe(false)
    expect(state.error).toBeNull()
    expect(state.uploadPath).toBeNull()
    expect(state.isUploading).toBe(false)
  })

  it('sets and clears error', () => {
    const { setError } = useConvertStore.getState()
    setError('Something went wrong')
    expect(useConvertStore.getState().error).toBe('Something went wrong')

    setError(null)
    expect(useConvertStore.getState().error).toBeNull()
  })

  it('sets analysis data', () => {
    const { setAnalysis } = useConvertStore.getState()
    const analysis = {
      analysis: 'Test analysis',
      engine: 'potrace',
      strategy: 'threshold',
      expectedFidelity: 'faithful_recreation',
    }
    setAnalysis(analysis)
    expect(useConvertStore.getState().analysis).toEqual(analysis)
  })

  it('sets result SVG', () => {
    const { setResultSvg } = useConvertStore.getState()
    setResultSvg('<svg></svg>')
    expect(useConvertStore.getState().resultSvg).toBe('<svg></svg>')
  })

  it('resets to initial state', () => {
    const store = useConvertStore.getState()
    store.setError('test')
    store.setResultSvg('<svg></svg>')
    store.setAnalyzing(true)

    store.reset()

    const state = useConvertStore.getState()
    expect(state.error).toBeNull()
    expect(state.resultSvg).toBeNull()
    expect(state.isAnalyzing).toBe(false)
  })
})

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      user: null,
      isLoading: true,
      selectedModel: 'opus-4.6',
      sidebarOpen: true,
    })
  })

  it('has correct default model', () => {
    expect(useAppStore.getState().selectedModel).toBe('opus-4.6')
  })

  it('switches model', () => {
    useAppStore.getState().setSelectedModel('sonnet-4.6')
    expect(useAppStore.getState().selectedModel).toBe('sonnet-4.6')
  })

  it('toggles sidebar', () => {
    expect(useAppStore.getState().sidebarOpen).toBe(true)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarOpen).toBe(false)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarOpen).toBe(true)
  })
})
