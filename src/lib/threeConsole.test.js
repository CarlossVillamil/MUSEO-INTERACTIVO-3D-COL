import { afterEach, describe, expect, it, vi } from 'vitest';
import { threeConsole } from './threeConsole';

describe('threeConsole', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('omite la advertencia de THREE.Clock causada por @react-three/fiber', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    threeConsole(
      'warn',
      'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.'
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('deja pasar las demás advertencias y errores', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    threeConsole('warn', 'THREE.Material: otra advertencia', 42);
    threeConsole('error', 'THREE.WebGLRenderer: un error');

    expect(warn).toHaveBeenCalledWith('THREE.Material: otra advertencia', 42);
    expect(error).toHaveBeenCalledWith('THREE.WebGLRenderer: un error');
  });
});
