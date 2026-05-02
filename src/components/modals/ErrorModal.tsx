import { Modal, Typography, Alert } from 'antd'
import { useAppDispatch, useWindowFromStore } from '../../hooks/useReduxHooks'
import { hideModal } from '../../store/slices/windowSlice'

const { Text } = Typography

export default function DockerDeckErrorModal() {
  const dispatch = useAppDispatch()
  const { isModalVisible, modalType, modalTitle, modalBody } = useWindowFromStore()

  const handleClose = () => {
    dispatch(hideModal())
  }

  const alertType = modalType === 'error' ? 'error'
    : modalType === 'warning' ? 'warning'
    : 'info'

  return (
    <Modal
      open={isModalVisible}
      title={modalTitle}
      onCancel={handleClose}
      onOk={handleClose}
      okText="Dismiss"
      cancelButtonProps={{ style: { display: 'none' } }}
      centered
    >
      <Alert
        type={alertType}
        showIcon
        description={<Text>{modalBody}</Text>}
        style={{ marginTop: 8 }}
      />
    </Modal>
  )
}

