import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('lesson_completions')
@Unique(['userId', 'lessonId'])
export class LessonCompletion {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column('uuid')
  userId: string;

  @Column('uuid')
  lessonId: string;

  @ManyToOne(() => User, (user) => user.completions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.completions)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @CreateDateColumn()
  completedAt: Date;
}
