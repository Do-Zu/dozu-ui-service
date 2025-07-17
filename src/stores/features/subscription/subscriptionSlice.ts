import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Plan } from '@/components/upgrade-plan/UpgradePlanModal';
import { RootState } from '@/stores/store';
import { getRequest } from '@/api/api';

// Async thunk to fetch subscription plans
export const fetchPlans = createAsyncThunk('subscription/fetchPlans', async (_, { rejectWithValue }) => {
    try {
        const response = await getRequest<unknown, Plan[]>('/subscription/plans');
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
    // Modal state
    isModalOpen: boolean;
    selectedPlan: number | null;

    // Plans data
    plans: Plan[];
    proPlans: Plan[];
    monthlyPlan: Plan | null;
    yearlyPlan: Plan | null;
    freePlan: Plan | null;

    // Loading and error states
    loading: boolean;
    error: string | null;
}

const initialState: SubscriptionState = {
    isModalOpen: false,
    selectedPlan: null,
    plans: [],
    proPlans: [],
    monthlyPlan: null,
    yearlyPlan: null,
    freePlan: null,
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
        setSelectedPlan: (state, action: PayloadAction<number | null>) => {
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

                // Filter and set plan types
                state.proPlans = action.payload.filter((plan) => plan.planType === 'pro');
                state.monthlyPlan = state.proPlans.find((plan) => plan.billingInterval === 'monthly') || null;
                state.yearlyPlan = state.proPlans.find((plan) => plan.billingInterval === 'yearly') || null;
                state.freePlan = action.payload.find((plan) => plan.planType === 'free') || null;

                // Set default selected plan to yearly if available, otherwise monthly
                if (state.selectedPlan === null) {
                    if (state.yearlyPlan) {
                        state.selectedPlan = state.yearlyPlan?.planId;
                    } else if (state.monthlyPlan) {
                        state.selectedPlan = state.monthlyPlan?.planId;
                    }
                }
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
