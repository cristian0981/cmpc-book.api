import { Module } from '@nestjs/common';
import { CookiesService } from './services/cookie.service';

@Module({
    providers: [CookiesService],
    exports: [CookiesService],
})
export class CommonModule {}
