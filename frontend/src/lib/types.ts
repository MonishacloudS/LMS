export interface Course {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  completionPercentage?: number;
  lessons?: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  orderIndex: number;
  courseId: string;
  completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  coursesInProgress: number;
}

export interface SimilarCourse {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  similarityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SimilarCoursesResponse {
  courseId: string;
  similarCourses: SimilarCourse[];
}
