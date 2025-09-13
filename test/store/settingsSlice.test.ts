import { describe, it, expect } from 'vitest'
import { store } from '../../src/store/store'
import { setPlatformPadding, setNodeLevelPadding, setNodeSize } from '../../src/store/settingsSlice'

describe('Settings Redux Store', () => {
  it('should have initial state', () => {
    const state = store.getState()
    expect(state.settings.platformPadding).toBe(100)
    expect(state.settings.nodeLevelPadding).toBe(80)
    expect(state.settings.nodeSize).toBe(100)
  })

  it('should update platform padding', () => {
    store.dispatch(setPlatformPadding(150))
    const state = store.getState()
    expect(state.settings.platformPadding).toBe(150)
  })

  it('should update node level padding', () => {
    store.dispatch(setNodeLevelPadding(120))
    const state = store.getState()
    expect(state.settings.nodeLevelPadding).toBe(120)
  })

  it('should update node size', () => {
    store.dispatch(setNodeSize(150))
    const state = store.getState()
    expect(state.settings.nodeSize).toBe(150)
  })
})
