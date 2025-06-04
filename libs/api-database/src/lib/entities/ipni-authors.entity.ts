import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'ipni_authors' })
export class IpniAuthor {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ name: 'author_name' })
  authorName: string | undefined;

  @Column({ name: 'author_forename', nullable: true })
  authorForename: string | undefined;

  @Column({ name: 'author_surname', nullable: true })
  authorSurname: string | undefined;

  @Column({ name: 'standard_form', nullable: true })
  standardForm: string | undefined;
}
