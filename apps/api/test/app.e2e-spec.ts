import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      statusCode: 200,
      message: null,
      data: 'Hello World!',
      success: true,
    });
  });

  it('/user (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/user')
      .expect(200);

    expect(response.body).toMatchObject({
      statusCode: 200,
      message: null,
      success: true,
      data: { id: '1', name: 'Ada Lovelace', email: 'ada@formlyst.dev' },
    });
  });

  it('/greet (GET) validates the query and uses generateResponse()', () => {
    return request(app.getHttpServer())
      .get('/greet?name=Ada')
      .expect(200)
      .expect({
        statusCode: 200,
        message: 'Greeting generated for Ada',
        data: { greeting: 'Hello, Ada!' },
        success: true,
      });
  });

  it('/greet (GET) without a name fails validation with structured errors', async () => {
    const response = await request(app.getHttpServer())
      .get('/greet')
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed for request query',
      success: false,
      errors: [{ path: 'name' }],
    });
  });

  it('unknown routes are shaped by the global exception filter', async () => {
    const response = await request(app.getHttpServer())
      .get('/does-not-exist')
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      success: false,
    });
    expect(typeof response.body.message).toBe('string');
  });

  afterEach(async () => {
    await app.close();
  });
});
