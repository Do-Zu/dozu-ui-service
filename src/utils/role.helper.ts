class RoleHelper {
    public isStudent(role: string) {
        return role === 'student';
    }

    public isTeacher(role: string) {
        return role === 'teacher';
    }

    public isAdmin(role: string) {
        return role === 'admin';
    }
}

export default new RoleHelper();