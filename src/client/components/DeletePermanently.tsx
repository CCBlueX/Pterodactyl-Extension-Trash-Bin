import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, NamedIcon, httpErrorToHuman, toast, useServerPermission, type FileManagerSlotData } from '@pterodactyl/sdk';
import { deletePermanently } from '../api';

const LISTED = 15;

/** Deletes the ticked files for good, skipping the trash. */
export default function DeletePermanently({ data }: { data: FileManagerSlotData }) {
    const [open, setOpen] = useState(false);
    const files = data.selectedFiles;
    const deletion = useMutation({
        mutationFn: (picked: readonly string[]) => deletePermanently(data.server.attributes.identifier, data.directory, picked),
        onSuccess: (_, picked) => {
            toast.success(picked.length === 1 ? `Deleted ${picked[0]} permanently.` : `Deleted ${picked.length} files permanently.`);
            setOpen(false);
            data.setSelectedFiles([]);
            void data.refresh().catch(() => {});
        },
        onError: (error) => toast.error(httpErrorToHuman(error)),
    });

    if (!useServerPermission('file.delete')) {
        return null;
    }

    return (
        <>
            {/* Icon only on phones: the panel's selection bar does not wrap. */}
            <Button.Danger isSecondary aria-label='Delete permanently' className='trash:max-sm:px-3' onClick={() => setOpen(true)}>
                <span className='trash:inline-flex trash:align-middle trash:sm:hidden'>
                    <NamedIcon name='shredder' aria-hidden className='trash:h-4 trash:w-4' />
                </span>
                <span className='trash:max-sm:hidden'>Delete permanently</span>
            </Button.Danger>
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title={files.length === 1 ? `Delete ${files[0]} permanently?` : `Delete ${files.length} files permanently?`}
                confirm='Delete permanently'
                pending={deletion.isPending}
                onConfirmed={() => deletion.mutate(files)}
            >
                <p className='trash:mb-2'>This skips the trash and cannot be undone.</p>
                <ul className='trash:list-disc trash:pl-5'>
                    {files.slice(0, LISTED).map((file) => (
                        <li key={file} className='trash:break-all'>
                            {file}
                        </li>
                    ))}
                    {files.length > LISTED && <li>and {files.length - LISTED} more</li>}
                </ul>
            </Dialog.Confirm>
        </>
    );
}
