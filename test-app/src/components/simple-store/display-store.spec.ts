import { newSpecPage } from '@stencil/core/testing';
import { SimpleStore } from './display-store';
import { reset } from '../../utils/greeting-store';

describe('some-store', () => {
  it('updates', async () => {
    reset();
    const { root, waitForChanges } = await newSpecPage({
      components: [SimpleStore],
      html: `<simple-store></simple-store>`,
    });
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>0</span>
        <span>0</span>
      </simple-store>
    `);
    await root.next();
    await waitForChanges();
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>1</span>
        <span>1</span>
      </simple-store>
    `);
    await root.next();
    await waitForChanges();
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>2</span>
        <span>4</span>
      </simple-store>
    `);
    reset();
    await waitForChanges();
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>0</span>
        <span>0</span>
      </simple-store>
    `);
  });

  it('resetting in a second test does not crash', async () => {
    reset();
    const { root, waitForChanges } = await newSpecPage({
      components: [SimpleStore],
      html: `<simple-store></simple-store>`,
    });
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>0</span>
        <span>0</span>
      </simple-store>
    `);
    await root.next();
    await waitForChanges();
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>1</span>
        <span>1</span>
      </simple-store>
    `);
    await root.next();
    await waitForChanges();
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>2</span>
        <span>4</span>
      </simple-store>
    `);
    reset();
    await waitForChanges();
    expect(root).toEqualHtml(`
      <simple-store>
        hola
        <span>0</span>
        <span>0</span>
      </simple-store>
    `);
  });
});
