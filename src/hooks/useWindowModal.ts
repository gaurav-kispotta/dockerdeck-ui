import { ReactNode } from 'react'
import { useAppDispatch } from './useReduxHooks'
import { showModal, hideModal } from '../store/slices/windowSlice'
import type { ModalType } from '../store/slices/windowSlice'
import { useModalContext } from '../context/ModalContext'

interface OpenModalOptions {
  type: ModalType
  title: string
  body: string | ReactNode
}

export const useWindowModal = () => {
  const dispatch = useAppDispatch()
  const { setBodyNode } = useModalContext()

  const openModal = ({ type, title, body }: OpenModalOptions) => {
    if (typeof body === 'string') {
      setBodyNode(null)
      dispatch(showModal({ modalType: type, title, body }))
    } else {
      setBodyNode(body)
      dispatch(showModal({ modalType: type, title, body: '' }))
    }
  }

  const closeModal = () => {
    setBodyNode(null)
    dispatch(hideModal())
  }

  return { openModal, closeModal }
}
