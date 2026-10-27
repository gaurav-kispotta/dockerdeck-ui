import '@xyflow/react/dist/style.css';

interface ServiceGroupNodeProperties {
    id: string;
}

function ServiceGroupNode({ id }: ServiceGroupNodeProperties) {
    return (
        <>
            <div>{id}</div>
        </>
    )
}

export default ServiceGroupNode
