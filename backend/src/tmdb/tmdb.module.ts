import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TmdbController } from './tmdb.controller';
import { TmdbService } from './tmdb.service';

@Module({
    imports: [HttpModule],
    controllers: [TmdbController],
    providers: [TmdbService],
    exports: [TmdbService],
})
export class TmdbModule { }