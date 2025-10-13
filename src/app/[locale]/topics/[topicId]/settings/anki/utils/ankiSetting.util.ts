import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';

class AnkiSettingUtil {
    public formatStepsForDisplay(steps: number[] | undefined): string {
        if (!steps) return '';
        const strings: string[] = [];

        for (const step of steps) {
            if (step % 1440 === 0) {
                strings.push(step / 1440 + 'd');
            } else if (step % 60 === 0) {
                strings.push(step / 60 + 'h');
            } else {
                strings.push(step + 'm');
            }
        }
        return strings.join(' ');
    }

    public validateSteps(steps: string) {
        const values: number[] = [];
        const strings: string[] = [];
        const tokens = steps.split(' ');
        const regex = /^\d+[a-zA-Z]$/;
        for (const token of tokens) {
            if (!regex.test(token)) {
                continue;
            }
            const lastChar = token[token.length - 1];
            const val = parseInt(token.substring(0, token.length - 1)) || 1;
            if (lastChar === 'm') {
                values.push(val);
                strings.push(token);
            }
            if (lastChar === 'h') {
                values.push(val * 60);
                strings.push(token);
            }
            if (lastChar === 'd') {
                values.push(val * 1440);
                strings.push(token);
            }
        }
        return {
            values,
            stringForDisplay: strings.join(' '),
        };
    }

    public getValidatedAnkiValue(
        field: keyof Omit<IAnkiSetting, 'ankiSettingId' | 'userId' | 'isDefault' | 'learningSteps' | 'relearningSteps'>,
        value: string,
    ): number {
        const num = parseFloat(value);
        let result = num;

        if (field === 'graduatingInterval') {
            result = Math.floor(this.clamp(num || 1, 1, 9999));
        } else if (field === 'easyInterval') {
            result = Math.floor(this.clamp(num || 1, 1, 9999));
        } else if (field === 'minimumInterval') {
            result = Math.floor(this.clamp(num || 1, 1, 9999));
        } else if (field === 'maximumInterval') {
            result = Math.floor(this.clamp(num || 1, 1, 36500));
        } else if (field === 'startingEase') {
            result = this.clamp(num || 1.31, 1.31, 5);
            result = Math.round(result * 100) / 100;
        } else if (field === 'easyBonus') {
            result = this.clamp(num || 1, 1, 5);
            result = Math.round(result * 100) / 100;
        } else if (field === 'intervalModifier') {
            result = this.clamp(num || 0.5, 0.5, 2);
            result = Math.round(result * 100) / 100;
        } else if (field === 'hardInterval') {
            result = this.clamp(num || 0.5, 0.5, 1.3);
            result = Math.round(result * 100) / 100;
        } else if (field === 'newInterval') {
            result = this.clamp(num || 0, 0, 1);
            result = Math.round(result * 100) / 100;
        } else if (field === 'newCardsPerDay') {
            result = Math.floor(this.clamp(num || 0, 0, 9999));
        } else if (field === 'maximumReviewsPerDay') {
            result = Math.floor(this.clamp(num || 0, 0, 9999));
        } else {
            result = num || 0;
        }

        return result;
    }

    private clamp(value: number, min: number, max: number): number {
        if (isNaN(value)) return min;
        return Math.min(Math.max(value, min), max);
    }
}

export default new AnkiSettingUtil();