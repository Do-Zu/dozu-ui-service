export function shallowCompareProps(prev: Record<string, any>, next: Record<string, any>): boolean {
    const allKeys = [...Object.keys(prev), ...Object.keys(next)];

    const keySet: Record<string, boolean> = {};
    allKeys.forEach(key => (keySet[key] = true));

    for (const key in keySet) {
        if (prev[key] !== next[key]) {
            return false;
        }
    }
    return true;
}

export function comparePropsDiff(prev: Record<string, any>, next: Record<string, any>) {
    const allKeys = [...Object.keys(prev), ...Object.keys(next)];
    const keySet: Record<string, boolean> = {};
    allKeys.forEach(key => (keySet[key] = true));

    for (const key in keySet) {
        if (prev[key] !== next[key]) {
            console.log(`Prop changed: "${key}"`);
            console.log('Prev:', prev[key]);
            console.log('Next:', next[key]);
        }
    }
}
