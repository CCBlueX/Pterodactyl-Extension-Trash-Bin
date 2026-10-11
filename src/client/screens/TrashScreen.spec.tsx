import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { createExtensionTestHost, createTestServer } from '@pterodactyl/sdk/testing';
import * as api from '../api';
import TrashScreen from './TrashScreen';

vi.mock('../api', async (importOriginal) => ({ ...(await importOriginal<typeof import('../api')>()), getTrash: vi.fn() }));

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
    });
    const host = renderScreen();

    expect(await screen.findByText('config.yml')).toBeTruthy();
    expect(screen.getByText('/plugins/Essentials')).toBeTruthy();
    expect(screen.getByText(/stay here for 30 days\. They take up 2\.0 KiB/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Empty trash' })).toBeTruthy();
    host.dispose();
});

test('says when the trash is empty', async () => {
    vi.mocked(api.getTrash).mockResolvedValue({ items: [], size: 0, retention_days: 0 });
    const host = renderScreen();

    expect(await screen.findByText('The trash is empty.')).toBeTruthy();
    expect(screen.getByText('Deleted files stay here until you empty the trash.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Empty trash' })).toBeNull();
    host.dispose();
});
