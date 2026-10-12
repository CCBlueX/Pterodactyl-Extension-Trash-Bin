import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, NamedIcon, ServerContentBlock, Switch, Table, httpErrorToHuman, toast, useCurrentServerRequired } from '@pterodactyl/sdk';
import { deleteItem, emptyTrash, getTrash, keys, restoreItem, setTrashEnabled, type TrashContents, type TrashItem } from '../api';
import { formatAgo, formatBytes } from '../format';

function Summary({ data }: { data: TrashContents }) {
    const kept = data.retention_days > 0 ? `for ${data.retention_days} days` : 'until you empty the trash';

    return (
        <p className='trash:text-sm trash:text-muted-foreground'>
            {data.enabled ? (
                <>
                    Files you delete in the file manager land here {kept}. To skip the trash, tick them there and choose <span className='trash:text-foreground'>Delete permanently</span>.
                </>
            ) : (
                <>
                    The trash is off: files you delete in the file manager are gone for good.
                    {data.items.length > 0 && ` What is already here stays ${kept}.`}
                </>
            )}
            {data.size > 0 && ` The trash takes up ${formatBytes(data.size)}.`}
        </p>
    );
}

const changedLine = ({ enabled, changed }: TrashContents) =>
    changed ? `Turned ${enabled ? 'on' : 'off'} by ${changed.by ?? 'a removed user'} ${formatAgo(changed.at)}.` : 'Turn it off to delete files for good right away.';

export default function TrashScreen() {
    const { identifier } = useCurrentServerRequired().attributes;
    const queryClient = useQueryClient();
    const trash = useQuery({ queryKey: keys.trash(identifier), queryFn: () => getTrash(identifier) });
    const [deleting, setDeleting] = useState<TrashItem | null>(null);
    const [emptying, setEmptying] = useState(false);
    const update = (result: TrashContents) => queryClient.setQueryData(keys.trash(identifier), result);
    const onError = (error: unknown) => toast.error(httpErrorToHuman(error));

    const restoring = useMutation({
        mutationFn: (item: TrashItem) => restoreItem(identifier, item.id),
        onSuccess: ({ path }) => (toast.success(`Restored to ${path}.`), queryClient.invalidateQueries({ queryKey: keys.trash(identifier) })),
        onError,
    });
    const removal = useMutation({ mutationFn: (item: TrashItem) => deleteItem(identifier, item.id), onSuccess: (result) => (update(result), setDeleting(null)), onError });
    const clearing = useMutation({ mutationFn: () => emptyTrash(identifier), onSuccess: (result) => (update(result), setEmptying(false)), onError });
    const toggling = useMutation({
        mutationFn: (enabled: boolean) => setTrashEnabled(identifier, enabled),
        onSuccess: (result) => (update(result), toast.success(result.enabled ? 'Deleted files go to the trash again.' : 'Deleted files now skip the trash.')),
        onError,
    });

    const data = trash.data;

    return (
        <ServerContentBlock title='Trash'>
            <div className='trash:mb-4 trash:flex trash:flex-col trash:gap-3 trash:sm:flex-row trash:sm:items-center trash:sm:justify-between'>
                {data && <Summary data={data} />}
                {data && data.items.length > 0 && (
                    <Button.Danger size='small' className='trash:shrink-0' onClick={() => setEmptying(true)}>
                        Empty trash
                    </Button.Danger>
                )}
            </div>
            {data && (
                <Switch
                    className='trash:mb-4 trash:rounded-sm trash:bg-card trash:p-4'
                    checked={data.enabled}
                    disabled={toggling.isPending}
                    onChange={(enabled) => toggling.mutate(enabled)}
                    label='Move deleted files to the trash'
                    description={changedLine(data)}
                />
            )}
            <Table
                rows={data?.items ?? []}
                keyOf={(item) => item.id}
                isFetching={trash.isFetching}
                emptyState={trash.isLoading ? 'Loading...' : trash.isError ? httpErrorToHuman(trash.error) : 'The trash is empty.'}
                columns={[
                    {
                        id: 'name',
                        label: 'Name',
                        cell: (item) => (
                            <span className='trash:flex trash:min-w-0 trash:items-center trash:gap-2'>
                                <NamedIcon name={item.directory ? 'folder' : 'file'} className='trash:h-4 trash:w-4 trash:shrink-0 trash:text-muted-foreground' />
                                <span className='trash:truncate trash:text-foreground'>{item.name}</span>
                            </span>
                        ),
                    },
                    { id: 'folder', label: 'From', cell: (item) => <span className='trash:font-mono trash:text-xs'>{item.folder}</span> },
                    { id: 'size', label: 'Size', cell: (item) => (item.size === null ? '–' : formatBytes(item.size)) },
                    { id: 'deleted', label: 'Deleted', cell: (item) => <span title={new Date(item.deleted_at).toLocaleString()}>{formatAgo(item.deleted_at)}</span> },
                    {
                        id: 'actions',
                        label: '',
                        cell: (item) => (
                            <div className='trash:flex trash:justify-end trash:gap-2'>
                                <Button.Text size='xsmall' disabled={restoring.isPending} onClick={() => restoring.mutate(item)}>
                                    Restore
                                </Button.Text>
                                <Button.Danger size='xsmall' onClick={() => setDeleting(item)}>
                                    Delete forever
                                </Button.Danger>
                            </div>
                        ),
                    },
                ]}
            />
            <Dialog.Confirm open={deleting !== null} onClose={() => setDeleting(null)} title={`Delete ${deleting?.name} forever?`} confirm='Delete forever' pending={removal.isPending} onConfirmed={() => deleting && removal.mutate(deleting)}>
                It cannot be restored afterwards.
            </Dialog.Confirm>
            <Dialog.Confirm open={emptying} onClose={() => setEmptying(false)} title='Empty the trash?' confirm='Empty trash' pending={clearing.isPending} onConfirmed={() => clearing.mutate()}>
                Everything in the trash is deleted for good.
            </Dialog.Confirm>
        </ServerContentBlock>
    );
}
