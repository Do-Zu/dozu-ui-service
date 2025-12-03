// 'use client';
// import { useParams } from 'next/navigation';
// import useFetch from '@/hooks/useFetch';
// import LoadingPage from '@/app/loading';
// import classQuizTeacherService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizTeacher.service';
// import { IClassQuizListItem } from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
// import ClassQuizItem from '@/app/[locale]/class-based/(class-quiz)/components/ClassQuizItem';
// import { USER_ROLES } from '@/utils/constants/roles';

// export default function TeacherClassQuizListPage() {
//   const { id } = useParams<{ id: string }>();
//   const classId = Number(id);
//   const { data, loading, error } = useFetch<IClassQuizListItem[]>(
//     () => classQuizTeacherService.listClassQuizzes(classId)
//   );

//   if (loading) return <LoadingPage/>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="container mx-auto py-8 max-w-3xl">
//       <h1 className="text-2xl font-bold mb-6">Class Quizzes</h1>
//       <div className="flex flex-col divide-y divide-border">
//         {data?.map(q => (
//           <ClassQuizItem key={q.classQuizId} role={USER_ROLES.TEACHER} quiz={q} classIdForRoute={classId}/>
//         ))}
//       </div>
//     </div>
//   );
// }
