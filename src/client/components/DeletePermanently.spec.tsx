import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createExtensionTestHost, createTestServer } from '@pterodactyl/sdk/testing';
import type { FileManagerSlotData } from '@pterodactyl/sdk';
import * as api from '../api';
import DeletePermanently from './DeletePermanently';

vi.mock('../api', async (importOriginal) => ({ ...(await importOriginal<typeof import('../api')>()), deletePermanently: vi.fn().mockResolvedValue(undefined) }));

let host: ReturnType<typeof createExtensionTestHost> | undefined;

afterEach(() => {
    cleanup();
    host?.dispose();
    host = undefined;
    vi.clearAllMocks();
});

function renderAction(permissions: { owner: boolean; permissions?: string[] }) {
    const server = createTestServer({ identifier: 'abcd1234', ...permissions });
    const data: FileManagerSlotData = { server, directory: '/plugins', files: [], selectedFiles: ['config.yml', 'world'], isFetching: false, setSelectedFiles: vi.fn(), refresh: vi.fn().mockResolvedValue(undefined) };
    host = createExtensionTestHost({ extensionId: 'trash-bin', prefix: 'trash', server });
    render(
        <>
            <DeletePermanently data={data} />
            <p>Move</p>
        </>,
        { wrapper: host.Wrapper }
    );

    return data;
}

test('lists what is deleted for good and skips the trash once confirmed', async () => {
    const data = renderAction({ owner: true });

    fireEvent.click(await screen.findByRole('button', { name: 'Delete permanently' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Delete 2 files permanently?')).toBeTruthy();
    expect(within(dialog).getByText('This skips the trash and cannot be undone.')).toBeTruthy();
    expect(within(dialog).getByText('config.yml')).toBeTruthy();
    expect(within(dialog).getByText('world')).toBeTruthy();
    expect(api.deletePermanently).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete permanently' }));
    await waitFor(() => expect(api.deletePermanently).toHaveBeenCalledWith('abcd1234', '/plugins', ['config.yml', 'world']));
    await waitFor(() => expect(data.setSelectedFiles).toHaveBeenCalledWith([]));
    expect(data.refresh).toHaveBeenCalled();
});

test('is hidden from users who cannot delete files', async () => {
    renderAction({ owner: false, permissions: ['file.read'] });

    expect(await screen.findByText('Move')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Delete permanently' })).toBeNull();
});
