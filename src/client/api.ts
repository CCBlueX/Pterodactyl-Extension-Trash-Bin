import { http } from '@pterodactyl/sdk';

export interface TrashItem {
    id: string;
    name: string;
    folder: string;
    directory: boolean;
    size: number | null;
    deleted_at: string;
}

export interface TrashContents {
    items: TrashItem[];
    size: number;
    retention_days: number;
    /** Whether the file manager's deletes go to the trash on this server. */
    enabled: boolean;
    /** Who last turned it on or off; `by` is null when that user is gone. */
    changed: { by: string | null; at: string } | null;
}

const trash = (id: string) => `/api/client/servers/${id}/extensions/trash-bin`;

export const keys = { trash: (id: string) => ['trash-bin', id] as const };

export const getTrash = async (id: string) => (await http.get<TrashContents>(trash(id))).data;
export const restoreItem = async (id: string, item: string) => (await http.post<{ path: string }>(`${trash(id)}/${item}/restore`)).data;
export const deleteItem = async (id: string, item: string) => (await http.delete<TrashContents>(`${trash(id)}/${item}`)).data;
export const emptyTrash = async (id: string) => (await http.delete<TrashContents>(trash(id))).data;
export const setTrashEnabled = async (id: string, enabled: boolean) => (await http.put<TrashContents>(`${trash(id)}/settings`, { enabled })).data;
export const deletePermanently = async (id: string, root: string, files: readonly string[]) => {
    await http.post(`${trash(id)}/delete-permanently`, { root, files });
};
