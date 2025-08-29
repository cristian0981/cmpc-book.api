import { Test, TestingModule } from '@nestjs/testing';
import { CommonModule } from './common.module';
import { CookiesService } from './services/cookie.service';

describe('CommonModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide CookiesService', () => {
    const cookiesService = module.get<CookiesService>(CookiesService);
    expect(cookiesService).toBeDefined();
    expect(cookiesService).toBeInstanceOf(CookiesService);
  });

  it('should export CookiesService', async () => {
    const exportedService = module.get<CookiesService>(CookiesService);
    expect(exportedService).toBeDefined();
  });
});