import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PackageId, PackageItem, TopicItem } from '@/services/package/package.type';
import {
    fetchPackages,
    createPackage,
    deletePackage,
    fetchTopicsByPackage,
    moveTopicToPackage,
    removeTopicInPackage,
    updatePackage,
} from './package.thunk';
import { PackageState } from './package.type';
import { compareIgnoreCapitalization, isNilOrEmpty, safeDestructure } from '@/utils';

interface IPackage extends PackageItem {
    topics: TopicItem[];
}

const initialState: PackageState = {
    isLoading: false,
    isUpdating: false,
    error: null,
    packages: [],
    selectedTopicId: null,
    topicsByPackage: {},
    expendPackage: {},
};

const packageSlice = createSlice({
    name: 'package',
    initialState,
    reducers: {
        clearPackageError: (state) => {
            state.error = null;
        },
        openPackage: (state, action) => {
            const packageId = action.payload as PackageId;
            state.expendPackage = {
                ...state.expendPackage,
                [packageId]: true,
            };
        },
        toggleExpendPackage: (state, action) => {
            const packageId = action.payload as PackageId;

            state.expendPackage = {
                ...state.expendPackage,
                [packageId]: !state.expendPackage[packageId],
            };
        },
        setSelectingTopicId: (state, action) => {
            const topicId = action.payload;
            state.selectedTopicId = topicId;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchPackages
            .addCase(fetchPackages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPackages.fulfilled, (state, action: PayloadAction<PackageItem[]>) => {
                state.isLoading = false;
                state.packages = action.payload;
            })
            .addCase(fetchPackages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? 'Failed to fetch packages';
            })
            // createPackage
            .addCase(createPackage.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(createPackage.fulfilled, (state, action) => {
                const { packageId, title, parentId } = safeDestructure(action.payload);

                state.isUpdating = false;

                if (isNilOrEmpty(packageId) || isNilOrEmpty(title)) return;

                state.packages.push({
                    id: packageId,
                    title,
                    parentId,
                });
            })
            .addCase(createPackage.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = (action.payload as string) ?? 'Failed to create package';
            })
            // deletePackage
            .addCase(deletePackage.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(deletePackage.fulfilled, (state, action) => {
                state.isUpdating = false;
                const removeId = String(action.payload.packageId);
                state.packages = state.packages.filter((p) => String(p.id) !== removeId);
                // Also clear cached topics for removed package
                if (state.topicsByPackage[removeId]) delete state.topicsByPackage[removeId];
            })
            .addCase(deletePackage.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = (action.payload as string) ?? 'Failed to delete package';
            })
            // fetchTopicsByPackage
            .addCase(fetchTopicsByPackage.pending, (state, action) => {
                const packageId = String(action.meta.arg);
                if (!state.topicsByPackage[packageId]) {
                    state.topicsByPackage[packageId] = { isFetchingTopic: true, topics: [], error: null };
                } else {
                    state.topicsByPackage[packageId].isFetchingTopic = true;
                    state.topicsByPackage[packageId].error = null;
                }
            })
            .addCase(fetchTopicsByPackage.fulfilled, (state, action) => {
                const key = String(action.payload.packageId);

                state.topicsByPackage[key] = {
                    isFetchingTopic: false,
                    topics: action.payload.topics,
                    error: null,
                };
            })
            .addCase(fetchTopicsByPackage.rejected, (state, action) => {
                const packageId = String(action.meta.arg);
                state.topicsByPackage[packageId] = {
                    ...(state.topicsByPackage[packageId] ?? { topics: [] }),
                    isFetchingTopic: false,
                    error: (action.payload as string) ?? 'Failed to fetch topics',
                };
            })
            // moveTopicToPackage
            .addCase(moveTopicToPackage.pending, (state) => {
                // no-op or set a transient flag if needed
            })
            .addCase(moveTopicToPackage.fulfilled, (state, action) => {
                const updated = action.payload; // TopicItem from server
                if (!updated) return;

                const topicIdStr = String(updated.topicId);
                // Remove from any existing package cache
                for (const [pkgKey, stateTopic] of Object.entries(state.topicsByPackage)) {
                    const { topics } = safeDestructure(stateTopic);
                    const idx = topics.findIndex((t) => String(t.topicId) === topicIdStr);
                    if (idx >= 0) {
                        topics.splice(idx, 1);
                        break;
                    }
                }

                const newKey = String(updated.packageId);
                if (!state.topicsByPackage[newKey]) {
                    state.topicsByPackage[newKey] = { isFetchingTopic: false, topics: [], error: null };
                }
                const next = state.topicsByPackage[newKey].topics ?? [];
                // Avoid duplicate push if exists
                if (!next.some((t) => String(t.topicId) === topicIdStr)) {
                    next.push(updated);
                }
                state.topicsByPackage[newKey].topics = next;
            })
            .addCase(removeTopicInPackage.rejected, (state, action) => {
                state.error = (action.payload as string) ?? 'Failed to move topic';
            })
            .addCase(removeTopicInPackage.pending, (state, action) => {})
            .addCase(removeTopicInPackage.fulfilled, (state, action) => {
                const { topicId, packageId: oldPackageId } = action.payload;
                const topicIdStr = String(topicId);
                const packageIdStr = String(oldPackageId);

                const current = state.topicsByPackage[packageIdStr]?.topics ?? [];
                const filtered = current.filter(
                    (topic) => !compareIgnoreCapitalization(topicIdStr, String(topic.topicId)),
                );
                if (!state.topicsByPackage[packageIdStr]) {
                    state.topicsByPackage[packageIdStr] = { isFetchingTopic: false, topics: [], error: null };
                }
                state.topicsByPackage[packageIdStr].topics = filtered;
            })
            .addCase(moveTopicToPackage.rejected, (state, action) => {
                state.error = (action.payload as string) ?? 'Failed to move topic';
            })
            // updatePackage (rename)
            .addCase(updatePackage.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updatePackage.fulfilled, (state, action) => {
                state.isUpdating = false;
                const updated = action.payload; // { id, title, parentId }
                const idx = state.packages.findIndex((p) => String(p.id) === String(updated.id));
                if (idx >= 0) {
                    state.packages[idx] = { ...state.packages[idx], title: updated.title };
                }
            })
            .addCase(updatePackage.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = (action.payload as string) ?? 'Failed to update package';
            });
    },
});

export const { clearPackageError, toggleExpendPackage, setSelectingTopicId } = packageSlice.actions;

// Selectors

// export const selectPackageState = (state: RootState) => state.package;
// export const selectPackages = (state: RootState) => state.package.packages;
// export const selectIsPackageLoading = (state: RootState) => state.package.isLoading;
// export const selectPackageError = (state: RootState) => state.package.error;
// export const selectTopicsByPackageId = (packageId: PackageId) => (state: RootState) =>
//     state.package.topicsByPackage[String(packageId)] ?? [];
// export const selectPackageById = (packageId: PackageId) => (state: RootState) =>
//     state.package.packages.find((p) => String(p.id) === String(packageId)) ?? null;

export default packageSlice.reducer;
