import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HitTester } from '../../src/xr/HitTester.js';

function makePose(x = 0, y = 0, z = -0.5) {
  const matrix = new Float32Array(16);
  matrix[0] = 1; matrix[5] = 1; matrix[10] = 1; matrix[15] = 1;
  matrix[12] = x; matrix[13] = y; matrix[14] = z;
  return { transform: { matrix, position: { x, y, z }, orientation: { x: 0, y: 0, z: 0, w: 1 } } };
}

function makeSession() {
  const viewerSpace = {};
  return {
    requestReferenceSpace: vi.fn().mockResolvedValue(viewerSpace),
    requestHitTestSource: vi.fn().mockResolvedValue({
      cancel: vi.fn(),
    }),
  };
}

describe('HitTester', () => {
  let tester;
  let session;
  const refSpace = {};

  beforeEach(async () => {
    tester = new HitTester();
    session = makeSession();
    await tester.init(session, refSpace);
  });

  it('emits hit event when results are found', () => {
    const pose = makePose(0, 0, -0.5);
    const hitResult = { getPose: vi.fn().mockReturnValue(pose) };
    const frame = { getHitTestResults: vi.fn().mockReturnValue([hitResult]) };

    const onHit = vi.fn();
    tester.on('hit', onHit);

    const result = tester.update(frame);
    expect(result).toBe(pose);
    expect(onHit).toHaveBeenCalledWith(pose);
  });

  it('emits miss event when no results', () => {
    const frame = { getHitTestResults: vi.fn().mockReturnValue([]) };

    const onMiss = vi.fn();
    tester.on('miss', onMiss);

    const result = tester.update(frame);
    expect(result).toBeNull();
    expect(onMiss).toHaveBeenCalled();
  });

  it('returns null before init source is ready', () => {
    const freshTester = new HitTester();
    const frame = { getHitTestResults: vi.fn() };
    expect(freshTester.update(frame)).toBeNull();
    expect(frame.getHitTestResults).not.toHaveBeenCalled();
  });

  it('initialises hit test source from viewer space', () => {
    expect(session.requestReferenceSpace).toHaveBeenCalledWith('viewer');
    expect(session.requestHitTestSource).toHaveBeenCalled();
  });

  it('dispose cancels the hit test source', () => {
    const cancelFn = vi.fn();
    tester._source = { cancel: cancelFn };
    tester.dispose();
    expect(cancelFn).toHaveBeenCalled();
    expect(tester._source).toBeNull();
  });
});
