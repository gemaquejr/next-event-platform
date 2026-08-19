import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
    private readonly baseUrl = 'https://api.themoviedb.org/3';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async getPopularMovies() {
        const apiKey = this.configService.get<string>('TMDB_API_KEY');

        if (!apiKey) {
            throw new InternalServerErrorException(
                'TMDB_API_KEY is not configured',
            );
        }

        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}/movie/popular`, {
                    params: {
                        api_key: apiKey,
                        language: 'pt-BR',
                    },
                }),
            );

            return response.data;
        } catch {
            throw new InternalServerErrorException(
                'Failed to fetch movies from TMDb',
            );
        }
    }
}