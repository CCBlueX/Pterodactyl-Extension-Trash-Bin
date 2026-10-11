import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import TrashLink from './components/TrashLink';

export default definePterodactylExtension({
    setup({ screens, slots }) {
        screens.register('trash', () => import('./screens/TrashScreen'));
        slots.register('server.files.toolbar', TrashLink);
    },
});
