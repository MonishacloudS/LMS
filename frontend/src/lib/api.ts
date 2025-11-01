import axios from "axios";
import {
  Course,
  Lesson,
  UserStats,
  SimilarCourse,
  SimilarCoursesResponse,
} from "./types";

const LMS_API_URL =
  process.env.NEXT_PUBLIC_LMS_API_URL || "http://localhost:3001";
const SIMILAR_API_URL =
  process.env.NEXT_PUBLIC_SIMILAR_API_URL || "http://localhost:3002";

const lmsApi = axios.create({
  baseURL: LMS_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const similarApi = axios.create({
  baseURL: SIMILAR_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getCourses(userId?: string): Promise<Course[]> {
  const params = userId ? { userId } : {};
  const response = await lmsApi.get<Course[]>("/courses", { params });
  return response.data;
}

export async function getCourse(
  courseId: string,
  userId?: string
): Promise<Course> {
  const params = userId ? { userId } : {};
  const response = await lmsApi.get<Course>(`/courses/${courseId}`, { params });
  return response.data;
}

export async function getLessons(courseId?: string): Promise<Lesson[]> {
  const params = courseId ? { courseId } : {};
  const response = await lmsApi.get<Lesson[]>("/lessons", { params });
  return response.data;
}

export async function completeLesson(
  lessonId: string,
  userId: string
): Promise<void> {
  await lmsApi.post(`/lessons/${lessonId}/complete`, null, {
    params: { userId },
  });
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const response = await lmsApi.get<UserStats>(`/users/${userId}/stats`);
  return response.data;
}

export async function getSimilarCourses(
  courseId: string
): Promise<SimilarCoursesResponse> {
  const response = await similarApi.get<SimilarCoursesResponse>(
    `/courses/${courseId}/similar`
  );
  return response.data;
}

export type {
  Course,
  Lesson,
  UserStats,
  SimilarCourse,
  SimilarCoursesResponse,
};
