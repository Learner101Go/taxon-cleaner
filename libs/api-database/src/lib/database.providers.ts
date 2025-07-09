import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PteridoAuthor } from './entities/pterido-authors.entity';
import { IpniAuthor } from './entities/ipni-authors.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const ds = new DataSource({
        type: 'mariadb',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        database: configService.get<string>('DB_NAME'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        entities: [IpniAuthor, PteridoAuthor], // or __dirname + '/../**/*.entity{.ts,.js}'
        synchronize: false,
      });
      return ds.initialize();
    },
    inject: [ConfigService],
  },
  {
    provide: 'IpniAuthorRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IpniAuthor),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PteridoAuthorRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PteridoAuthor),
    inject: ['DATA_SOURCE'],
  },
];
