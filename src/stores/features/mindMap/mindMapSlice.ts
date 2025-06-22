// // src/stores/slice/bookSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { applyNodeChanges, type Edge } from '@xyflow/react';

//  import {
//   type Edge,
//   type Node,
//   type OnNodesChange,
//   type OnEdgesChange,
//   type OnConnect,
// } from '@xyflow/react';
 
// export type AppNode = Node;
 
// export type AppState = {
//   nodes: AppNode[];
//   edges: Edge[];
//   onNodesChange: OnNodesChange<AppNode>;
//   onEdgesChange: OnEdgesChange;
//   onConnect: OnConnect;
//   setNodes: (nodes: AppNode[]) => void;
//   setEdges: (edges: Edge[]) => void;
// };


//  const initialEdges = [
//   { id: 'e1-2', source: '1', target: '2' },
//   { id: 'e2-3', source: '2', target: '3' },
// ] as Edge[];

// const initialNodes = [
//   {
//     id: '1',
//     type: 'input',
//     data: { label: 'Input' },
//     position: { x: 250, y: 25 },
//   },
 
//   {
//     id: '2',
//     data: { label: 'Default' },
//     position: { x: 100, y: 125 },
//   },
//   {
//     id: '3',
//     type: 'output',
//     data: { label: 'Output' },
//     position: { x: 250, y: 250 },
//   },
// ] as AppNode[];

// // interface AuthState {
// //   accessToken: string;

// //   userId: string;
// //   username: string;
// //   isAuthenticated: boolean;
// // }

// // const initialEdges=



// const initialState = {
//    nodes: initialNodes,
//   edges: initialEdges,
// };
// //todo: only temporary hardcode

// export const mindMapSlice = createSlice({
//   name: 'mindMap',
//   initialState,
//   reducers: {
//      onNodesChange: (changes) => {
//     set({
//       nodes: applyNodeChanges(changes, get().nodes),
//     });
//   },
//    onNodesChange: (state, action) => {
//     set({
//       nodes: applyNodeChanges(changes, get().nodes),
//     });
//   },
//    onNodesChangeReducer : (state, action) => {
//   return {
//     ...state,
//     nodes: applyNodeChanges(action.payload, state.nodes),
//   };
// },
//     updateAccessToken: (state, action: PayloadAction<string>) => {
//       state.accessToken = action.payload;
//     },
//     setCredentials: (
//       state,
//       action: PayloadAction<{
//         accessToken: string;
//         userId: string;
//         username: string;
//       }>,
//     ) => {
//       state.accessToken = action.payload.accessToken;
//       state.userId = action.payload.userId;
//       state.username = action.payload.username;
//       state.isAuthenticated = true;
//     },
//     logout: (state) => {
//       state.accessToken = '';

//       state.userId = '';
//       state.username = '';
//       state.isAuthenticated = false;
//     },
//   },
// });

// export const { updateAccessToken, setCredentials, logout } = authSlice.actions;

// export default authSlice.reducer;
