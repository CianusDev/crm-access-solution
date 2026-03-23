import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoggerService] });
    service = TestBed.inject(LoggerService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('debug()', () => {
    it('devrait appeler console.debug avec le préfixe [DEBUG]', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      service.debug({ message: 'test debug' });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain('[DEBUG]');
      expect(spy.mock.calls[0][0]).toContain('test debug');
    });

    it('devrait passer les données comme second argument si fournies', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const data = { userId: 1 };
      service.debug({ message: 'test', data });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'), data);
    });

    it('ne devrait pas passer de second argument si aucune donnée', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      service.debug({ message: 'sans data' });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('sans data'));
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('info()', () => {
    it('devrait appeler console.info avec le préfixe [INFO]', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      service.info({ message: 'test info' });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain('[INFO]');
    });

    it('devrait inclure les données si fournies', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const data = { action: 'login' };
      service.info({ message: 'connexion', data });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('connexion'), data);
    });
  });

  describe('warn()', () => {
    it('devrait appeler console.warn avec le préfixe [WARN]', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.warn({ message: 'avertissement' });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain('[WARN]');
    });
  });

  describe('error()', () => {
    it('devrait appeler console.error avec le préfixe [ERROR]', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.error({ message: 'erreur critique' });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain('[ERROR]');
    });

    it('devrait inclure les données d\'erreur si fournies', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const data = { code: 500 };
      service.error({ message: 'erreur serveur', data });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('erreur serveur'), data);
    });
  });

  describe('formatMessage()', () => {
    it('devrait inclure un timestamp ISO dans le message formaté', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      service.debug({ message: 'msg' });
      const messageLoggé: string = spy.mock.calls[0][0];
      expect(messageLoggé).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });

    it('devrait inclure le texte du message dans le log formaté', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      service.info({ message: 'message personnalisé' });
      expect(spy.mock.calls[0][0]).toContain('message personnalisé');
    });
  });
});
