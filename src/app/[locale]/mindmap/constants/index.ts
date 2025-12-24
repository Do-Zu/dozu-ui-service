export const radialLayoutElkOptions = {
    'elk.algorithm': 'radial',
};

export const mindmapLayoutElkOptions = {
    // 'force' is the ELK equivalent of Graphviz FDP (Force Directed Placement)
    'elk.algorithm': 'org.eclipse.elk.stress',
    'org.eclipse.elk.stress.desiredEdgeLength': '400',
    // You typically need to increase spacing for force layouts
    // 'org.eclipse.elk.spacing.nodeNode': '400',

    // Force specific options (optional, prevents nodes drifting too far)
    'org.eclipse.elk.force.iterations': '100',
    'org.eclipse.elk.force.repulsivePower': '4.0',
};
