"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  getLessons,
  completeLesson,
  getSimilarCourses,
  Course,
  Lesson,
  SimilarCourse,
} from "@/lib/api";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const userId = "default-user-id";

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [similarCourses, setSimilarCourses] = useState<SimilarCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData, similarData] = await Promise.all([
        getCourse(courseId, userId),
        getLessons(courseId),
        getSimilarCourses(courseId).catch(() => ({ similarCourses: [] })),
      ]);

      setCourse(courseData);
      setLessons(lessonsData);

      const completedSet = new Set<string>();
      lessonsData.forEach((lesson: Lesson) => {
        if (lesson.completed) {
          completedSet.add(lesson.id);
        }
      });
      setCompletedLessons(completedSet);

      // Also check for completed lessons from the API
      // The lessons endpoint doesn't return completion status,
      // so we'll check separately

      if (similarData?.similarCourses) {
        setSimilarCourses(similarData.similarCourses);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      await completeLesson(lessonId, userId);
      setCompletedLessons(new Set([...completedLessons, lessonId]));
    } catch (err: any) {
      setError(err.message || "Failed to complete lesson");
    }
  };

  if (loading) {
    return (
      <div>
        <header className="header">
          <div className="container">
            <nav>
              <Link href="/">Courses</Link>
              <Link href="/stats">Statistics</Link>
            </nav>
          </div>
        </header>
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="header">
          <div className="container">
            <nav>
              <Link href="/">Courses</Link>
              <Link href="/stats">Statistics</Link>
            </nav>
          </div>
        </header>
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <nav>
            <Link href="/">Courses</Link>
            <Link href="/stats">Statistics</Link>
          </nav>
        </div>
      </header>
      <main className="container">
        <Link href="/">
          <button
            className="button button-secondary"
            style={{ marginBottom: "1rem" }}
          >
            ← Back to Courses
          </button>
        </Link>
        <h1>{course?.title}</h1>
        {course?.description && (
          <p style={{ marginTop: "1rem", color: "#6b7280" }}>
            {course.description}
          </p>
        )}

        {course?.completionPercentage !== undefined && (
          <div style={{ marginTop: "1rem" }}>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${course.completionPercentage}%` }}
              />
            </div>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "#6b7280",
              }}
            >
              {course.completionPercentage}% Complete
            </p>
          </div>
        )}

        <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Lessons</h2>
        <ul className="lesson-list">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className={`lesson-item ${
                completedLessons.has(lesson.id) ? "completed" : ""
              }`}
            >
              <div>
                <h3>{lesson.title}</h3>
                {lesson.content && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginTop: "0.5rem",
                    }}
                  >
                    {lesson.content.substring(0, 100)}...
                  </p>
                )}
              </div>
              {!completedLessons.has(lesson.id) ? (
                <button
                  className="button"
                  onClick={() => handleCompleteLesson(lesson.id)}
                >
                  Mark Complete
                </button>
              ) : (
                <span style={{ color: "#10b981", fontWeight: 600 }}>
                  ✓ Completed
                </span>
              )}
            </li>
          ))}
        </ul>

        {similarCourses.length > 0 && (
          <div className="similar-courses">
            <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
              Similar Courses
            </h2>
            <div className="course-list">
              {similarCourses.map((similarCourse) => (
                <Link
                  key={similarCourse.id}
                  href={`/courses/${similarCourse.id}`}
                >
                  <div className="course-card">
                    <h3 className="course-title">{similarCourse.title}</h3>
                    {similarCourse.description && (
                      <p className="course-description">
                        {similarCourse.description}
                      </p>
                    )}
                    <div className="course-meta">
                      {similarCourse.similarityScore !== undefined && (
                        <span>{similarCourse.similarityScore}% Similar</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
