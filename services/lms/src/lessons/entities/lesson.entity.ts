import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { LessonCompletion } from '../../users/entities/lesson-completion.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('lessons')
export class Lesson {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column('int')
  orderIndex: number;

  @Column('uuid')
  courseId: string;

  @ManyToOne(() => Course, (course) => course.lessons)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => LessonCompletion, (completion) => completion.lesson)
  completions: LessonCompletion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
