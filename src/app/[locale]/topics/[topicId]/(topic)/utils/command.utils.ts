import { ItemType } from '../components/note/CommandsView';

class CommandUtils {
    public getDisplayCommandGroupName(group: ItemType) {
        return group.charAt(0).toUpperCase() + group.slice(1);
    }
}

export default new CommandUtils();