import { Controller, Get } from '@nestjs/common';

import { TmdbService } from './tmdb.service';

@Controller('tmdb')
export class TmdbController {
    constructor(private readonly tmdbService: TmdbService) { }

    @Get('movies/popular')
    getPopularMovies() {
        return this.tmdbService.getPopularMovies();
    }
}