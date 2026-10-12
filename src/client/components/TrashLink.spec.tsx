import type { ComponentProps } from 'react';
import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createComponentTestHost, createTestFileManager } from '@pterodactyl/sdk/testing';
import TrashLink from './TrashLink';

let dispose: (() => void) | undefined;

afterEach(() => {
    cleanup();
    dispose?.();
    dispose = undefined;
});

/** The panel's real file manager toolbar with our slot output right after it, as the panel renders it. */
function renderToolbar(permissions = { create: true, update: true, delete: true, archive: true }) {
    const model = createTestFileManager({ permissions });
    const component = createComponentTestHost('server.files.manager', { extensionId: 'trash-bin', prefix: 'trash', model });
    const { Default, parts } = component.props;
    const NativeToolbar = parts.toolbar;
    const toolbar = (props: ComponentProps<typeof NativeToolbar>) => (
        <>
            <NativeToolbar {...props} />
            <TrashLink />
        </>
    );
    dispose = component.dispose;

    return render(<Default parts={{ toolbar }} />, { wrapper: component.Wrapper });
}

const findTrash = () => waitFor(() => screen.getByRole('button', { name: 'Trash' }));

/** What another extension (File Transfer) puts into the group. */
function otherHost(order: number) {
    const host = document.createElement('div');
    host.setAttribute('data-file-toolbar-host', String(order));
    host.style.display = 'contents';
    host.append(Object.assign(document.createElement('button'), { textContent: `Order ${order}` }));

    return host;
}

test('sits first in the native button group, before New folder', async () => {
    const { unmount } = renderToolbar();

    const trash = await findTrash();
    const folder = screen.getByRole('button', { name: 'New folder' });
    const host = trash.parentElement!;

    expect(host.getAttribute('data-file-toolbar-host')).toBe('20');
    expect(host.style.display).toBe('contents');
    expect(host.parentElement).toBe(folder.parentElement);
    expect(host.parentElement!.firstElementChild).toBe(host);
    expect(trash.className).toContain('trash:max-md:col-span-full!');

    unmount();
    expect(document.querySelector('[data-file-toolbar-host]')).toBeNull();
});

test('comes after the Transfer button and before later ones', async () => {
    renderToolbar();
    const trash = await findTrash();
    const group = screen.getByRole('button', { name: 'New folder' }).parentElement!;

    const transfer = otherHost(10);
    trash.parentElement!.after(transfer);
    await waitFor(() => expect(group.firstElementChild).toBe(transfer));
    expect(transfer.nextElementSibling).toBe(trash.parentElement);
    await waitFor(() => expect(trash.className).toContain('trash:max-md:col-span-1!'));

    const later = otherHost(30);
    transfer.after(later);
    await waitFor(() => expect(trash.parentElement!.nextElementSibling).toBe(later));
    expect(group.firstElementChild).toBe(transfer);
});

test('stays in the slot when there is no button group', async () => {
    renderToolbar({ create: false, update: false, delete: true, archive: true });

    const trash = await screen.findByRole('button', { name: 'Trash' });

    expect(trash.closest('[data-file-toolbar-host]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'New folder' })).toBeNull();
});
