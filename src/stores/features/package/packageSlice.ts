import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/stores/store';
import type { PackageId, PackageItem, TopicItem } from '@/services/package/package.type';
import { fetchPackages, createPackage, deletePackage, fetchTopicsByPackage, moveTopicToPackage } from './package.thunk';
import { PackageState } from './package.type';
import { isEmpty, safeDestructure } from '@/utils';

interface IPackage extends PackageItem {
    topics: TopicItem[];
}

const initialState: PackageState = {
    isLoading: false,
    error: null,
    packages: [],
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
        toggleExpendPackage: (state, action) => {
            const packageId = action.payload as PackageId;

            state.expendPackage = {
                ...state.expendPackage,
                [packageId]: !state.expendPackage[packageId],
            };
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
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPackage.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(createPackage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? 'Failed to create package';
            })
            // deletePackage
            .addCase(deletePackage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deletePackage.fulfilled, (state, action) => {
                state.isLoading = false;
                const removeId = String(action.payload.packageId);
                state.packages = state.packages.filter((p) => String(p.id) !== removeId);
                // Also clear cached topics for removed package
                if (state.topicsByPackage[removeId]) delete state.topicsByPackage[removeId];
            })
            .addCase(deletePackage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? 'Failed to delete package';
            })
            // fetchTopicsByPackage
            .addCase(fetchTopicsByPackage.pending, (state, action) => {
                const packageId = String(action.payload);
                state.topicsByPackage[packageId].isFetchingTopic = true;
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
                const packageId = String(action.payload);

                state.topicsByPackage[packageId] = {
                    ...state.topicsByPackage[packageId],
                    isFetchingTopic: false,
                    error: (action.payload as string) ?? 'Failed to fetch topics',
                };
            })
            // moveTopicToPackage
            .addCase(moveTopicToPackage.pending, (state, action) => {})
            .addCase(moveTopicToPackage.fulfilled, (state, action) => {
                const { topic, packageId: newPackageId } = action.payload;
                const topicIdStr = String(topic.topicId);

                // Remove from any existing package cache
                for (const [pkgKey, stateTopic] of Object.entries(state.topicsByPackage)) {
                    const { topics } = safeDestructure(stateTopic);

                    const idx = topics.findIndex((t) => String(t.topicId) === topicIdStr);
                    if (idx > 0) {
                        const [moved] = topics?.splice(idx, 1);

                        // Add to new package cache if moved exists

                        const newKey = String(newPackageId);

                        const next = state.topicsByPackage[newKey].topics ?? [];

                        if (moved) {
                            moved.packageId = newPackageId;
                            next.push(moved);
                            state.topicsByPackage[newKey].topics = next;
                        }

                        break;
                    }
                }
            })
            .addCase(moveTopicToPackage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? 'Failed to move topic';
            });
    },
});

export const { clearPackageError, toggleExpendPackage } = packageSlice.actions;

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
