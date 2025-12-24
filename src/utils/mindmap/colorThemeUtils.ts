import { COLOR_THEMES } from '@/app/[locale]/topics/[topicId]/(topic)/constants/mindmap/colorTheme.constant';
import { AppEdge, AppNode, IColorMode, IColorTheme } from '@/types/mindmap/mindmap.type';

class ColorThemeUtils {
    private getNodesByDepth(
        adj: Map<string, string[]>,
        visited: Map<string, boolean>,
        currentNode: string,
        depth: number,
        res: Map<number, string[]>,
    ) {
        visited.set(currentNode, true);
        const sameDepthNodes = res.get(depth);
        if (!sameDepthNodes) res.set(depth, [currentNode]);
        else sameDepthNodes.push(currentNode);

        const adjacentVertices = adj.get(currentNode) ?? [];
        for (const nodeId of adjacentVertices) {
            if (!visited.get(nodeId)) {
                this.getNodesByDepth(adj, visited, nodeId, depth + 1, res);
            }
        }
    }

    private colorByDepth(nodesByDepth: Map<number, string[]>, colors: string[], res: Map<string, string>) {
        let currentColorIndex = 0;
        nodesByDepth.forEach((sameDepthNodes, depth) => {
            for (const nodeId of sameDepthNodes) {
                res.set(nodeId, colors[currentColorIndex]);
            }
            currentColorIndex = (currentColorIndex + 1) % colors.length;
        });
    }

    private colorByBranch(
        adj: Map<string, string[]>,
        visited: Map<string, boolean>,
        currentNode: string,
        depth: number,
        colors: string[],
        currentColorIndex: { value: number },
        res: Map<string, string>,
    ) {
        visited.set(currentNode, true);
        if (depth === 1) {
            currentColorIndex.value = (currentColorIndex.value + 1) % colors.length;
        }
        res.set(currentNode, colors[currentColorIndex.value]);

        const adjacentVertices = adj.get(currentNode) ?? [];
        for (const nodeId of adjacentVertices) {
            if (!visited.get(nodeId)) {
                this.colorByBranch(adj, visited, nodeId, depth + 1, colors, currentColorIndex, res);
            }
        }
    }

    public changeColorTheme = ({
        nodes,
        edges,
        colorTheme,
        colorMode,
    }: {
        nodes: AppNode[];
        edges: AppEdge[];
        colorTheme: IColorTheme;
        colorMode: IColorMode;
    }) => {
        const rootNode = nodes.find((item) => item.data.isRoot === true);
        if (!rootNode || !nodes.length || !edges.length || !colorTheme.colors.length) {
            return null;
        }
        const adj = new Map<string, string[]>();
        edges.forEach((edge) => {
            const adjacentVertices = adj.get(edge.source);
            if (!adjacentVertices) adj.set(edge.source, [edge.target]);
            else adjacentVertices.push(edge.target);
        });

        const visited = new Map<string, boolean>();
        nodes.forEach((item) => {
            visited.set(item.data.nodeId, false);
        });
        const result = new Map<string, string>();
        if (colorMode === 'branch') {
            this.colorByBranch(adj, visited, rootNode.data.nodeId, 0, colorTheme.colors, { value: 0 }, result);
        } else if (colorMode === 'depth') {
            const nodesByDepth = new Map<number, string[]>();
            this.getNodesByDepth(adj, visited, rootNode.data.nodeId, 0, nodesByDepth);
            this.colorByDepth(nodesByDepth, colorTheme.colors, result);
        }

        return result;
    };

    public getNodeColors(nodes: AppNode[]) {
        const colorsFound: string[] = [];
        nodes.forEach((item) => {
            if (item.data.color && !colorsFound.includes(item.data.color)) colorsFound.push(item.data.color);
        });
        let result = colorsFound;
        for (const colorTheme of COLOR_THEMES) {
            let ok = true;
            for (const color of colorsFound) {
                if (!colorTheme.colors.includes(color)) ok = false;
            }
            if (ok) {
                result = colorTheme.colors;
                break;
            }
        }
        return result;
    }
}

export default new ColorThemeUtils();
