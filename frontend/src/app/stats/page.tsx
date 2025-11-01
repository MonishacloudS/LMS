"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserStats, UserStats } from "@/lib/api";

export default function StatsPage() {
  const userId = "default-user-id";
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await getUserStats(userId);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
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
          <div className="loading">Loading statistics...</div>
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
        <h1>Learning Statistics</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalCourses || 0}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalLessons || 0}</div>
            <div className="stat-label">Total Lessons</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.completedLessons || 0}</div>
            <div className="stat-label">Completed Lessons</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats?.completionPercentage || 0}%
            </div>
            <div className="stat-label">Completion Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.coursesInProgress || 0}</div>
            <div className="stat-label">Courses In Progress</div>
          </div>
        </div>
      </main>
    </div>
  );
}
