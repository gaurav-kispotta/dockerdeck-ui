import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ModalType = 'error' | 'warning' | 'info' | null

interface ShowModalPayload {
  modalType: ModalType
  title: string
  body: string
}

interface WindowState {
  isModalVisible: boolean
  modalType: ModalType
  modalTitle: string
  modalBody: string
}

const initialState: WindowState = {
  isModalVisible: false,
  modalType: null,
  modalTitle: '',
  modalBody: '',
}

const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<ShowModalPayload>) => {
      state.isModalVisible = true
      state.modalType = action.payload.modalType
      state.modalTitle = action.payload.title
      state.modalBody = action.payload.body
    },
    hideModal: (state) => {
      state.isModalVisible = false
      state.modalType = null
      state.modalTitle = ''
      state.modalBody = ''
    },
  },
})

export const { showModal, hideModal } = windowSlice.actions
export default windowSlice.reducer
