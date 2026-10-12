import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, NamedIcon, useCurrentServerRequired, usePanelNavigate, useServerPermission } from '@pterodactyl/sdk';
import { toolbarButtonClass, useToolbarSpot } from '../lib/fileToolbar';

/** A way into the trash next to "New folder". */
export default function TrashLink() {
    const { identifier } = useCurrentServerRequired().attributes;
    const navigate = usePanelNavigate();
    const [slot, setSlot] = useState<HTMLDivElement | null>(null);
    const { host, shared } = useToolbarSpot(slot);

    if (!useServerPermission('file.delete')) {
        return null;
    }

    const button = (
        <Button isSecondary className={toolbarButtonClass(shared)} onClick={() => navigate({ extension: 'trash-bin', screen: 'trash', params: { id: identifier } })}>
            <span className='trash:inline-flex trash:items-center trash:gap-2'>
                <NamedIcon name='trash-2' aria-hidden className='trash:h-4 trash:w-4' />
                Trash
            </span>
        </Button>
    );

    return (
        <div ref={setSlot} className={host ? 'trash:hidden' : 'trash:mr-4 trash:mb-4 trash:inline-flex trash:align-top'}>
            {host ? createPortal(button, host) : button}
        </div>
    );
}
