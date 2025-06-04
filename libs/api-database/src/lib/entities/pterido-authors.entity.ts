import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'pterido_authors' })
export class PteridoAuthor {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ name: 'scientific_name' })
  scientificName: string | undefined;

  @Column({ name: 'author_name' })
  authorName: string | undefined;
}
