import { createAsyncThunk } from '@reduxjs/toolkit';
import { packageService } from '@/services/package/package.service';
import {
    PackageItem,
    GetPackagesQuery,
    CreatePackageRequest,
    DeletePackageRequest,
    PackageId,
    TopicItem,
    UpdateTopicInPackagePayload,
    UpdateTopicInPackageRequest,
    UpdateTopicInPackageResponse,
    UpdatePackageRequest,
    IUpdatePackageResponse,
    CreatePackageResponse,
} from '@/services/package/package.type';

export const fetchPackages = createAsyncThunk<PackageItem[], GetPackagesQuery | undefined, { rejectValue: string }>(
    'package/fetchPackages',
    async (params, { rejectWithValue }) => {
        try {
            const res = await packageService.getPackages(params);
            return res.data;
        } catch (error: any) {
            if (error?.response?.data?.message) return rejectWithValue(error.response.data.message);
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch packages');
        }
    },
);

export const createPackage = createAsyncThunk<CreatePackageResponse, CreatePackageRequest, { rejectValue: string }>(
    'package/createPackage',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await packageService.createNewPackage(payload);
            return response.data;
        } catch (error: any) {
            if (error?.response?.data?.message) return rejectWithValue(error.response.data.message);
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to create package');
        }
    },
);

export const deletePackage = createAsyncThunk<DeletePackageRequest, DeletePackageRequest, { rejectValue: string }>(
    'package/deletePackage',
    async (payload, { rejectWithValue }) => {
        try {
            await packageService.deletePackage(payload);
            return payload;
        } catch (error: any) {
            if (error?.response?.data?.message) return rejectWithValue(error.response.data.message);
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete package');
        }
    },
);

export const fetchTopicsByPackage = createAsyncThunk<
    { packageId: PackageId; topics: TopicItem[] },
    PackageId,
    { rejectValue: string }
>('package/fetchTopicsByPackage', async (packageId, { rejectWithValue }) => {
    try {
        const res = await packageService.getTopicsByPackage(packageId);
        return { packageId, topics: res.data };
    } catch (error: any) {
        if (error?.response?.data?.message) return rejectWithValue(error.response.data.message);
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch topics');
    }
});

export const moveTopicToPackage = createAsyncThunk<
    UpdateTopicInPackageResponse,
    UpdateTopicInPackagePayload,
    { rejectValue: string }
>('package/moveTopicToPackage', async (payload, { rejectWithValue }) => {
    try {
        const res = await packageService.moveTopicToPackage({
            topicId: payload.topic.topicId!,
            packageId: payload.packageId,
        });
        return res.data;
    } catch (error: any) {
        if (error?.response?.data?.message) return rejectWithValue(error.response.data.message);
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to move topic');
    }
});

export const removeTopicInPackage = createAsyncThunk<
    UpdateTopicInPackageRequest,
    UpdateTopicInPackageRequest,
    { rejectValue: string }
>('package/removeTopicInPackage', async (payload, { rejectWithValue }) => {
    try {
        await packageService.removeTopicInPackage({
            topicId: payload.topicId,
            packageId: payload.packageId,
        });

        return payload;
    } catch (error: any) {
        if (error?.response?.data?.message) return rejectWithValue(error.response.data.message);
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to move topic');
    }
});

export const updatePackage = createAsyncThunk<IUpdatePackageResponse, UpdatePackageRequest, { rejectValue: string }>(
    'package/updatePackage',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await packageService.updatePackage(payload);
            return res.data;
        } catch (error: any) {
            if (error?.response?.data?.message) return rejectWithValue(error.response.data.message);
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to update package');
        }
    },
);
