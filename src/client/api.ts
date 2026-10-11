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
}

const trash = (id: string) => `/api/client/servers/${id}/extensions/trash-bin`;

export const keys = { trash: (id: string) => ['trash-bin', id] as const };

export const getTrash = async (id: string) => (await http.get<TrashContents>(trash(id))).data;
export const restoreItem = async (id: string, item: string) => (await http.post<{ path: string }>(`${trash(id)}/${item}/restore`)).data;
export const deleteItem = async (id: string, item: string) => (await http.delete<TrashContents>(`${trash(id)}/${item}`)).data;
export const emptyTrash = async (id: string) => (await http.delete<TrashContents>(trash(id))).data;
