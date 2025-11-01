import Link from "next/link";
import { getCourses, Course } from "@/lib/api";
import "./globals.css";

export default async function Home() {
  const courses = await getCourses();

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
        <h1>Available Courses</h1>
        <div className="course-list">
          {courses.map((course: Course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <div className="course-card">
                <h2 className="course-title">{course.title}</h2>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="course-meta">
                  {course.category && <span>Category: {course.category}</span>}
                  {course.completionPercentage !== undefined && (
                    <span>{course.completionPercentage}% Complete</span>
                  )}
                </div>
                {course.completionPercentage !== undefined && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.completionPercentage}%` }}
                    />
                  </div>
                )}
                {course.tags && course.tags.length > 0 && (
                  <div>
                    {course.tags.map((tag: string, index: number) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
