import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createExtensionTestHost, createTestServer } from '@pterodactyl/sdk/testing';
import * as api from '../api';
import TrashScreen from './TrashScreen';

vi.mock('../api', async (importOriginal) => ({ ...(await importOriginal<typeof import('../api')>()), getTrash: vi.fn(), setTrashEnabled: vi.fn() }));

afterEach(cleanup);

function renderScreen() {
    const host = createExtensionTestHost({ extensionId: 'trash-bin', prefix: 'trash', server: createTestServer({ owner: true }) });
    render(<TrashScreen />, { wrapper: host.Wrapper });

    return host;
}

test('lists trashed files with where they came from', async () => {
    vi.mocked(api.getTrash).mockResolvedValue({
        items: [{ id: 'abcdefghijkl', name: 'config.yml', folder: '/plugins/Essentials', directory: false, size: 2048, deleted_at: new Date().toISOString() }],
        size: 2048,
        retention_days: 30,
        enabled: true,
        changed: null,
    });
    const host = renderScreen();

    expect(await screen.findByText('config.yml')).toBeTruthy();
    expect(screen.getByText('/plugins/Essentials')).toBeTruthy();
    expect(screen.getByText(/land here for 30 days\. To skip the trash, tick them there and choose/)).toBeTruthy();
    expect(screen.getByText('Delete permanently')).toBeTruthy();
    expect(screen.getByText(/The trash takes up 2\.0 KiB/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Empty trash' })).toBeTruthy();
    host.dispose();
});

test('says when the trash is empty', async () => {
    vi.mocked(api.getTrash).mockResolvedValue({ items: [], size: 0, retention_days: 0, enabled: true, changed: null });
    const host = renderScreen();

    expect(await screen.findByText('The trash is empty.')).toBeTruthy();
    expect(screen.getByText(/land here until you empty the trash\./)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Empty trash' })).toBeNull();
    host.dispose();
});

test('turns the trash off for this server and says who did it', async () => {
    vi.mocked(api.getTrash).mockResolvedValue({ items: [], size: 0, retention_days: 30, enabled: true, changed: null });
    vi.mocked(api.setTrashEnabled).mockResolvedValue({ items: [], size: 0, retention_days: 30, enabled: false, changed: { by: 'Alex', at: new Date().toISOString() } });
    const host = renderScreen();

    const toggle = await screen.findByRole('switch', { name: 'Move deleted files to the trash' });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggle);

    await waitFor(() => expect(api.setTrashEnabled).toHaveBeenCalledWith('test-server', false));
    expect(await screen.findByText('Turned off by Alex just now.')).toBeTruthy();
    expect(screen.getByText(/The trash is off: files you delete in the file manager are gone for good\./)).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Move deleted files to the trash' }).getAttribute('aria-checked')).toBe('false');
    host.dispose();
});
