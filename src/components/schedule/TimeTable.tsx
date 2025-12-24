import { HEIGHT_OF_EACH_SESSION_HOUR } from './constant';

const TimeTable = () => {
    const now = new Date();

    return (
        <div className="w-12 pr-2">
            {Array.from(Array(25).keys()).map((hour) => {
                return (
                    <div
                        className="relative text-right text-xs text-muted-foreground/50"
                        key={hour}
                        style={{ height: hour === 24 ? 0 : HEIGHT_OF_EACH_SESSION_HOUR }}
                    >
                        {now.getHours() === hour && (
                            <div
                                className="absolute  left-full h-[2px] w-dvw translate-x-2 bg-red-500"
                                style={{
                                    top: `${(now.getMinutes() / 60) * 100}%`,
                                }}
                            >
                                <div className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"></div>
                            </div>
                        )}
                        <p className="top-0 -translate-y-1/2">{hour === 24 ? 0 : hour}:00</p>
                    </div>
                );
            })}
        </div>
    );
};

export default TimeTable;
