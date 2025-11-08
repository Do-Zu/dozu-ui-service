export const mindmapLayoutElkOptions = {
    'elk.algorithm': 'radial',
    'elk.spacing.nodeNode': '150', // extra space between siblings
    'elk.radial.radius': '2.0',
    'elk.radial.minEdgeLength': '100', // avoid edge overlap
    // 'elk.radial.edges': 'STRAIGHT', // cleaner edges
    // 'elk.radial.toNode': 'PREFERRED_CHILD', // keeps child grouping predictable
    'elk.padding': '[top=50,left=50,bottom=50,right=50]', // margin around layout
    'elk.nodeSize.constraints': 'DEFAULT_MINIMUM_SIZE',
};
