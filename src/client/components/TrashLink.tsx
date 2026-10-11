import { Button, NamedIcon, useCurrentServerRequired, usePanelNavigate, useServerPermission } from '@pterodactyl/sdk';

/** A way into the trash from the file manager. */
export default function TrashLink() {
    const { identifier } = useCurrentServerRequired().attributes;
    const navigate = usePanelNavigate();

    if (!useServerPermission('file.delete')) {
        return null;
    }

    return (
        <Button.Text size='small' onClick={() => navigate({ extension: 'trash-bin', screen: 'trash', params: { id: identifier } })}>
            <span className='trash:inline-flex trash:items-center trash:gap-2'>
                <NamedIcon name='trash-2' className='trash:h-4 trash:w-4' />
                Trash
            </span>
        </Button.Text>
    );
}
