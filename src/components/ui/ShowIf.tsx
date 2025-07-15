interface Props {
    when: boolean;
    children: React.ReactNode;
}

export function ShowIf({ when, children } : Props) {
    return when ? children : null;
}