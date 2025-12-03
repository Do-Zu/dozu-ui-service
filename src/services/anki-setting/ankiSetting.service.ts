import { deleteRequest, getRequest, patchRequest, postRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { IAnkiSetting, IUpdateAnkiSettingBody } from '@/types/anki-setting/ankiSetting.type';

class AnkiSettingService {
    public async getAllSettings(): Promise<IAnkiSetting[]> {
        const response = await getRequest<void, IAnkiSetting[]>(`/anki_settings`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getUserSettingsForTopic({
        topicId,
    }: {
        topicId: number;
    }): Promise<{ settings: IAnkiSetting[]; activeSettingId: number }> {
        const response = await getRequest<void, { settings: IAnkiSetting[]; activeSettingId: number }>(
            `/anki_settings/topic/${topicId}`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getDefaultSetting(): Promise<IAnkiSetting> {
        const response = await getRequest<void, IAnkiSetting>(`/anki_settings/default`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async createSetting({ name }: { name: string }) {
        const response = await postRequest<{ name: string }, IAnkiSetting>(`/anki_settings`, { name });
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateSetting({
        settingId,
        data,
    }: {
        settingId: number;
        data: IUpdateAnkiSettingBody;
    }): Promise<IAnkiSetting> {
        const response = await patchRequest<IUpdateAnkiSettingBody, IAnkiSetting>(`/anki_settings/${settingId}`, data);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateSettingAndAssignToTopic({
        settingId,
        data,
        topicId,
    }: {
        settingId: number;
        data: IUpdateAnkiSettingBody;
        topicId: number;
    }) {
        const response = await patchRequest<IUpdateAnkiSettingBody, IAnkiSetting>(
            `/anki_settings/${settingId}/assign_to_topic/${topicId}`,
            data,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async deleteSetting({ settingId }: { settingId: number }): Promise<number> {
        const response = await deleteRequest<void, ApiResponse<number>>(`/anki_settings/${settingId}`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new AnkiSettingService();
