import { Modal, Alert, Typography } from 'antd'
import { useWindowModal } from '../../hooks/useWindowModal'
import { useWindowFromStore } from '../../hooks/useReduxHooks'
import { useModalContext } from '../../context/ModalContext'

const { Text } = Typography

export default function AppModal() {
  const { closeModal } = useWindowModal()
  const { isModalVisible, modalType, modalTitle, modalBody } = useWindowFromStore()
  const { bodyNode } = useModalContext()

  const alertType =
    modalType === 'error' ? 'error'
    : modalType === 'warning' ? 'warning'
    : 'info'

  return (
    <Modal
      open={isModalVisible}
      title={modalTitle}
      onCancel={closeModal}
      onOk={closeModal}
      okText="Dismiss"
      cancelButtonProps={{ style: { display: 'none' } }}
      centered
    >
      <Alert
        type={alertType}
        showIcon
        description={bodyNode ?? <Text>{modalBody}</Text>}
        style={{ marginTop: 8 }}
      />
    </Modal>
  )
}
