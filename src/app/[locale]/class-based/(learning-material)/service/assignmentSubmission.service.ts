// import { getRequest, postRequest, putRequest } from '@/api/api';
// import {
//     IAssignmentSubmission,
//     IAssignmentSubmissionWithAttachments,
//     IAssignmentSubmissionWithStudent,
//     IAssignmentSubmissionWithStudentDetails,
//     IGradeAssignmentSubmissionPayload,
//     InsertAssignmentSubmissionBody,
//     IUpdateAssignmentSubmissionBody,
//     IUpdatedAssignmentSubmission,
// } from '../types/assignmentSubmission.type';
// import { AxiosError, HttpStatusCode } from 'axios';

// export interface IUpdateAssignmentSubmissionPayload {
//     assignmentId: number;
//     submissionId: number;
//     data: IUpdateAssignmentSubmissionBody;
// }

// class AssignmentSubmissionService {
//     public async getAssignmentSubmissionWithAttachments({ assignmentId }: { assignmentId: number }) {
//         try {
//             const response = await getRequest<unknown, IAssignmentSubmissionWithAttachments>(
//                 `/assignments/${assignmentId}/submissions`,
//             );
//             if (response.status !== 'success') {
//                 throw new Error(response.message);
//             }
//             return response.data;
//         } catch (err) {
//             if (err instanceof AxiosError) {
//                 if (err.status === HttpStatusCode.NotFound || err.response?.status === HttpStatusCode.NotFound) {
//                     const response = await postRequest<InsertAssignmentSubmissionBody, IAssignmentSubmission>(
//                         `/assignments/${assignmentId}/submissions`,
//                         {},
//                     );
//                     if (response.status !== 'created') {
//                         throw new Error(response.message);
//                     }
//                     const result: IAssignmentSubmissionWithAttachments = {
//                         assignmentSubmission: response.data,
//                         attachments: [],
//                     };
//                     return result;
//                 }
//             }
//             throw err;
//         }
//     }

//     public async updateAssignmentSubmission({ assignmentId, submissionId, data }: IUpdateAssignmentSubmissionPayload) {
//         const response = await putRequest<IUpdateAssignmentSubmissionBody, IUpdatedAssignmentSubmission>(
//             `/assignments/${assignmentId}/submissions/${submissionId}`,
//             data,
//         );
//         if (response.status !== 'success') {
//             throw new Error(response.message);
//         }
//         return response.data;
//     }

//     public async getAssignmentSubmissionsOfStudents({ assignmentId }: { assignmentId: number }) {
//         const response = await getRequest<unknown, IAssignmentSubmissionWithStudentDetails[]>(
//             `/assignments/${assignmentId}/submissions/all`,
//         );
//         if (response.status !== 'success') {
//             throw new Error(response.message);
//         }
//         return response.data;
//     }

//     public async gradeAssignmentSubmission({ assignmentId, submissionId, grade }: IGradeAssignmentSubmissionPayload) {
//         const response = await putRequest<{ grade: number }, IAssignmentSubmission>(
//             `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
//             { grade },
//         );
//         if (response.status !== 'success') {
//             throw new Error(response.message);
//         }
//         return response.data;
//     }
// }

// export default new AssignmentSubmissionService();
