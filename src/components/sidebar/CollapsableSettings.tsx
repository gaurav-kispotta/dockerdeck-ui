import { useState } from "react";

interface CollapsableSettingsProps {
    title?: string;
}

function CollapsableSettings({ title }: CollapsableSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="my-accordion-2" checked={isOpen} onChange={() => setIsOpen(!isOpen)} />
            <div className="collapse-title font-semibold">
                {title || 'How do I create an account?'}
            </div>
            <div className="collapse-content text-sm">
                Click the "Sign Up" button in the top right corner and follow the registration process.
            </div>
        </div>
    );
};

export default CollapsableSettings;
