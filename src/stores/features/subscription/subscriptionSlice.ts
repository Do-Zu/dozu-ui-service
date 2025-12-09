import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Plan } from '@/components/upgrade-plan/UpgradePlanModal';
import { RootState } from '@/stores/store';
import { getRequest } from '@/api/api';

// Async thunk to fetch subscription plans
export const fetchPlans = createAsyncThunk('subscription/fetchPlans', async (_, { rejectWithValue }) => {
    try {
        const response = await getRequest<unknown, Plan[]>('/subscription/upgrade/available-plan');
        return response.data;
    } catch (error: any) {
        // Handle API error response
        if (error.response?.data?.message) {
            return rejectWithValue(error.response.data.message);
        }
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch plans');
    }
});

interface SubscriptionState {
    isModalOpen: boolean;
    selectedPlan: Plan | null;
    plans: Plan[];
    loading: boolean;
    error: string | null;
}

const initialState: SubscriptionState = {
    isModalOpen: false,
    selectedPlan: null,
    plans: [],
    loading: false,
    error: null,
};

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        openModal: (state) => {
            state.isModalOpen = true;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
        },
        setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
            state.selectedPlan = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlans.fulfilled, (state, action) => {
                state.loading = false;
                state.plans = action.payload;
            })
            .addCase(fetchPlans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { openModal, closeModal, setSelectedPlan, clearError } = subscriptionSlice.actions;

export const selectSubscriptionState = (state: RootState) => state.subscription;

export default subscriptionSlice.reducer;
