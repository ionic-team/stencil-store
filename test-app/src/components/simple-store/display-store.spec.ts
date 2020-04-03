import { newSpecPage } from '@stencil/core/testing';
import { SimpleStore } from './display-store';
import { reset } from '../../utils/greeting-store';

describe('some-store', () => {
  it ('updates', async () => {
    const { root, waitForChanges } = await newSpecPage({
      components: [SimpleStore],
      html: `<simple-store></simple-store>`
    });
    expect(root).toEqualHtml('<simple-store>hola</simple-store>');
    await root.next();
    await waitForChanges();
    expect(root).toEqualHtml('<simple-store>0</simple-store>');

    await root.next();
    await waitForChanges();
    expect(root).toEqualHtml('<simple-store>1</simple-store>');
    reset();
    await waitForChanges();
    expect(root).toEqualHtml('<simple-store>hola</simple-store>');
  });
});
