class ClassworkUtils {
    public getStudentDisplayName({
        fullName,
        email,
        username,
    }: {
        fullName: string | null;
        email: string;
        username: string;
    }) {
        return fullName ?? email ?? username;
    }
}

export default new ClassworkUtils();
