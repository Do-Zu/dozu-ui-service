import { createAsyncThunk } from "@reduxjs/toolkit";
import { TopicDispatch, TopicState } from "./store";

export const createTopicAsyncThunk = createAsyncThunk.withTypes<{
    state: TopicState;
    dispatch: TopicDispatch;
}>();
