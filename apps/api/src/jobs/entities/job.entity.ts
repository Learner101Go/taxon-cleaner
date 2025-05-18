import { JobState } from '../enums/job-state';

export class JobEntity {
  id: string;
  createdBy: string;
  source: string;
  state: JobState;
  totalChunks: number;
  processedChunks: number;
  createdAt: Date;
  updatedAt: Date;
  errors: string[];

  constructor(partial: Partial<JobEntity>) {
    Object.assign(this, partial);
    this.state = this.state || JobState.CREATED;
    this.createdAt = this.createdAt || new Date();
  }
}
