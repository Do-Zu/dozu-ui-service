import { getRequest, patchRequest } from '@/api/api';
import { IAnkiSetting, IUpdateAnkiSettingBody } from '@/types/anki-setting/ankiSetting.type';

class AnkiSettingService {
    public async getDefaultSetting(): Promise<IAnkiSetting> {
        const response = await getRequest<void, IAnkiSetting>(`/anki_settings/default`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateSetting({ settingId, data }: { settingId: number; data: IUpdateAnkiSettingBody }) {
        const response = await patchRequest<IUpdateAnkiSettingBody, IAnkiSetting>(`/anki_settings/${settingId}`, data);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new AnkiSettingService();
