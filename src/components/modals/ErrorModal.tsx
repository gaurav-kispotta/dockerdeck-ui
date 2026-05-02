import { Modal } from 'antd';
import { useFileUpload } from "../../context/ReduxAppContext";

export default function DockerDeckErrorModal() {
    const [modal, contextHolder] = Modal.useModal();
    const [] = useFileUpload()

    const modalConfig = {
        title: 'Title',
        content: 'Some contents...',
    };

  return (
    <div>ErrorModal</div>
  )
}
